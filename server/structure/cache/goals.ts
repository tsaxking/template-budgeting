import { Cache } from './cache';
import { Goals as G, BudgetInterval } from '../../utilities/tables';
import { attemptAsync } from '../../../shared/check';
import { DB } from '../../utilities/databases';
import { uuid } from '../../utilities/uuid';
import { Buckets } from './bucket';
import { Transaction } from './transactions';

export class Goal extends Cache {
    public static all() {
        return attemptAsync(async () => {
            const data = (await DB.all('goals/all')).unwrap();
            return data.map(d => new Goal(d));
        });
    }

    public static fromId(id: string) {
        return attemptAsync(async () => {
            const data = (await DB.get('goals/from-id', { id })).unwrap();
            if (!data) return;
            return new Goal(data);
        });
    }

    public static new(data: Omit<G, 'id' | 'created' | 'archived'>) {
        return attemptAsync(async () => {
            const id = uuid();
            const created = Date.now();
            await DB.run('goals/new', {
                id,
                created,
                archived: false,
                ...data
            });
            return new Goal({ id, created, archived: false, ...data });
        });
    }

    public readonly id: string;
    public name: string;
    public description: string;
    public amount: number;
    public interval: BudgetInterval;
    public rank: number;
    public startDate: number;
    public readonly created: number;
    public archived: boolean;
    public type: 'fixed' | 'percent';
    public target: number;

    constructor(data: G) {
        super();
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.amount = data.amount;
        this.interval = data.interval;
        this.rank = data.rank;
        this.startDate = data.startDate;
        this.created = data.created;
        this.archived = data.archived;
        this.type = data.type;
        this.target = data.target;
    }

    update(data: Partial<Omit<G, 'id' | 'created'>>) {
        return attemptAsync(async () => {
            (
                await DB.run('goals/update', {
                    ...this,
                    ...data
                })
            ).unwrap();
            Object.assign(this, data);
        });
    }

    addBucket(bucketId: string) {
        return attemptAsync(async () => {
            const bucket = (await Buckets.fromId(bucketId)).unwrap();
            if (!bucket) throw new Error('Bucket not found');
            (
                await DB.run('goals/new-bucket-goals', {
                    goalId: this.id,
                    bucketId
                })
            ).unwrap();
        });
    }

    removeBucket(bucketId: string) {
        return attemptAsync(async () => {
            (
                await DB.run('goals/remove-bucket-goals', {
                    goalId: this.id,
                    bucketId
                })
            ).unwrap();
        });
    }

    getBuckets() {
        return attemptAsync(async () => {
            const buckets = (
                await DB.all('goals/get-bucket-goals', {
                    goalId: this.id
                })
            ).unwrap();
            return buckets.map(b => new Buckets(b));
        });
    }

    addTransaction(transactionId: string) {
        return attemptAsync(async () => {
            const transaction = (
                await Transaction.fromId(transactionId)
            ).unwrap();
            if (!transaction) throw new Error('Transaction not found');
            // this will throw an error if the transaction is already used since the transactionId is unique
            (
                await DB.run('goals/new-transaction-goal', {
                    goalId: this.id,
                    transactionId
                })
            ).unwrap();
        });
    }

    removeTransaction(transactionId: string) {
        return attemptAsync(async () => {
            (
                await DB.run('goals/remove-transaction-goal', {
                    goalId: this.id,
                    transactionId
                })
            ).unwrap();
        });
    }

    getTransactions() {
        return attemptAsync(async () => {
            const transactions = (
                await DB.all('goals/get-transaction-goals', {
                    goalId: this.id
                })
            ).unwrap();
            return transactions.map(t => new Transaction(t));
        });
    }
}
