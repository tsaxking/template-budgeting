import { attemptAsync } from '../../../shared/check';
import { EventEmitter } from '../../../shared/event-emitter';
import { ServerRequest } from '../../utilities/requests';
import { Cache } from '../cache';
import { BalanceCorrection as B } from '../../../shared/db-types-extended';
import { socket } from '../../utilities/socket';
import { Bucket } from './bucket';
import { Bucket as BK } from '../../../shared/db-types-extended';
import { Transaction } from './transaction';
import { Random } from '../../../shared/math';

type BalanceCorrectionEvents = {
    update: undefined;
};

type GlobalBalanceCorrectionEvents = {
    new: BalanceCorrection;
    update: BalanceCorrection;
    archive: BalanceCorrection;
};

export class BalanceCorrection extends Cache<BalanceCorrectionEvents> {
    public static readonly cache = new Map<string, BalanceCorrection>();

    public static readonly emitter = new EventEmitter<
        keyof GlobalBalanceCorrectionEvents
    >();

    public static on<K extends keyof GlobalBalanceCorrectionEvents>(
        event: K,
        callback: (data: GlobalBalanceCorrectionEvents[K]) => void
    ): void {
        this.emitter.on(event, callback);
    }

    public static off<K extends keyof GlobalBalanceCorrectionEvents>(
        event: K,
        callback?: (data: GlobalBalanceCorrectionEvents[K]) => void
    ): void {
        this.emitter.off(event, callback);
    }

    public static emit<K extends keyof GlobalBalanceCorrectionEvents>(
        event: K,
        data: GlobalBalanceCorrectionEvents[K]
    ): void {
        this.emitter.emit(event, data);
    }

    public static async new(data: {
        bucketId: string;
        balance: number;
        date: number;
    }) {
        return ServerRequest.post('/api/balance-correction/new', data);
    }

    public static async all() {
        return attemptAsync(async () => {
            // if (BalanceCorrection.cache.size)
            //     return Array.from(BalanceCorrection.cache.values());

            const res = await ServerRequest.post<B[]>(
                '/api/balance-correction/all'
            );
            if (res.isErr()) throw res.error;

            return res.value
                .map(BalanceCorrection.retrieve)
                .sort((a, b) => a.date - b.date);
        });
    }

    public static retrieve(data: B) {
        const correction = BalanceCorrection.cache.get(data.id);
        if (correction) return correction;

        return new BalanceCorrection(data);
    }

    public readonly id: string;
    public date: number;
    public balance: number; // in cents
    public bucketId: string;

    constructor(data: B) {
        super();
        this.id = data.id;
        this.date = +data.date;
        this.balance = +data.balance;
        this.bucketId = data.bucketId;

        if (BalanceCorrection.cache.has(this.id)) {
            throw new Error('Balance correction already exists');
        } else {
            BalanceCorrection.cache.set(this.id, this);
        }
    }

    update(data: Partial<{ date: number; balance: number; bucketId: string }>) {
        return ServerRequest.post('/api/balance-correction/update', {
            id: this.id,
            date: data.date ?? this.date,
            balance: data.balance ?? this.balance,
            bucketId: data.bucketId ?? this.bucketId
        });
    }

    delete() {
        return attemptAsync(async () => {
            this.destroy();
            const res = await ServerRequest.post(
                '/api/balance-correction/delete',
                {
                    id: this.id
                }
            );

            if (res.isErr()) throw res.error;

            return res.value;
        });
    }

    async getBucket() {
        return attemptAsync(async () => {
            const bucket = Bucket.cache.get(this.bucketId);
            if (bucket) return bucket;

            const res = (
                await ServerRequest.post<BK>('/api/bucket/get', this.bucketId)
            ).unwrap();

            return Bucket.retrieve(res);
        });
    }

    build() {
        return attemptAsync(async () => {
            const bucket = (await this.getBucket()).unwrap();
            const balance = (await bucket.getBalance(this.date - 1)).unwrap(); // get balance before correction
            return new Transaction(
                {
                    id: Random.uuid(),
                    date: this.date,
                    amount: Math.abs(this.balance - balance), // pos/neg is determined by type
                    bucketId: this.bucketId,
                    description: 'Balance correction',
                    status: 'completed',
                    subtypeId: '',
                    taxDeductible: 0,
                    type: this.balance > balance ? 'deposit' : 'withdrawal',
                    archived: 0,
                    picture: null,
                    transfer: 0
                },
                {
                    save: false,
                    type: 'balance-correction'
                }
            );
        });
    }
}

socket.on('balance-correction:created', (data: B) => {
    const correction = new BalanceCorrection(data);
    BalanceCorrection.emit('new', correction);

    const bucket = Bucket.cache.get(data.bucketId);
    if (!bucket) return;
    bucket.emit('balance-correction', correction);
});

socket.on('balance-correction:updated', (data: B) => {
    const correction = BalanceCorrection.cache.get(data.id);
    if (!correction) return;

    correction.date = +data.date;
    correction.balance = +data.balance;
    correction.bucketId = data.bucketId;

    correction.emit('update', undefined);
    BalanceCorrection.emit('update', correction);
});

socket.on('balance-correction:archived', (data: B) => {
    const correction = BalanceCorrection.cache.get(data.id);
    if (!correction) return;

    correction.destroy();
    correction.emit('update', undefined);
    BalanceCorrection.emit('archive', correction);
});
