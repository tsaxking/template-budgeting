import { Cache } from './cache';
import { Miles as M } from '../../utilities/tables';
import { DB } from '../../utilities/databases';
import { attemptAsync } from '../../../shared/check';
import { uuid } from '../../utilities/uuid';

export class Mile extends Cache {
    public static active() {
        return attemptAsync(async () => {
            const data = await DB.all('miles/active');
            if (data.isErr()) throw data.error;
            return data.value.map((d: M) => new Mile(d));
        });
    }

    public static archived() {
        return attemptAsync(async () => {
            const data = await DB.all('miles/archived');
            if (data.isErr()) throw data.error;
            return data.value.map((d: M) => new Mile(d));
        });
    }

    public static fromId(id: string) {
        return attemptAsync(async () => {
            const data = await DB.get('miles/from-id', { id });
            if (data.isErr()) throw data.error;
            if (!data.value) return;
            return new Mile(data.value);
        });
    }

    public static new(data: { amount: number; date: number }) {
        return attemptAsync(async () => {
            const id = uuid();
            const res = await DB.run('miles/new', {
                ...data,
                id,
                archived: 0
            });
            if (res.isErr()) throw res.error;
            return new Mile({
                id,
                ...data,
                archived: 0
            });
        });
    }

    public id: string;
    public amount: number;
    public date: number;
    public archived: number;

    constructor(data: M) {
        super();
        this.id = data.id;
        this.amount = data.amount;
        this.date = data.date;
        this.archived = data.archived;
    }

    update(data: { amount: number; date: number }) {
        return attemptAsync(async () => {
            const res = await DB.run('miles/update', {
                ...data,
                id: this.id
            });
            if (res.isErr()) throw res.error;
            this.amount = data.amount;
            this.date = data.date;
        });
    }

    setArchive(archived: boolean) {
        return attemptAsync(async () => {
            const res = await DB.run('miles/set-archive', {
                id: this.id,
                archived: archived ? 1 : 0
            });
            if (res.isErr()) throw res.error;
            this.archived = archived ? 1 : 0;
        });
    }
}
