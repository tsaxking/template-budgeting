import { attemptAsync } from '../../../shared/check';
import { EventEmitter } from '../../../shared/event-emitter';
import { ServerRequest } from '../../utilities/requests';
import { Cache } from '../cache';
import { BalanceCorrection as B } from '../../../shared/db-types-extended';
import { socket } from '../../utilities/socket';
import { Bucket } from './bucket';

type BalanceCorrectionEvents = {
    update: undefined;
};

type GlobalBalanceCorrectionEvents = {
    new: BalanceCorrection;
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
            if (BalanceCorrection.cache.size)
                return Array.from(BalanceCorrection.cache.values());

            const res = await ServerRequest.post<B[]>(
                '/api/balance-correction/all'
            );
            if (res.isErr()) throw res.error;

            return res.value.map(b => new BalanceCorrection(b));
        });
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
    }

    update(data: { date: number; balance: number }) {
        return ServerRequest.post('/api/balance-correction/update', {
            id: this.id,
            ...data
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
}

socket.on('balance-correction:created', (data: B) => {
    const correction = new BalanceCorrection(data);
    BalanceCorrection.emit('new', correction);

    const bucket = Bucket.cache.get(data.bucketId);
    if (!bucket) return;
    bucket.emit('balance-correction', correction);
});
