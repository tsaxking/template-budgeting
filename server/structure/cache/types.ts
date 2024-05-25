import { Cache } from './cache';
import { TransactionTypes as T } from '../../utilities/tables';
import { DB } from '../../utilities/databases';
import { attemptAsync } from '../../../shared/check';
import { uuid } from '../../utilities/uuid';

export class Type extends Cache {
    public static all() {
        return attemptAsync(async () => {
            const data = await DB.all('types/all-types');
            if (data.isErr()) throw data.error;
            return data.value.map(d => new Type(d));
        });
    }
    public static new(data: { name: string }) {
        return attemptAsync(async () => {
            const id = uuid();
            const dateCreated = Date.now();
            const dateModified = dateCreated;
            const res = await DB.run('types/new-type', {
                ...data,
                id,
                dateCreated,
                dateModified
            });
            if (res.isErr()) throw res.error;
            return new Type({
                id,
                ...data,
                dateCreated,
                dateModified
            });
        });
    }

    public static fromId(id: string) {
        return attemptAsync(async () => {
            const data = await DB.get('types/type-from-id', { id });
            if (data.isErr()) throw data.error;
            if (!data.value) return;
            return new Type(data.value);
        });
    }

    public id: string;
    public name: string;
    public dateCreated: number;
    public dateModified: number;

    constructor(data: T) {
        super();
        this.id = data.id;
        this.name = data.name;
        this.dateCreated = data.dateCreated;
        this.dateModified = data.dateModified;
    }

    update(data: { name: string }) {
        return attemptAsync(async () => {
            const dateModified = Date.now();
            const res = await DB.run('types/update-type', {
                id: this.id,
                ...data,
                dateModified,
                dateCreated: this.dateCreated
            });
            if (res.isErr()) throw res.error;
            this.name = data.name;
        });
    }
}
