import { Cache } from '../cache';
import { Subtype } from './subtype';
import { EventEmitter } from '../../../shared/event-emitter';
import { TransactionType } from '../../../shared/db-types-extended';
import { ServerRequest } from '../../utilities/requests';
import { attemptAsync } from '../../../shared/check';
import { socket } from '../../utilities/socket';

type TypeEvents = {
    update: void;
    'new-subtype': Subtype;
};

type GlobalTypeEvents = {
    new: Type;
};

export class Type extends Cache<TypeEvents> {
    public static readonly cache = new Map<string, Type>();
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

    public static new(name: string) {
        return ServerRequest.post('/api/types/new-type', { name });
    }

    public static all() {
        return attemptAsync(async () => {
            const cache = Array.from(Type.cache.values());
            if (cache.length) return cache;

            const res = await ServerRequest.post<{
                types: TransactionType[];
                subtypes: Subtype[];
            }>(
                '/api/types/get-types'
            );
            if (res.isErr()) throw res.error;

            return res.value.types.map(t => new Type(t));
        });
    }

    public readonly id: string;
    public name: string;
    public readonly dateCreated: number;
    public dateModified: number;

    constructor(data: TransactionType) {
        super();
        this.id = data.id;
        this.name = data.name;
        this.dateCreated = data.dateCreated;
        this.dateModified = data.dateModified;

        if (!Type.cache.has(this.id)) Type.cache.set(this.id, this);
        else {
            throw new Error(
                `Type with id ${this.id} already exists in cache.`
            );
        }
    }

    update(name: string) {
        return ServerRequest.post('/api/types/update-type', {
            id: this.id,
            name
        });
    }

    getSubtypes() {
        return attemptAsync(async () => {
            const subtypes = await Subtype.all();
            if (subtypes.isErr()) throw subtypes.error;

            return subtypes.value.filter(s => s.typeId === this.id);
        });
    }

    newSubtype(name: string, type: 'deposit' | 'withdrawal') {
        return Subtype.new({
            name,
            typeId: this.id,
            type
        });
    }
}

socket.on('transaction-types:type-created', (data: TransactionType) => {
    const t = new Type(data);
    Type.emit('new', t);
});

socket.on('transaction-types:type-updated', (data: TransactionType) => {
    const exists = Type.cache.get(data.id);
    if (!exists) return;

    exists.name = data.name;
    exists.dateModified = data.dateModified;
    exists.emit('update', undefined);
});
