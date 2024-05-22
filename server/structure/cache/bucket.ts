import { Cache } from "./cache";
import { Buckets as B } from "../../utilities/tables";
import { DB } from "../../utilities/databases";
import { attemptAsync } from "../../../shared/check";
import { uuid } from "../../utilities/uuid";

export class Buckets extends Cache {
    public static new(data: {
        name: string;
        description: string;
        type: string;
    }) {
        return attemptAsync(async () => {
            const id = uuid();
            const created = Date.now();
            DB.run('buckets/new', {
                ...data,
                id,
                created,
            });
            return new Buckets({
                id,
                ...data,
                created,
                archived: 0,
            });
        });
    }

    public static all() {
        return attemptAsync(async () => {
            const data = await DB.all('buckets/all');
            if (data.isErr()) throw data.error;
            return data.value.map((d: B) => new Buckets(d));
        });
    }

    public static fromId(id: string) {
        return attemptAsync(async () => {
            const data = await DB.get('buckets/from-id', { id });
            if (data.isErr()) throw data.error;
            if (!data.value) return;
            return new Buckets(data.value);
        });
    }

    public static archived() {
        return attemptAsync(async () => {
            const data = await DB.all('buckets/archived');
            if (data.isErr()) throw data.error;
            return data.value.map((d: B) => new Buckets(d));
        });
    }

    public id: string;
    public name: string;
    public description: string;
    public created: number;
    public archived: number;
    public type: string;

    constructor(data: B) {
        super();
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.created = data.created;
        this.archived = data.archived;
        this.type = data.type;
    }

    update(data: {
        name: string;
        description: string;
        type: string;
    }) {
        return attemptAsync(async () => {
            const res = await DB.run('buckets/update', {
                created: this.created,
                description: data.description,
                id: this.id,
                name: data.name,
                type: data.type,
            });
            if (res.isErr()) throw res.error;
            this.name = data.name;
            this.description = data.description;
            this.type = data.type;
        });
    }

    setArchive(archived: boolean) {
        return attemptAsync(async () => {
            const res = await DB.run('buckets/set-archive', {
                archived: archived ? 1 : 0,
                id: this.id,
            });
            if (res.isErr()) throw res.error;
            this.archived = archived ? 1 : 0;
        });
    }
}