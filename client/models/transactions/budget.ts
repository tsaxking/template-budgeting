import { attemptAsync } from '../../../shared/check';
import { EventEmitter } from '../../../shared/event-emitter';
import { ServerRequest } from '../../utilities/requests';
import { Cache } from '../cache';
import { Budgets } from '../../../shared/db-types-extended';
import { socket } from '../../utilities/socket';

type BudgetEvents = {
    update: undefined;
};

type GlobalBudgetEvents = {
    new: Budget;
    update: Budget;
    archive: Budget;
};

export class Budget extends Cache<BudgetEvents> {
    public static cache = new Map<string, Budget>();

    public static readonly emitter = new EventEmitter<
        keyof GlobalBudgetEvents
    >();

    public static on<K extends keyof GlobalBudgetEvents>(
        event: K,
        callback: (data: GlobalBudgetEvents[K]) => void
    ): void {
        this.emitter.on(event, callback);
    }

    public static off<K extends keyof GlobalBudgetEvents>(
        event: K,
        callback?: (data: GlobalBudgetEvents[K]) => void
    ): void {
        this.emitter.off(event, callback);
    }

    public static emit<K extends keyof GlobalBudgetEvents>(
        event: K,
        data: GlobalBudgetEvents[K]
    ): void {
        this.emitter.emit(event, data);
    }

    public static async new(data: Budgets) {
        return ServerRequest.post('/api/budgets/new', data);
    }

    public static async all() {
        return attemptAsync(async () => {
            return (await ServerRequest.post<Budgets[]>('/api/budgets/all'))
                .unwrap()
                .map(Budget.retrieve);
        });
    }

    public static async get(id: string) {
        return attemptAsync(async () => {
            const existing = Budget.cache.get(id);
            if (existing) return existing;

            const all = await Budget.all();
            if (all.isErr()) throw all.error;

            return all.value.find(b => b.id === id);
        });
    }

    public static retrieve(data: Budgets) {
        const existing = Budget.cache.get(data.id);
        if (existing) {
            return existing;
        }
        return new Budget(data);
    }

    public readonly id: string;
    public name: string;
    public amount: number;
    public archived: 0 | 1;
    public readonly created: number;
    public description: string;

    constructor(data: Budgets) {
        super();
        this.id = data.id;
        this.name = data.name;
        this.amount = data.amount;
        this.archived = data.archived;
        this.created = data.created;
        this.description = data.description;

        if (!Budget.cache.has(this.id)) Budget.cache.set(this.id, this);
    }
}
