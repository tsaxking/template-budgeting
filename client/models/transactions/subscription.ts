import { Cache } from '../cache';

import { Subscription as S } from '../../../shared/db-types-extended';
import { EventEmitter } from '../../../shared/event-emitter';
import { attemptAsync } from '../../../shared/check';
import { ServerRequest } from '../../utilities/requests';
import { socket } from '../../utilities/socket';

type GlobalSubscriptionEvents = {
    new: Subscription;
};

type SubscriptionEvents = {
    update: undefined;
};


export class Subscription extends Cache<SubscriptionEvents> {
    public static readonly cache = new Map<string, Subscription>();
    public static readonly emitter = new EventEmitter<keyof GlobalSubscriptionEvents>();

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

            const res = await ServerRequest.post<S[]>(
                '/api/subscriptions/all'
            );

            if (res.isErr()) throw res.error;
            return res.value.map(t => new Subscription(t));
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
            return res.value.map(t => new Subscription(t));
        });
    }

    public static new(data: {
        bucketId: string;
        name: string;
        amount: number;
        interval: number;
        taxDeductible: boolean;
        description: string;
        picture: string;
        startDate: number;
        endDate: number | null;
        subtypeId: string;
    }) {
        return ServerRequest.post('/api/subscriptions/new', data);
    }


    public readonly id: string;
    public name: string;
    public startDate: number;
    public endDate: number | null;
    public interval: number; // in ms
    public bucketId: string;
    public amount: number; // in cents
    public subtypeId: string;
    public description: string;
    public picture: string | null;
    public taxDeductible: 0 | 1;
    public archived: 0 | 1;

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

        if (!Subscription.cache.has(data.id)) Subscription.cache.set(data.id, this);
    }

    update(data: {
        name: string;
        amount: number;
        interval: number;
        taxDeductible: boolean;
        description: string;
        picture: string;
        startDate: number;
        endDate: number | null;
        subtypeId: string;
        bucketId: string;
    }) {
        return ServerRequest.post('/api/subscriptions/update', { ...data, id: this.id });
    }

    setArchive(archive: boolean) {
        return ServerRequest.post('/api/subscriptions/set-archive', {
            id: this.id,
            archive
        });
    }
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