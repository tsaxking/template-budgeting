import { Cache } from './cache';
import { Subtypes as S } from '../../utilities/tables';
import { DB } from '../../utilities/databases';
import { attemptAsync } from '../../../shared/check';
import { uuid } from '../../utilities/uuid';
import { Transaction } from './transactions';

export class Subtype extends Cache {
    public static all() {
        return attemptAsync(async () => {
            const data = await DB.all('types/all-subtypes');
            if (data.isErr()) throw data.error;
            return data.value.map(d => new Subtype(d));
        });
    }
    public static new(data: { name: string; type: string; typeId: string }) {
        return attemptAsync(async () => {
            const id = uuid();
            const dateCreated = Date.now();
            const dateModified = dateCreated;
            const res = await DB.run('types/new-subtype', {
                ...data,
                id,
                dateCreated,
                dateModified
            });
            if (res.isErr()) throw res.error;
            return new Subtype({
                id,
                ...data,
                dateCreated,
                dateModified
            });
        });
    }

    public static fromId(id: string) {
        return attemptAsync(async () => {
            const data = await DB.get('types/subtype-from-id', { id });
            if (data.isErr()) throw data.error;
            if (!data.value) return;
            return new Subtype(data.value);
        });
    }

    public id: string;
    public name: string;
    public dateCreated: number;
    public dateModified: number;
    public type: string;
    public typeId: string;

    constructor(data: S) {
        super();
        this.id = data.id;
        this.name = data.name;
        this.dateCreated = data.dateCreated;
        this.dateModified = data.dateModified;
        this.type = data.type;
        this.typeId = data.typeId;
    }

    update(data: { name: string; type: string; typeId: string }) {
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

    getTransactions(from: number, to: number) {
        return attemptAsync(async () => {
            return (await Transaction.fromSubType(this.id))
                .unwrap()
                .filter(t => +t.date >= from && +t.date <= to);
        });
    }
}
