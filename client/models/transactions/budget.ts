import { attemptAsync, resolveAll } from '../../../shared/check';
import { EventEmitter } from '../../../shared/event-emitter';
import { ServerRequest } from '../../utilities/requests';
import { Cache } from '../cache';
import { Budgets as B, BudgetInterval } from '../../../server/utilities/tables';
import {
    Subtype as S,
    Transaction as T
} from '../../../shared/db-types-extended';
import { Transaction } from './transaction';
import { Subtype } from './subtype';
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

    public static async new(
        data: Omit<B, 'id' | 'created' | 'archived'>,
        subtypes: Subtype[]
    ) {
        return ServerRequest.post('/api/budgets/new', {
            ...data,
            subtypes: subtypes.map(s => s.id)
        });
    }

    public static async all() {
        return attemptAsync(async () => {
            return (await ServerRequest.post<B[]>('/api/budgets/all'))
                .unwrap()
                .filter(b => !b.archived)
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

    public static retrieve(data: B) {
        const existing = Budget.cache.get(data.id);
        if (existing) {
            return existing;
        }
        return new Budget(data);
    }

    public readonly id: string;
    public name: string;
    public amount: number;
    public archived: boolean;
    public readonly created: number;
    public description: string;
    public interval: BudgetInterval;

    constructor(data: B) {
        super();
        Budget.cache.set(data.id, this);

        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.amount = +data.amount;
        this.interval = data.interval;
        this.created = data.created;
        this.archived = data.archived;
    }

    update(data: Partial<Omit<B, 'id' | 'created' | 'archived'>>) {
        return ServerRequest.post('/api/budgets/update', {
            id: this.id,
            ...data
        });
    }

    setArchive(archive: boolean) {
        return ServerRequest.post('/api/budgets/delete', {
            id: this.id,
            archive
        });
    }

    getSubtypes() {
        return attemptAsync(async () => {
            const subtypes = (
                await ServerRequest.post<S[]>('/api/budgets/get-subtypes', {
                    id: this.id
        }, {
            cached: true,
        })
            ).unwrap();

            return subtypes.map(d => Subtype.retrieve(d));
        });
    }

    addSubtype(subtype: Subtype) {
        return attemptAsync(async () => {
            const subtypes = (await this.getSubtypes()).unwrap();
            if (subtypes.find(s => s.id === subtype.id)) return;
            await ServerRequest.post('/api/budgets/add-subtype', {
                budgetId: this.id,
                subtypeId: subtype.id
            });
        });
    }

    removeSubtype(subtype: Subtype) {
        return attemptAsync(async () => {
            await ServerRequest.post('/api/budgets/remove-subtype', {
                budgetId: this.id,
                subtypeId: subtype.id
            });
        });
    }

    getTransactions(from: number, to: number) {
        return attemptAsync(async () => {
            const subtypes = (await this.getSubtypes()).unwrap();
            const transactions = (await Transaction.fromSubTypes(subtypes.map(s => s.id), from, to)).unwrap()
            this.cache.set('transactions', transactions);
            return transactions;
        });
    }

    getBudget(monthIndex: number, year: number) {
        return attemptAsync(async () => {
            const from = new Date(year, monthIndex, 1).getTime();
            const to = new Date(year, monthIndex + 1, 0).getTime();
            const transactions = (
                await this.getTransactions(from, to)
            ).unwrap();
            let max = +this.amount; // increases if there is income in the subtype
            let total = 0;
            for (let i = 0; i < transactions.length; i++) {
                if (transactions[i].type === 'deposit')
                    max += Number(transactions[i].amount);
                else total += Number(transactions[i].amount);
            }

            return {
                max,
                total
            };
        });
    }
}

socket.on('budget:updated', (data: B) => {
    const budget = Budget.cache.get(data.id);
    if (budget) {
        budget.name = data.name;
        budget.amount = data.amount;
        budget.description = data.description;
        budget.interval = data.interval;
        budget.archived = data.archived;
        budget.emit('update', undefined);
        Budget.emit('update', budget);
    }
});

socket.on('budget:new', (data: B) => {
    const budget = Budget.retrieve(data);
    Budget.emit('new', budget);
});

socket.on('budget:archive', (id: string) => {
    const budget = Budget.cache.get(id);
    if (budget) {
        budget.archived = true;
        budget.emit('update', undefined);
        Budget.emit('archive', budget);
    }
});

socket.on('budget:unarchive', (id: string) => {
    const budget = Budget.cache.get(id);
    if (budget) {
        budget.archived = false;
        budget.emit('update', undefined);
        Budget.emit('update', budget);
    }
});

socket.on('budget:subtype-added', (id: string) => {
    const budget = Budget.cache.get(id);
    if (budget) {
        budget.emit('update', undefined);
    }
});

socket.on('budget:subtype-removed', (id: string) => {
    const budget = Budget.cache.get(id);
    if (budget) {
        budget.emit('update', undefined);
    }
});
