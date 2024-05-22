import { attemptAsync } from '../../../shared/check';
import { EventEmitter } from '../../../shared/event-emitter';
import { Cache } from '../cache';
import { Transaction } from './transaction';
import { BucketType, SubscriptionInterval } from '../../../shared/db-types-extended';
import { ServerRequest } from '../../utilities/requests';
import { Bucket as B } from '../../../shared/db-types-extended';
import { socket } from '../../utilities/socket';
import { BalanceCorrection } from './balance-correction';
import { Subscription } from './subscription';

type GlobalBucketEvents = {
    new: Bucket;
    update: Bucket;
};

type BucketEvents = {
    'new-transaction': Transaction;
    updated: undefined;
    'balance-correction': BalanceCorrection;
};

export class Bucket extends Cache<BucketEvents> {
    public static readonly cache = new Map<string, Bucket>();

    public static readonly emitter = new EventEmitter<
        keyof GlobalBucketEvents
    >();

    public static on<K extends keyof GlobalBucketEvents>(
        event: K,
        callback: (data: GlobalBucketEvents[K]) => void
    ): void {
        this.emitter.on(event, callback);
    }

    public static off<K extends keyof GlobalBucketEvents>(
        event: K,
        callback?: (data: GlobalBucketEvents[K]) => void
    ): void {
        this.emitter.off(event, callback);
    }

    public static emit<K extends keyof GlobalBucketEvents>(
        event: K,
        data: GlobalBucketEvents[K]
    ): void {
        this.emitter.emit(event, data);
    }

    public static new(name: string, description: string, type: BucketType) {
        return ServerRequest.post('/api/buckets/new', {
            name,
            description,
            type
        });
    }

    public static transactionsFromBuckets(
        buckets: Bucket[],
        from: number,
        to: number
    ) {
        return attemptAsync(async () => {
            return (
                await Promise.all(
                    buckets.map(async b => {
                        return b
                            .getTransactions(from, to)
                            .then(transactions => {
                                if (transactions.isErr())
                                    throw transactions.error;
                                return transactions.value.reverse();
                            });
                    })
                )
            ).flat();
        });
    }

    public static async fromId(id: string) {
        return attemptAsync(async () => {
            if (Bucket.cache.has(id)) return Bucket.cache.get(id);

            const [real, archived] = await Promise.all([
                Bucket.all(),
                Bucket.archived()
            ]);
            if (real.isErr()) throw real.error;
            if (archived.isErr()) throw archived.error;

            return [...real.value, ...archived.value].find(b => b.id === id);
        });
    }

    public static async all() {
        return attemptAsync(async () => {
            if (Bucket.cache.size > 0) {
                const buckets = Array.from(Bucket.cache.values());
                if (buckets.some(b => !b.archived))
                    return buckets.filter(b => !b.archived);
            }

            const res = await ServerRequest.post<B[]>('/api/buckets/all');
            if (res.isErr()) throw res.error;

            const buckets = res.value.map(Bucket.retrieve);
            return buckets;
        });
    }

    public static async archived() {
        return attemptAsync(async () => {
            if (Bucket.cache.size > 0) {
                const buckets = Array.from(Bucket.cache.values());
                if (buckets.some(b => b.archived))
                    return buckets.filter(b => b.archived);
            }

            const res = await ServerRequest.post<B[]>('/api/buckets/archived');
            if (res.isErr()) throw res.error;

            return res.value.map(Bucket.retrieve);
        });
    }

    public static retrieve(data: B) {
        const exists = Bucket.cache.get(data.id);
        if (exists) return exists;

        return new Bucket(data);
    }

    public readonly id: string;
    public readonly created: number;
    public name: string;
    public description: string;
    public archived: 0 | 1;
    public type: BucketType;

    constructor(data: B) {
        super();
        this.id = data.id;
        this.created = +data.created;
        this.name = data.name;
        this.description = data.description;
        this.archived = data.archived;
        this.type = data.type;

        if (!Bucket.cache.has(this.id)) {
            Bucket.cache.set(this.id, this);
        } else {
            throw new Error('Bucket already exists');
        }
    }

    async update(data: Partial<B>) {
        return ServerRequest.post('/api/buckets/update', {
            id: this.id,
            name: data.name || this.name,
            description: data.description || this.description,
            type: data.type || this.type
        });
    }

    async setArchive(archived: boolean) {
        return ServerRequest.post('/api/buckets/set-archive-status', {
            bucketId: this.id,
            archived
        });
    }

    async newTransaction(data: {
        amount: number;
        type: 'withdrawal' | 'deposit';
        date: number;
        status: 'pending' | 'completed' | 'failed';
        description: string;
        subtypeId: string;
        taxDeductible: boolean;
    }) {
        return Transaction.new({
            ...data,
            bucketId: this.id
        });
    }

    async getSubscriptions(from: number, to: number) {
        return attemptAsync(async () => {
            const subs = await Subscription.all();
            if (subs.isErr()) throw subs.error;

            return subs.value.filter(s => {
                return s.bucketId === this.id// && s.startDate <= to && (s.endDate || Infinity) >= from;
            });
        });
    }

    async newBalanceCorrection(data: { balance: number; date: number }) {
        return BalanceCorrection.new({
            ...data,
            bucketId: this.id
        });
    }

    async getBalanceCorrections(from: number, to: number) {
        return attemptAsync(async () => {
            const corrections = await BalanceCorrection.all();
            if (corrections.isErr()) throw corrections.error;

            return corrections.value.filter(c => {
                return c.bucketId === this.id && c.date >= from && c.date <= to;
            });
        });
    }

    async getTransactions(from: number, to: number) {
        return attemptAsync(async () => {
            const [transactions, subscriptions] = await Promise.all([
                Transaction.search([this.id], from, to),
                this.getSubscriptions(from, to)
            ]);

            if (transactions.isErr()) throw transactions.error;
            if (subscriptions.isErr()) throw subscriptions.error;

            return [
                ...transactions.value,
                ...subscriptions.value.map(s => s.build(from, to)).flat()
            ].sort((a, b) => a.date - b.date);
        });
    }

    async getBalance(from: number, to: number) {
        return attemptAsync(async () => {
            const [transactions, corrections] = await Promise.all([
                this.getTransactions(from, to),
                this.getBalanceCorrections(from, to)
            ]);

            if (transactions.isErr()) throw transactions.error;
            if (corrections.isErr()) throw corrections.error;

            const data: (Transaction | BalanceCorrection)[] = [
                ...transactions.value,
                ...corrections.value
            ].sort((a, b) => +a.date - +b.date);

            let balance = 0;
            for (const d of data) {
                if (d instanceof Transaction) {
                    if (d.type === 'deposit') balance += d.amount;
                    else balance -= d.amount;
                } else {
                    balance = d.balance;
                }
            }

            return balance;
        });
    }
}

socket.on('buckets:created', (data: B) => {
    const bucket = new Bucket(data);
    Bucket.emit('new', bucket);
});

socket.on('buckets:updated', (data: B) => {
    const b = Bucket.cache.get(data.id);
    if (!b) return;
    Object.assign(b, data);
    b.emit('updated', undefined);
    Bucket.emit('update', b);
});

socket.on('buckets:archived', (data: B) => {
    const b = Bucket.cache.get(data.id);
    if (!b) return;
    b.archived = 1;
    b.emit('updated', undefined);
});

socket.on('buckets:restored', (data: B) => {
    const b = Bucket.cache.get(data.id);
    if (!b) return;
    b.archived = 0;
    b.emit('updated', undefined);
});
