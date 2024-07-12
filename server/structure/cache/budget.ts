import { attemptAsync } from '../../../shared/check';
import { DB } from '../../utilities/databases';
import { Budgets as B } from '../../utilities/tables';
import { uuid } from '../../utilities/uuid';
import { Cache } from './cache';
import { Subtype } from './subtypes';

export class Budget extends Cache {
    public static all() {
        return attemptAsync(async () => {
            const data = (await DB.all('budgets/all')).unwrap();
            return data.map(d => new Budget(d));
        });
    }

    public static fromId(id: string) {
        return attemptAsync(async () => {
            const data = (
                await DB.get('budgets/budget-from-id', { id })
            ).unwrap();
            if (!data) return;
            return new Budget(data);
        });
    }

    public static new(data: Omit<B, 'id' | 'created' | 'archived'>) {
        return attemptAsync(async () => {
            const id = uuid();
            const created = Date.now();
            await DB.run('budgets/new-budget', {
                id,
                created,
                archived: false,
                ...data
            });
            return new Budget({ id, created, archived: false, ...data });
        });
    }

    public readonly id: string;
    public name: string;
    public description: string;
    public amount: number;
    public interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
    public readonly created: number;
    public archived: boolean;

    constructor(data: B) {
        super();
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.amount = data.amount;
        this.interval = data.interval;
        this.created = data.created;
        this.archived = data.archived;
    }

    getSubtypes() {
        return attemptAsync(async () => {
            const data = (
                await DB.all('budgets/budget-subtypes-from-budget', {
                    budgetId: this.id
                })
            ).unwrap();
            return data.map(d => new Subtype(d));
        });
    }

    update(data: Partial<B>) {
        return attemptAsync(async () => {
            if (data.id) throw new Error('Cannot update id');
            return (
                await DB.run('budgets/update-budget', {
                    ...this,
                    ...data
                })
            ).unwrap();
        });
    }

    delete() {
        return DB.run('budgets/delete-budget', {
            id: this.id
        });
    }

    addSubtype(subtypeId: string) {
        return attemptAsync(async () => {
            const subtypes = (await this.getSubtypes()).unwrap();
            if (subtypes.some(s => s.id === subtypeId)) return;
            await DB.run('budgets/new-budget-subtype', {
                budgetId: this.id,
                subtypeId
            });
        });
    }

    removeSubtype(subtypeId: string) {
        return DB.run('budgets/delete-budget-subtype', {
            subtypeId,
            budgetId: this.id
        });
    }
}
