import { Cache } from '../cache';
import { EventEmitter } from '../../../shared/event-emitter';
import { ServerRequest } from '../../utilities/requests';
import { Subtype as S } from '../../../shared/db-types-extended';
import { attemptAsync } from '../../../shared/check';
import { socket } from '../../utilities/socket';
import { Type } from './type';

type SubtypeEvents = {
    update: void;
    'new-subtype': Subtype;
};

type GlobalSubtypeEvents = {
    new: Subtype;
};

export class Subtype extends Cache<SubtypeEvents> {
    public static readonly cache = new Map<string, Subtype>();

    public static readonly emitter = new EventEmitter<
        keyof GlobalSubtypeEvents
    >();

    public static on<K extends keyof GlobalSubtypeEvents>(
        event: K,
        callback: (data: GlobalSubtypeEvents[K]) => void
    ): void {
        this.emitter.on(event, callback);
    }

    public static off<K extends keyof GlobalSubtypeEvents>(
        event: K,
        callback?: (data: GlobalSubtypeEvents[K]) => void
    ): void {
        this.emitter.off(event, callback);
    }

    public static emit<K extends keyof GlobalSubtypeEvents>(
        event: K,
        data: GlobalSubtypeEvents[K]
    ): void {
        this.emitter.emit(event, data);
    }

    public static new(data: {
        name: string;
        typeId: string;
        type: 'withdrawal' | 'deposit';
    }) {
        return ServerRequest.post('/api/types/new-subtype', data);
    }

    public static all() {
        return attemptAsync(async () => {
            if (Subtype.cache.size) return Array.from(Subtype.cache.values());

            const res = await ServerRequest.post<S[]>(
                '/api/types/get-subtypes'
            );
            if (res.isErr()) throw res.error;

            return res.value.map(s => new Subtype(s));
        });
    }

    public readonly id: string;
    public name: string;
    public readonly dateCreated: number;
    public dateModified: number;
    public typeId: string;
    public type: 'withdrawal' | 'deposit';

    constructor(data: S) {
        super();
        this.id = data.id;
        this.name = data.name;
        this.dateCreated = data.dateCreated;
        this.dateModified = data.dateModified;
        this.typeId = data.typeId;
        this.type = data.type;

        if (!Subtype.cache.has(data.id)) {
            Subtype.cache.set(data.id, this);
        } else {
            throw new Error('Subtype already exists');
        }
    }

    update(
        data: Partial<{
            name: string;
            typeId: string;
            type: 'withdrawal' | 'deposit';
        }>
    ) {
        return ServerRequest.post('/api/types/update-subtype', {
            id: this.id,
            name: data.name || this.name,
            typeId: data.typeId || this.typeId,
            type: data.type || this.type
        });
    }

    getType() {
        return attemptAsync(async () => {
            const types = await Type.all();
            if (types.isErr()) throw types.error;

            return types.value.find(t => t.id === this.typeId);
        });
    }
}

socket.on('transaction-types:subtype-created', (data: S) => {
    const s = new Subtype(data);
    Subtype.emit('new', s);
});

socket.on('transaction-types:subtype-updated', (data: S) => {
    const exists = Subtype.cache.get(data.id);
    if (!exists) return;

    exists.name = data.name;
    exists.typeId = data.typeId;
    exists.type = data.type;

    exists.emit('update', undefined);
});
