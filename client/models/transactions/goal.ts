import { attemptAsync } from '../../../shared/check';
import { EventEmitter } from '../../../shared/event-emitter';
import { ServerRequest } from '../../utilities/requests';
import { Cache } from '../cache';
import { Goals } from '../../../shared/db-types-extended';
import { socket } from '../../utilities/socket';
import { Budget } from './budget';

type GoalEvents = {
    update: undefined;
};

type GlobalGoalEvents = {
    new: Goal;
    update: Goal;
    archive: Goal;
};

export class Goal extends Cache<GoalEvents> {
    public static cache = new Map<string, Goal>();

    public static readonly emitter = new EventEmitter<
        keyof GlobalGoalEvents
    >();

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
        amount: number;
        description: string;
        budgetId: string | null;
    }) {
        return ServerRequest.post('/api/goals/new', data);
    }

    public static async all() {
        return attemptAsync(async () => {
            if (Goal.cache.size)
                return Array.from(Goal.cache.values());

            const res = await ServerRequest.post<Goals[]>(
                '/api/goals/all'
            );
            if (res.isErr()) throw res.error;
            return res.value.map(Goal.retrieve);
        });
    }

    public static retrieve(data: Goals) {
        const existing = Goal.cache.get(data.id);
        if (existing) {
            return existing;
        }
        return new Goal(data);
    }

    public readonly id: string;
    public name: string;
    public amount: number;
    public archived: 0 | 1;
    public readonly created: number;
    public description: string;
    public budgetId: string | null;

    constructor(data: Goals) {
        super();
        this.id = data.id;
        this.name = data.name;
        this.amount = data.amount;
        this.archived = data.archived;
        this.created = data.created;
        this.description = data.description;
        this.budgetId = data.budgetId;

        if (!Goal.cache.has(this.id)) Goal.cache.set(this.id, this);
    }

    async getBudget() {
        return attemptAsync(async () => {
            if (!this.budgetId) return;
            const data = await Budget.get(this.budgetId);
            if (data.isErr()) throw data.error;
            return data.value;
        });
    }

    async update(data: {
        name: string;
        amount: number;
        description: string;
        budgetId?: string;
    }) {
        return ServerRequest.post('/api/goals/update', {
            ...data,
            id: this.id
        });
    }

    async setArchived(archived: boolean) {
        return ServerRequest.post('/api/goals/archive', {
            id: this.id,
            archived: archived ? 1 : 0
        });
    }
}