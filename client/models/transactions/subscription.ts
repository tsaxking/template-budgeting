import { Cache } from '../cache';

import { Subscription as S, SubscriptionInterval } from '../../../shared/db-types-extended';
import { EventEmitter } from '../../../shared/event-emitter';
import { attemptAsync } from '../../../shared/check';
import { ServerRequest } from '../../utilities/requests';
import { socket } from '../../utilities/socket';
import { Transaction } from './transaction';
import { Random } from '../../../shared/math';

type GlobalSubscriptionEvents = {
    new: Subscription;
    update: Subscription;
};

type SubscriptionEvents = {
    update: undefined;
};

export class Subscription extends Cache<SubscriptionEvents> {
    public static readonly cache = new Map<string, Subscription>();
    public static readonly emitter = new EventEmitter<
        keyof GlobalSubscriptionEvents
    >();

    public static on<K extends keyof GlobalSubscriptionEvents>(
        event: K,
        callback: (data: GlobalSubscriptionEvents[K]) => void
    ): void {
        this.emitter.on(event, callback);
    }

    public static off<K extends keyof GlobalSubscriptionEvents>(
        event: K,
        callback?: (data: GlobalSubscriptionEvents[K]) => void
    ): void {
        this.emitter.off(event, callback);
    }

    public static emit<K extends keyof GlobalSubscriptionEvents>(
        event: K,
        data: GlobalSubscriptionEvents[K]
    ): void {
        this.emitter.emit(event, data);
    }

    public static all() {
        return attemptAsync(async () => {
            const cache = Array.from(Subscription.cache.values());
            if (cache.length) return cache.filter(s => !s.archived);

            const res = await ServerRequest.post<S[]>('/api/subscriptions/all');

            if (res.isErr()) throw res.error;
            return res.value.map(Subscription.retrieve);
        });
    }

    public static archived() {
        return attemptAsync(async () => {
            const cache = Array.from(Subscription.cache.values());
            if (cache.length) return cache.filter(s => s.archived);

            const res = await ServerRequest.post<S[]>(
                '/api/subscriptions/archived'
            );

            if (res.isErr()) throw res.error;
            return res.value.map(Subscription.retrieve);
        });
    }

    public static new(data: {
        bucketId: string;
        name: string;
        amount: number;
        interval: SubscriptionInterval;
        period: number;
        taxDeductible: boolean;
        description: string;
        startDate: number;
        endDate: number | null;
        subtypeId: string;
        type: 'deposit' | 'withdrawal';
    }) {
        return ServerRequest.post('/api/subscriptions/new', data);
    }

    public static retrieve(data: S) {
        const exists = Subscription.cache.get(data.id);
        if (exists) return exists;

        return new Subscription(data);
    }

    public readonly id: string;
    public name: string;
    public startDate: number;
    public endDate: number | null;
    public interval: SubscriptionInterval; // in ms
    public period: number;
    public bucketId: string;
    public amount: number; // in cents
    public subtypeId: string;
    public description: string;
    public picture: string | null;
    public taxDeductible: 0 | 1;
    public archived: 0 | 1;
    public type: 'deposit' | 'withdrawal';

    constructor(data: S) {
        super();
        this.id = data.id;
        this.bucketId = data.bucketId;
        this.name = data.name;
        this.amount = data.amount;
        this.interval = data.interval;
        this.taxDeductible = data.taxDeductible;
        this.description = data.description;
        this.picture = data.picture;
        this.startDate = data.startDate;
        this.endDate = data.endDate;
        this.subtypeId = data.subtypeId;
        this.archived = data.archived;
        this.type = data.type;
        this.period = data.period;

        if (!Subscription.cache.has(data.id))
            Subscription.cache.set(data.id, this);
        else throw new Error('Subscription already exists in cache');
    }

    get start() {
        return new Date(+this.startDate);
    }

    get end() {
        return this.endDate ? new Date(+this.endDate) : undefined;
    }

    update(data: {
        name: string;
        amount: number;
        interval: SubscriptionInterval;
        taxDeductible: boolean;
        description: string;
        startDate: number;
        endDate: number | null;
        subtypeId: string;
        bucketId: string;
        type: 'withdrawal' | 'deposit';
        period: number;
    }) {
        return ServerRequest.post('/api/subscriptions/update', {
            ...data,
            id: this.id
        });
    }

    setArchive(archive: boolean) {
        return ServerRequest.post('/api/subscriptions/set-archive', {
            id: this.id,
            archive
        });
    }

    build(from: number, to: number) {
        const start = new Date(this.startDate);
        const end = this.endDate ? new Date(this.endDate) : null;

        const f = new Date(from);
        let t = new Date(to);

        if (end && end < f) return []; // subscription has ended
        if (start > t) return []; // subscription has not started
        if (end && end < t) t = end;

        const dates: Date[] = [];
        let next = start;
        while (next <= t) {
            switch (this.interval) {
                case 'daily':
                    next = new Date(next.getTime() + 1000 * 60 * 60 * 24);
                    break;
                case 'hourly':
                    next = new Date(next.getTime() + 1000 * 60 * 60);
                    break;
                case 'monthly':
                    next = new Date(next.getTime());
                    next.setMonth(next.getMonth() + 1);
                    break;
                case 'weekly':
                    next = new Date(next.getTime());
                    next.setDate(next.getDate() + 7);
                    break;
                case 'yearly':
                    next = new Date(next.getTime());
                    next.setFullYear(next.getFullYear() + 1);
                    break;
                default:
            }
            dates.push(next);
        }

        return dates.map(d => {
            // build a fake transaction (this will not be saved to the server)
            return new Transaction(
                {
                    id: Random.uuid(),
                    amount: this.amount,
                    type: this.type,
                    status: 'completed',
                    date: d.getTime(),
                    bucketId: this.bucketId,
                    description: this.description,
                    subtypeId: this.subtypeId,
                    taxDeductible: this.taxDeductible,
                    archived: 0,
                    picture: this.picture
                },
                false
            );
        });
    }

    get nextPayment(): Date | undefined {
        // we don't want to return this.start or this.end becuase we don't want dependency issues
        const now = new Date();
        if (this.end && now > this.end) return undefined;
        const fromStart = now.getTime() - this.startDate;
        if (fromStart < 0) return new Date(this.startDate);
        const date = new Date(this.startDate);
        while (date < now) {
            switch (this.interval) {
                case 'yearly':
                    date.setFullYear(date.getFullYear() + 1);
                    date.setMonth(0);
                    date.setDate(this.period);
                    break;
                case 'monthly':
                    date.setMonth(date.getMonth() + 1);
                    break;
                case 'weekly':
                    date.setDate(date.getDate() + 7);
                    break;
                case 'daily':
                    date.setDate(date.getDate() + 1);
                    break;
                case 'hourly':
                    date.setHours(date.getHours() + 1);
                    break;
            }
        }
        return date;
    }

    uploadPicture(files: FileList) {}
}

socket.on('subscriptions:created', (data: S) => {
    const s = new Subscription(data);
    Subscription.emit('new', s);
});

socket.on('subscriptions:archived', (id: string) => {
    const s = Subscription.cache.get(id);
    if (!s) return;

    s.archived = 1;
    s.emit('update', undefined);
});

socket.on('subscriptions:restored', (id: string) => {
    const s = Subscription.cache.get(id);
    if (!s) return;

    s.archived = 0;
    s.emit('update', undefined);
});

socket.on('subscriptions:updated', (data: S) => {
    const s = Subscription.cache.get(data.id);
    if (!s) return;

    Object.assign(s, data);

    s.emit('update', undefined);
});
