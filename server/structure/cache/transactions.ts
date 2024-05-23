import { Cache } from "./cache";
import { Transactions as T } from "../../utilities/tables";
import { DB } from "../../utilities/databases";
import { attemptAsync } from "../../../shared/check";
import { uuid } from "../../utilities/uuid";

export class Transaction extends Cache {
    public static archived() {
        return attemptAsync(async () => {
            const data = await DB.all('transactions/archived');
            if (data.isErr()) throw data.error;
            return data.value.map((d) => new Transaction(d));
        });
    }
    public static deposits() {
        return attemptAsync(async () => {
            const data = await DB.all('transactions/deposits');
            if (data.isErr()) throw data.error;
            return data.value.map((d) => new Transaction(d));
        });
    }
    public static fromBucket(id: string) {
        return attemptAsync(async () => {
            const data = await DB.all('transactions/from-bucket', { bucketId: id });
            if (data.isErr()) throw data.error;
            return data.value.map((d) => new Transaction(d));
        });
    }
    public static fromId(id: string) {
        return attemptAsync(async () => {
            const data = await DB.get('transactions/from-id', { id });
            if (data.isErr()) throw data.error;
            if (!data.value) return;
            return new Transaction(data.value);
        });
    }
    public static fromStatus(status: string) {
        return attemptAsync(async () => {
            const data = await DB.all('transactions/from-status', { status });
            if (data.isErr()) throw data.error;
            return data.value.map((d) => new Transaction(d));
        });
    }
    public static fromSubType(id: string) {
        return attemptAsync(async () => {
            const data = await DB.all('transactions/from-subtype', { subtypeId: id });
            if (data.isErr()) throw data.error;
            return data.value.map((d) => new Transaction(d));
        });
    }
    public static new(data: {
        amount: number;
        type: string;
        status: string;
        date: number;
        bucketId: string;
        description: string;
        subtypeId: string;
        taxDeductible: number;
    }) {
        return attemptAsync(async () => {
            const id = uuid();
            const res = await DB.run('transactions/new', {
                ...data,
                id
            });
            if (res.isErr()) throw res.error;
            return new Transaction({
                id,
                ...data,
                archived: 0,
                picture: undefined
            });
        });
    }
    public static withdrawals() {
        return attemptAsync(async () => {
            const data = await DB.all('transactions/withdrawals');
            if (data.isErr()) throw data.error;
            return data.value.map((d) => new Transaction(d));
        });
    }

    public id: string;
    public amount: number;
    public type: string;
    public status: string;
    public date: number;
    public bucketId: string;
    public description: string;
    public subtypeId: string;
    public taxDeductible: number;
    public archived: number;
    public picture: string | undefined;

    constructor (data: T) {
        super();
        this.id = data.id;
        this.amount = data.amount;
        this.type = data.type;
        this.status = data.status;
        this.date = data.date;
        this.bucketId = data.bucketId;
        this.description = data.description;
        this.subtypeId = data.subtypeId;
        this.taxDeductible = data.taxDeductible;
        this.archived = data.archived;
        this.picture = data.picture;
    }

    setArchive(archive: boolean) {
        return attemptAsync(async () => {
            const res = await DB.run('transactions/set-archive', {
                id: this.id,
                archived: archive ? 1 : 0
            });
            if (res.isErr()) throw res.error;
            this.archived = archive ? 1 : 0;
        });
    }
    updatePicture(picture: string) {
        return attemptAsync(async () => {
            const res = await DB.run('transactions/update-picture', {
                id: this.id,
                picture
            });
            if (res.isErr()) throw res.error;
            this.picture = picture;
        });
    }
    update(data: {
        amount: number;
        type: string;
        status: string;
        date: number;
        bucketId: string;
        description: string;
        subtypeId: string;
        taxDeductible: number;
    }) {
        return attemptAsync(async () => {
            const res = await DB.run('transactions/update', {
                id: this.id,
                ...data
            });
            if (res.isErr()) throw res.error;
            this.amount = data.amount;
            this.type = data.type;
            this.status = data.status;
            this.date = data.date;
            this.bucketId = data.bucketId;
            this.description = data.description;
            this.subtypeId = data.subtypeId;
            this.taxDeductible = data.taxDeductible;
        });
    }

    setPicture(fileId: string) {
        return attemptAsync(async () => {
            const res = await DB.run('transactions/update-picture', {
                id: this.id,
                picture: fileId
            });
            if (res.isErr()) throw res.error;
            this.picture = fileId;
        });
    }
}