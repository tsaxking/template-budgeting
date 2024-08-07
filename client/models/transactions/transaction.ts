import { EventEmitter } from '../../../shared/event-emitter';
import { Transaction as T } from '../../../shared/db-types-extended';
import { Cache } from '../cache';
import { attemptAsync } from '../../../shared/check';
import { ServerRequest } from '../../utilities/requests';
import { socket } from '../../utilities/socket';
import { Type } from './type';
import { Subtype } from './subtype';
import { Bucket } from './bucket';
import { Goal } from './goal';

type GlobalTransactionEvents = {
    new: Transaction;
    archive: Transaction;
    update: Transaction;
};

type TransactionEvents = {
    update: undefined;
};

export class Transaction extends Cache<TransactionEvents> {
    public static readonly cache = new Map<string, Transaction>();
    public static readonly emitter = new EventEmitter<
        keyof GlobalTransactionEvents
    >();

    public static on<K extends keyof GlobalTransactionEvents>(
        event: K,
        callback: (data: GlobalTransactionEvents[K]) => void
    ): void {
        this.emitter.on(event, callback);
    }

    public static off<K extends keyof GlobalTransactionEvents>(
        event: K,
        callback?: (data: GlobalTransactionEvents[K]) => void
    ): void {
        this.emitter.off(event, callback);
    }

    public static emit<K extends keyof GlobalTransactionEvents>(
        event: K,
        data: GlobalTransactionEvents[K]
    ): void {
        this.emitter.emit(event, data);
    }

    public static fromTypes(ids: string[], from: number, to: number) {
        return attemptAsync(async () => {
            const subtypes = (await Subtype.all()).unwrap();
            const all = (await Transaction.all()).unwrap();
            return all
                .filter(t => ids.includes(subtypes.find(s => s.id === t.subtypeId)?.typeId || ''))
                .filter(t => t.date >= from && t.date <= to);
        });
    }

    public static fromSubTypes(ids: string[], from: number, to: number) {
        return attemptAsync(async () => {
            const all = (await Transaction.all()).unwrap();
            return all
                .filter(t => ids.includes(t.subtypeId))
                .filter(t => t.date >= from && t.date <= to);
        });
    }

    public static search(
        buckets: string[], // bucket ids
        from: number,
        to: number
    ) {
        return attemptAsync(async () => {
            const all = (await Transaction.all()).unwrap();
            return all
                .filter(t => buckets.includes(t.bucketId))
                .filter(t => t.date >= from && t.date <= to);
        });
    }

    public static all() {
        return attemptAsync(async () => {
            if (Transaction.cache.size) return [...Transaction.cache.values()];
            return (await ServerRequest.post<T[]>('/api/transactions/all', undefined,
                {
                    cached: true,
                }
            ))
                .unwrap()
                .map(t => new Transaction(t, { save: true, type: 'real' }));
        });
    }

    public static parse(transactions: Transaction[]) {
        let income = 0;
        let expenses = 0;
        let taxDeductible = 0;
        for (let i = 0; i < transactions.length; i++) {
            const t = transactions[i];
            if (t.type === 'deposit') {
                income += t.amount;
                if (t.taxDeductible) taxDeductible += t.amount;
            } else {
                expenses += t.amount;
            }
        }

        return {
            income,
            expenses,
            taxDeductible,
            net: income - expenses
        };
    }

    public static new(data: {
        amount: number;
        type: 'withdrawal' | 'deposit';
        status: 'pending' | 'completed' | 'failed';
        date: number;
        bucketId: string;
        description: string;
        subtypeId: string;
        taxDeductible: boolean;
    }) {
        return ServerRequest.post('/api/transactions/new', data);
    }

    public static retrieve(data: T) {
        const exists = Transaction.cache.get(data.id);
        if (exists) return exists;

        return new Transaction(data, {
            save: true,
            type: 'real'
        });
    }

    public readonly id: string;
    public readonly amount: number;
    public readonly type: 'withdrawal' | 'deposit';
    public readonly status: 'pending' | 'completed' | 'failed';
    public date: number;
    public bucketId: string;
    public description: string;
    public subtypeId: string;
    public taxDeductible: 0 | 1;
    public archived: 0 | 1;
    public picture: string | null;
    public transfer: 0 | 1;

    constructor(
        data: T,
        public readonly metadata: {
            save: boolean;
            type: 'real' | 'subscription' | 'balance-correction';
        }
    ) {
        super();
        this.id = data.id;
        this.amount = +data.amount;
        this.type = data.type;
        this.status = data.status;
        this.date = +data.date;
        this.bucketId = data.bucketId;
        this.description = data.description;
        this.subtypeId = data.subtypeId;
        this.taxDeductible = data.taxDeductible;
        this.archived = data.archived;
        this.picture = data.picture;
        this.transfer = data.transfer;

        if (metadata.save) Transaction.cache.set(this.id, this);
    }

    async update(data: Partial<T>) {
        if (!this.metadata.save)
            throw new Error('Cannot update unsaved transaction');
        return ServerRequest.post('/api/transactions/update', {
            id: this.id,
            amount: data.amount || this.amount,
            type: data.type || this.type,
            status: data.status || this.status,
            date: data.date || this.date,
            bucketId: data.bucketId || this.bucketId,
            description: data.description || this.description,
            subtypeId: data.subtypeId || this.subtypeId,
            taxDeductible: data.taxDeductible || this.taxDeductible
        });
    }

    async setArchive(archived: boolean) {
        if (!this.metadata.save)
            throw new Error('Cannot archive unsaved transaction');
        return ServerRequest.post('/api/transactions/set-archive-status', {
            id: this.id,
            archived
        });
    }

    changePicture(files: FileList) {
        if (!this.metadata.save)
            throw new Error('Cannot change picture of unsaved transaction');
        return ServerRequest.streamFiles(
            '/api/transactions/change-picture',
            files,
            {
                id: this.id
            }
        );
    }

    async getTypeInfo() {
        return attemptAsync(async () => {
            const [type, subtype] = await Promise.all([
                Type.all(),
                Subtype.all()
            ]);
            if (type.isErr()) throw type.error;
            if (subtype.isErr()) throw subtype.error;

            const s = subtype.value.find(s => s.id === this.subtypeId);
            if (!s) return null;

            const t = type.value.find(t => t.id === s.typeId);
            if (!t) return null;
            return {
                type: t,
                subtype: s
            };
        });
    }
}

socket.on('transactions:created', (data: T) => {
    const t = new Transaction(data, {
        save: true,
        type: 'real'
    });
    Transaction.emit('new', t);
    const b = Bucket.cache.get(t.bucketId);
    if (b) b.emit('new-transaction', t);
});

socket.on('transactions:updated', (data: T) => {
    const t = Transaction.retrieve(data);

    t.emit('update', undefined);
    Transaction.emit('update', t);
});

socket.on(
    'transactions:picture-updated',
    (data: { id: string; picture: string }) => {
        const t = Transaction.cache.get(data.id);
        if (!t) return;

        t.picture = data.picture;
        t.emit('update', undefined);
        Transaction.emit('update', t);
    }
);

socket.on('transactions:archived', (id: string) => {
    const t = Transaction.cache.get(id);
    if (!t) return;

    t.archived = 1;
    t.emit('update', undefined);
    Transaction.emit('archive', t);
});

socket.on('transactions:restored', (id: string) => {
    const t = Transaction.cache.get(id);
    if (!t) return;

    t.archived = 0;
    t.emit('update', undefined);
    Transaction.emit('update', t);
});
