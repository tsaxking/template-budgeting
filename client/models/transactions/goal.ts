import { attemptAsync } from '../../../shared/check';
import { EventEmitter } from '../../../shared/event-emitter';
import { ServerRequest } from '../../utilities/requests';
import { Cache } from '../cache';
import { BudgetInterval } from '../../../server/utilities/tables';
import { Goals } from '../../../server/utilities/tables';
import { Bucket } from './bucket';
import { Transaction } from './transaction';
import {
    Transaction as T,
    Bucket as B
} from '../../../shared/db-types-extended';

type GoalEvents = {
    update: undefined;
};

type GlobalGoalEvents = {
    new: Goal;
    update: Goal;
    archive: Goal;
};

export type PseudoGoal = {
    id: string;
    name: string;
    description: string;
    amount: number;
    interval: BudgetInterval;
    rank: number;
    startDate: number;
    created: number;
    archived: boolean;
    type: 'fixed' | 'percent';
    target: number;
    accumulated: number;
    goal: Goal;
};

export class Goal extends Cache<GoalEvents> {
    public static cache = new Map<string, Goal>();

    public static readonly emitter = new EventEmitter<keyof GlobalGoalEvents>();

    public static on<K extends keyof GlobalGoalEvents>(
        event: K,
        callback: (data: GlobalGoalEvents[K]) => void
    ): void {
        this.emitter.on(event, callback);
    }

    public static off<K extends keyof GlobalGoalEvents>(
        event: K,
        callback?: (data: GlobalGoalEvents[K]) => void
    ): void {
        this.emitter.off(event, callback);
    }

    public static emit<K extends keyof GlobalGoalEvents>(
        event: K,
        data: GlobalGoalEvents[K]
    ): void {
        this.emitter.emit(event, data);
    }

    public static async new(data: {
        name: string;
        description: string;
        amount: number;
        interval: BudgetInterval;
        rank: number;
        startDate: number;
        target: number;
        type: 'percent' | 'fixed';
    }) {
        if (!data.target) data.target = 0;
        ServerRequest.post('/api/goals/new', data);
    }

    public static async all() {
        return attemptAsync(async () => {
            const res = await ServerRequest.post<
                {
                    goal: Goals;
                    transactions: T[];
                    buckets: B[];
                }[]
            >('/api/goals/all',
                undefined,
                {
                    cached: true,
                }
            );
            if (res.isErr()) throw res.error;
            return res.value
                .sort((a, b) => a.goal.rank - b.goal.rank)
                .map(d => {
                    return Goal.retrieve(
                        d.goal,
                        // d.buckets,
                        d.transactions,
                    );
                });
        });
    }

    public static retrieve(
        goal: Goals,
        // buckets: B[],
        transactions: T[]
    ) {
        const existing = Goal.cache.get(goal.id);
        if (existing) {
            return existing;
        }
        const t = transactions.map(Transaction.retrieve);
        // const b = buckets.map(Bucket.retrieve);

        return new Goal(
            goal,
            // b,
            t
        );
    }

    public readonly id: string;
    public name: string;
    public description: string;
    public amount: number;
    public interval: BudgetInterval;
    public rank: number;
    public target: number;
    public startDate: number;
    public readonly created: number;
    public archived: boolean;
    // public readonly buckets: Bucket[];
    public readonly transactions: Transaction[];
    public type: 'fixed' | 'percent';

    constructor(
        data: Goals,
        // buckets: Bucket[],
        transactions: Transaction[]
    ) {
        super();
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.amount = +data.amount;
        this.interval = data.interval;
        this.rank = +data.rank;
        this.startDate = +data.startDate;
        this.created = +data.created;
        this.archived = !!data.archived;
        // this.buckets = buckets;
        this.transactions = transactions;
        this.type = data.type;
        this.target = +data.target;

        if (!Goal.cache.has(this.id)) Goal.cache.set(this.id, this);
    }

    async update(data: {
        name: string;
        description: string;
        amount: number;
        interval: BudgetInterval;
        rank: number;
        startDate: number;
        target: number;
        type: 'percent' | 'fixed';
        archived: boolean;
    }) {
        if (!data.target) data.target = 0;
        return ServerRequest.post('/api/goals/update', {
            ...data,
            id: this.id
        });
    }

    // addBucket(bucket: Bucket) {
    //     return ServerRequest.post('/api/goals/add-bucket', {
    //         goalId: this.id,
    //         bucketId: bucket.id
    //     });
    // }

    // removeBucket(bucket: Bucket) {
    //     return ServerRequest.post('/api/goals/remove-bucket', {
    //         goalId: this.id,
    //         bucketId: bucket.id,
    //     });
    // }

    addTransaction(transaction: Transaction) {
        return ServerRequest.post('/api/goals/add-transaction', {
            goalId: this.id,
            transactionId: transaction.id,
        });
    }

    removeTransaction(transaction: Transaction) {
        return ServerRequest.post('/api/goals/remove-transaction', {
            goalId: this.id,
            transactionId: transaction.id,
        });
    }

    get pseudo() {
        // this is a pseudo goal, used to represent the goal but be maluable without changing the actual goal
        return {
            ...this,
            // rebind the data so that it can be changed
            id: this.id,
            name: this.name,
            description: this.description,
            amount: this.amount,
            interval: this.interval,
            rank: this.rank,
            startDate: this.startDate,
            created: this.created,
            archived: this.archived,
            type: this.type,
            target: this.target,
            accumulated: 0,
            goal: this,
        };
    }
}
