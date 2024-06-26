import { Cache } from './cache';
import { BalanceCorrection as B } from '../../utilities/tables';
import { DB } from '../../utilities/databases';
import { attemptAsync } from '../../../shared/check';
import { uuid } from '../../utilities/uuid';

export class BalanceCorrection extends Cache {
    public static new(data: {
        balance: number;
        date: number;
        bucketId: string;
    }) {
        return attemptAsync(async () => {
            const id = uuid();
            const res = await DB.run('balance-correction/new', {
                id,
                ...data
            });
            if (res.isErr()) throw res.error;
            const balanceCorrection = new BalanceCorrection({
                id,
                ...data
            });
            return balanceCorrection;
        });
    }

    public static get(id: string) {
        return attemptAsync(async () => {
            const data = await DB.get('balance-correction/from-id', { id });
            if (data.isErr()) throw data.error;
            if (!data.value) return;
            const balanceCorrection = new BalanceCorrection(data.value);
            return balanceCorrection;
        });
    }

    public static all() {
        return attemptAsync(async () => {
            const data = await DB.all('balance-correction/all');
            if (data.isErr()) throw data.error;
            return data.value.map((d: B) => new BalanceCorrection(d));
        });
    }

    public id: string;
    public date: number;
    public balance: number;
    public bucketId: string;
    constructor(data: B) {
        super();
        this.id = data.id;
        this.date = data.date;
        this.balance = data.balance;
        this.bucketId = data.bucketId;
    }

    update(data: { date: number; balance: number; bucketId: string }) {
        return attemptAsync(async () => {
            const res = await DB.run('balance-correction/update', {
                ...data,
                id: this.id
            });
            if (res.isErr()) throw res.error;
            this.date = data.date;
            this.balance = data.balance;
            this.bucketId = data.bucketId;
        });
    }

    destroy() {
        super.destroy();
        DB.run('balance-correction/delete', { id: this.id });
    }
}
