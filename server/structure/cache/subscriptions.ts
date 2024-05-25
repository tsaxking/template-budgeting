import { Cache } from './cache';
import { Subscriptions as S } from '../../utilities/tables';
import { DB } from '../../utilities/databases';
import { attemptAsync } from '../../../shared/check';
import { uuid } from '../../utilities/uuid';

export class Subscription extends Cache {
    public static active() {
        return attemptAsync(async () => {
            const data = await DB.all('subscriptions/active');
            if (data.isErr()) throw data.error;
            return data.value.map(d => new Subscription(d));
        });
    }
    public static archived() {
        return attemptAsync(async () => {
            const data = await DB.all('subscriptions/archived');
            if (data.isErr()) throw data.error;
            return data.value.map(d => new Subscription(d));
        });
    }
    public static fromBucket(id: string) {
        return attemptAsync(async () => {
            const data = await DB.all('subscriptions/from-bucket', {
                bucketId: id
            });
            if (data.isErr()) throw data.error;
            return data.value.map(d => new Subscription(d));
        });
    }
    public static fromId(id: string) {
        return attemptAsync(async () => {
            const data = await DB.get('subscriptions/from-id', { id });
            if (data.isErr()) throw data.error;
            if (!data.value) return;
            return new Subscription(data.value);
        });
    }
    public static new(data: {
        name: string;
        startDate: number;
        endDate: number | undefined;
        interval: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
        bucketId: string;
        subtypeId: string;
        description: string;
        taxDeductible: number;
        amount: number;
        type: 'deposit' | 'withdrawal';
    }) {
        return attemptAsync(async () => {
            const id = uuid();
            const res = await DB.run('subscriptions/new', {
                ...data,
                id,
                picture: undefined
            });
            if (res.isErr()) throw res.error;
            return new Subscription({
                id,
                ...data,
                archived: 0,
                picture: undefined
            });
        });
    }

    public id: string;
    public name: string;
    public startDate: number;
    public endDate: number | undefined;
    public interval: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    public bucketId: string;
    public subtypeId: string;
    public description: string;
    public picture: string | undefined;
    public taxDeductible: number;
    public amount: number;
    public archived: number;
    public type: 'deposit' | 'withdrawal';

    constructor(data: S) {
        super();

        this.id = data.id;
        this.name = data.name;
        this.startDate = data.startDate;
        this.endDate = data.endDate;
        this.interval = data.interval;
        this.bucketId = data.bucketId;
        this.subtypeId = data.subtypeId;
        this.description = data.description;
        this.picture = data.picture;
        this.taxDeductible = data.taxDeductible;
        this.amount = data.amount;
        this.archived = data.archived;
        this.type = data.type;
    }

    setArchive(archived: boolean) {
        return attemptAsync(async () => {
            const res = await DB.run('subscriptions/set-archive', {
                id: this.id,
                archived: archived ? 1 : 0
            });
            if (res.isErr()) throw res.error;
            this.archived = archived ? 1 : 0;
        });
    }

    update(data: {
        name: string;
        startDate: number;
        endDate: number | undefined;
        interval: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
        bucketId: string;
        subtypeId: string;
        description: string;
        picture: string | undefined;
        taxDeductible: number;
        amount: number;
        type: 'deposit' | 'withdrawal';
    }) {
        return attemptAsync(async () => {
            const res = await DB.run('subscriptions/update', {
                ...data,
                id: this.id
            });
            if (res.isErr()) throw res.error;
            this.name = data.name;
            this.startDate = data.startDate;
            this.endDate = data.endDate;
            this.interval = data.interval;
            this.bucketId = data.bucketId;
            this.subtypeId = data.subtypeId;
            this.description = data.description;
            this.picture = data.picture;
            this.taxDeductible = data.taxDeductible;
            this.amount = data.amount;
            this.type = data.type;
        });
    }
}
