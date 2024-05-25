import { Cache } from '../cache';
import { Miles as M } from '../../../shared/db-types-extended';
import { EventEmitter } from '../../../shared/event-emitter';
import { attemptAsync } from '../../../shared/check';
import { ServerRequest } from '../../utilities/requests';
import { socket } from '../../utilities/socket';

type TypeEvents = {
    update: void;
    archived: void;
    restored: void;
};

type GlobalTypeEvents = {
    new: Miles;
    update: Miles;
    archived: Miles;
    restored: Miles;
};

export class Miles extends Cache<TypeEvents> {
    public static readonly cache = new Map<string, Miles>();

    public static readonly emitter = new EventEmitter<keyof GlobalTypeEvents>();

    public static on<K extends keyof GlobalTypeEvents>(
        event: K,
        callback: (data: GlobalTypeEvents[K]) => void
    ): void {
        this.emitter.on(event, callback);
    }

    public static off<K extends keyof GlobalTypeEvents>(
        event: K,
        callback?: (data: GlobalTypeEvents[K]) => void
    ): void {
        this.emitter.off(event, callback);
    }

    public static emit<K extends keyof GlobalTypeEvents>(
        event: K,
        data: GlobalTypeEvents[K]
    ): void {
        this.emitter.emit(event, data);
    }

    public static all() {
        return attemptAsync(async () => {
            const cache = Array.from(Miles.cache.values());
            if (cache.length) return cache.filter(s => !s.archived);

            const res = await ServerRequest.post<M[]>('/api/miles/active');
            if (res.isErr()) throw res.error;
            return res.value.map(Miles.retrieve);
        });
    }

    public static archived() {
        return attemptAsync(async () => {
            const cache = Array.from(Miles.cache.values());
            if (cache.length) return cache.filter(s => s.archived);

            const res = await ServerRequest.post<M[]>('/api/miles/archived');

            if (res.isErr()) throw res.error;
            return res.value.map(Miles.retrieve);
        });
    }

    public static new(amount: number, date: number, description: string) {
        return ServerRequest.post('/api/miles/new', {
            amount,
            date,
            description
        });
    }

    public static retrieve(data: M) {
        const exists = Miles.cache.get(data.id);
        if (exists) return exists;

        return new Miles(data);
    }

    public readonly id: string;
    public amount: number;
    public date: number;
    public archived: 0 | 1;
    public description: string;

    constructor(data: M) {
        super();
        this.id = data.id;
        this.amount = data.amount;
        this.date = +data.date;
        this.archived = data.archived;
        this.description = data.description;

        if (!Miles.cache.has(this.id)) Miles.cache.set(this.id, this);
        else throw new Error('Miles already exists in cache');
    }

    update(amount: number, date: number, description: string) {
        return ServerRequest.post('/api/miles/update', {
            id: this.id,
            amount: +amount,
            date,
            description
        });
    }

    setArchive(archive: boolean) {
        return ServerRequest.post('/api/miles/set-archive', {
            id: this.id,
            archive
        });
    }
}

socket.on('miles:created', (data: M) => {
    if (Miles.cache.has(data.id)) return;
    const m = new Miles(data);
    Miles.emit('new', m);
});

socket.on('miles:updated', (data: M) => {
    const exists = Miles.cache.get(data.id);
    if (!exists) return;

    exists.amount = data.amount;
    exists.date = data.date;
    exists.emit('update', undefined);
    Miles.emit('update', exists);
});

socket.on('miles:archived', (data: M) => {
    const exists = Miles.cache.get(data.id);
    if (!exists) return;

    exists.archived = data.archived;
    exists.emit('update', undefined);
    Miles.emit('archived', exists);
});

socket.on('miles:restored', (data: M) => {
    const exists = Miles.cache.get(data.id);
    if (!exists) return;

    exists.archived = data.archived;
    exists.emit('restored', undefined);
    Miles.emit('restored', exists);
});
