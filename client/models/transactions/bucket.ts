import { attemptAsync, resolveAll } from '../../../shared/check';
import { EventEmitter } from '../../../shared/event-emitter';
import { Cache } from '../cache';
import { Transaction } from './transaction';
import { BucketType } from '../../../shared/db-types-extended';
import { ServerRequest } from '../../utilities/requests';
import { Bucket as B } from '../../../shared/db-types-extended';
import { socket } from '../../utilities/socket';
import { BalanceCorrection } from './balance-correction';
import { Subscription } from './subscription';
import { Budget } from './budget';
import { Goal } from './goal';

type GlobalBucketEvents = {
    new: Bucket;
    update: Bucket;
};

type BucketEvents = {
    'new-transaction': Transaction;
    updated: undefined;
    'balance-correction': BalanceCorrection;
};

export class Bucket extends Cache<BucketEvents> {
    public static readonly cache = new Map<string, Bucket>();

    public static readonly emitter = new EventEmitter<
        keyof GlobalBucketEvents
    >();

    public static on<K extends keyof GlobalBucketEvents>(
        event: K,
        callback: (data: GlobalBucketEvents[K]) => void
    ): void {
        this.emitter.on(event, callback);
    }

    public static off<K extends keyof GlobalBucketEvents>(
        event: K,
        callback?: (data: GlobalBucketEvents[K]) => void
    ): void {
        this.emitter.off(event, callback);
    }

    public static emit<K extends keyof GlobalBucketEvents>(
        event: K,
        data: GlobalBucketEvents[K]
    ): void {
        this.emitter.emit(event, data);
    }

    public static new(name: string, description: string, type: BucketType) {
        return ServerRequest.post('/api/buckets/new', {
            name,
            description,
            type
        });
    }

    public static getDebitBalance(date: number) {
        return attemptAsync(async () => {
            const buckets = (await Bucket.all())
                .unwrap()
                .filter(b => b.type === 'debit');
            const balances = resolveAll(
                await Promise.all(buckets.map(b => b.getBalance(date)))
            ).unwrap();
            return balances.reduce((acc, b) => acc + b, 0);
        });
    }

    public static getCreditBalance(date: number) {
        return attemptAsync(async () => {
            const buckets = (await Bucket.all())
                .unwrap()
                .filter(b => b.type === 'credit');
            const balances = resolveAll(
                await Promise.all(buckets.map(b => b.getBalance(date)))
            ).unwrap();
            return balances.reduce((acc, b) => acc + b, 0);
        });
    }

    public static getTotalBalance(date: number) {
        return attemptAsync(async () => {
            const buckets = await Bucket.all();
            if (buckets.isErr()) throw buckets.error;

            const balances = resolveAll(
                await Promise.all(buckets.value.map(b => b.getBalance(date)))
            ).unwrap();
            return balances.reduce((acc, b) => acc + b, 0);
        });
    }

    public static getSavingsBalance(date: number) {
        return attemptAsync(async () => {
            const buckets = (await Bucket.all())
                .unwrap()
                .filter(b => b.type === 'savings');
            const balances = resolveAll(
                await Promise.all(buckets.map(b => b.getBalance(date)))
            ).unwrap();
            return balances.reduce((acc, b) => acc + b, 0);
        });
    }

    public static getOtherBalance(date: number) {
        return attemptAsync(async () => {
            const buckets = (await Bucket.all())
                .unwrap()
                .filter(b => b.type === 'other');
            const balances = resolveAll(
                await Promise.all(buckets.map(b => b.getBalance(date)))
            ).unwrap();
            return balances.reduce((acc, b) => acc + b, 0);
        });
    }

    public static transactionsFromBuckets(
        buckets: Bucket[],
        from: number,
        to: number,
        transfers = true
    ) {
        return attemptAsync(async () => {
            return (
                await Promise.all(
                    buckets.map(async b => {
                        return b
                            .getTransactions(from, to, transfers)
                            .then(transactions => {
                                if (transactions.isErr())
                                    throw transactions.error;
                                return transactions.value.reverse();
                            });
                    })
                )
            ).flat();
        });
    }

    public static async fromId(id: string) {
        return attemptAsync(async () => {
            if (Bucket.cache.has(id)) return Bucket.cache.get(id);

            const [real, archived] = await Promise.all([
                Bucket.all(),
                Bucket.archived()
            ]);
            if (real.isErr()) throw real.error;
            if (archived.isErr()) throw archived.error;

            return [...real.value, ...archived.value].find(b => b.id === id);
        });
    }

    public static async all() {
        return attemptAsync(async () => {
            // if (Bucket.cache.size > 0) {
            //     const buckets = Array.from(Bucket.cache.values());
            //     if (buckets.some(b => !b.archived))
            //         return buckets.filter(b => !b.archived);
            // }

            const res = await ServerRequest.post<B[]>('/api/buckets/all',
                undefined,
                {
                    cached: true,
                }
            );
            if (res.isErr()) throw res.error;

            const buckets = res.value.map(Bucket.retrieve);
            return buckets;
        });
    }

    public static async archived() {
        return attemptAsync(async () => {
            if (Bucket.cache.size > 0) {
                const buckets = Array.from(Bucket.cache.values());
                if (buckets.some(b => b.archived))
                    return buckets.filter(b => b.archived);
            }

            const res = await ServerRequest.post<B[]>('/api/buckets/archived');
            if (res.isErr()) throw res.error;

            return res.value.map(Bucket.retrieve);
        });
    }

    public static retrieve(data: B) {
        const exists = Bucket.cache.get(data.id);
        if (exists) return exists;
        return new Bucket(data);
    }

    public static parseNet(toDate: Date) {
        return attemptAsync(async () => {
            const allTransactions = (await Transaction.all()).unwrap();
            const [goalsRes, budgetsRes] = await Promise.all([
                Goal.all(),
                Budget.all()
            ]);

            const goals = goalsRes.unwrap().map(g => g.pseudo);
            const budgets = budgetsRes.unwrap();

            const startDate = new Date(
                goals.reduce((a, c) => {
                    if (c.startDate < a) return c.startDate;
                    return a;
                }, toDate.getTime())
            );

            const filteredTransactions = allTransactions
                .filter(t => t.date >= startDate.getTime() && t.date <= toDate.getTime());

            const months = Array.from(
                {
                    length: Math.ceil(
                        (toDate.getTime() - startDate.getTime()) / 2629746000
                    )
                },
                (_, i) => new Date(startDate.getTime() + i * 2629746000)
            );

            const budgetDataArray = resolveAll(
                await Promise.all(
                    months.map(m => attemptAsync(async () => {
                        return resolveAll(
                            await Promise.all(
                                budgets.map(b => 
                                    b.getBudget(
                                        m.getMonth(),
                                        m.getFullYear()
                                    )
                                )
                            )
                        ).unwrap();
                    }))
                )
            ).unwrap();

            let prev: number;

            const data = 
                    months.map((m, i) => {
                            const next = new Date(m.getTime());
                            next.setMonth(next.getMonth() + 1);
                            const transactions = filteredTransactions.filter(
                                t =>
                                    t.date >= m.getTime() &&
                                    t.date < next.getTime()
                            );

                            const budgetData = budgetDataArray[i];

                            const totalBudgetSpent = budgetData.reduce(
                                (acc, b) => acc + b.total,
                                0
                            );
                            const transactionData =
                                Transaction.parse(transactions);
                            const income = transactionData.income;
                            const expenses =
                                transactionData.expenses - totalBudgetSpent;

                            const net = income - totalBudgetSpent;
                            const usable = net - expenses;
                            let using = usable;
                            if (prev) using += prev;
                            let left = using;
                            let rank = 0;

                            const data = goals.map(g => {
                                if (m.getTime() < g.startDate) return 0;
                                if (g.rank !== rank) using = left;
                                rank = g.rank;

                                const goalTransactions = g.transactions.filter(g => 
                                    g.date >= m.getTime() && g.date < next.getTime()
                                );

                                for (let j = 0; j < goalTransactions.length; j++) {
                                    const t = g.transactions[j];
                                    if (t.type === 'deposit') {
                                        left -= t.amount;
                                        if (g.target) g.target += t.amount;
                                    } else {
                                        left += t.amount;
                                        if (g.target) g.target -= t.amount;
                                    }
                                }

                                let amount: number;
                                if (g.type === 'fixed') {
                                    amount = g.amount;
                                } else {
                                    amount = (using * g.amount) / 100; // percent
                                }

                                if (left - amount < 0) amount = 0;
                                if (g.accumulated + amount > g.target && g.target !== 0) amount = g.target - g.accumulated;
                                g.accumulated += amount;
                                left -= amount;
                                return amount;
                            });

                            prev = left;

                            return {
                                date: m.getTime(),
                                income,
                                expenses,
                                net,
                                usable,
                                goals: goals.map((g, i) => ({
                                    goal: g,
                                    saved: data[i] // saved in this month, not overall
                                })),
                                leftover: left
                            };
                        });

            const saved = goals.map((g, i) => {
                const saved = data.reduce(
                    (acc, d) => acc + d.goals[i].saved,
                    0
                );
                return {
                    goal: g,
                    saved
                };
            });

            const disposable = data.reduce((acc, d) => acc + d.leftover, 0);

            return {
                data,
                saved,
                disposable
            };
        });
    }

    public readonly id: string;
    public readonly created: number;
    public name: string;
    public description: string;
    public archived: 0 | 1;
    public type: BucketType;

    constructor(data: B) {
        super();
        this.id = data.id;
        this.created = +data.created;
        this.name = data.name;
        this.description = data.description;
        this.archived = data.archived;
        this.type = data.type;

        if (!Bucket.cache.has(this.id)) {
            Bucket.cache.set(this.id, this);
        } else {
            throw new Error('Bucket already exists');
        }
    }

    async update(data: Partial<B>) {
        return ServerRequest.post('/api/buckets/update', {
            id: this.id,
            name: data.name || this.name,
            description: data.description || this.description,
            type: data.type || this.type
        });
    }

    async setArchive(archived: boolean) {
        return ServerRequest.post('/api/buckets/set-archive-status', {
            bucketId: this.id,
            archived
        });
    }

    async newTransaction(data: {
        amount: number;
        type: 'withdrawal' | 'deposit';
        date: number;
        status: 'pending' | 'completed' | 'failed';
        description: string;
        subtypeId: string;
        taxDeductible: boolean;
    }) {
        return Transaction.new({
            ...data,
            bucketId: this.id
        });
    }

    async getSubscriptions(_from: number, _to: number) {
        return attemptAsync(async () => {
            const subs = await Subscription.all();
            if (subs.isErr()) throw subs.error;

            return subs.value.filter(s => {
                return s.bucketId === this.id; // && s.startDate <= _to && (s.endDate || Infinity) >= _from;
            });
        });
    }

    async newBalanceCorrection(data: { balance: number; date: number }) {
        return BalanceCorrection.new({
            ...data,
            bucketId: this.id
        });
    }

    async getBalanceCorrections(from: number, to: number) {
        return attemptAsync(async () => {
            const corrections = await BalanceCorrection.all();
            if (corrections.isErr()) throw corrections.error;

            return corrections.value.filter(c => {
                return c.bucketId === this.id && c.date >= from && c.date <= to;
            });
        });
    }

    async getTransactions(from: number, to: number, transfers = true) {
        return attemptAsync(async () => {
            const [transactions, subscriptions /*corrections*/] =
                await Promise.all([
                    Transaction.search([this.id], from, to),
                    this.getSubscriptions(from, to)
                    // this.getBalanceCorrections(from, to)
                ]);

            if (transactions.isErr()) throw transactions.error;
            if (subscriptions.isErr()) throw subscriptions.error;
            // if (corrections.isErr()) throw corrections.error;

            // const correctionTransactions = resolveAll(await Promise.all(corrections.value.map(c => c.build()))).unwrap() as Transaction[];

            return [
                ...transactions.value,
                ...subscriptions.value.map(s => s.build(from, to)).flat()
                // ...correctionTransactions
            ]
                .sort((a, b) => a.date - b.date)
                .filter(t => (transfers ? true : !t.transfer)); // if transfers is false, filter out transfers
        });
    }

    async getLastCorrection(date: number) {
        return attemptAsync(async () => {
            return (await this.getBalanceCorrections(0, date))
                .unwrap()
                .sort((a, b) => a.date - b.date)
                .pop();
        });
    }

    async getBalance(date: number) {
        return attemptAsync(async () => {
            const last = (await this.getLastCorrection(date)).unwrap();
            const start = last ? last.balance : 0;
            return (await this.getTransactions(last ? last.date : 0, date))
                .unwrap()
                .reduce((acc, t) => {
                    if (t.type === 'deposit') return acc + t.amount;
                    else return acc - t.amount;
                }, start);

            // const [transactions, corrections] = await Promise.all([
            //     this.getTransactions(from, to),
            //     this.getBalanceCorrections(from, to)
            // ]);

            // if (transactions.isErr()) throw transactions.error;
            // if (corrections.isErr()) throw corrections.error;

            // const data: (Transaction | BalanceCorrection)[] = [
            //     ...transactions.value,
            //     ...corrections.value
            // ].sort((a, b) => +a.date - +b.date);

            // let balance = 0;
            // for (const d of data) {
            //     if (d instanceof Transaction) {
            //         if (d.type === 'deposit') balance += d.amount;
            //         else balance -= d.amount;
            //     } else {
            //         balance = d.balance;
            //     }
            // }

            // return balance;
        });
    }

    async transfer(
        to: Bucket,
        amount: number,
        date: number,
        description: string
    ) {
        return ServerRequest.post('/api/transactions/transfer', {
            from: this.id,
            to: to.id,
            amount,
            date,
            description
        });
    }
}

socket.on('buckets:created', (data: B) => {
    const bucket = new Bucket(data);
    Bucket.emit('new', bucket);
});

socket.on('buckets:updated', (data: B) => {
    const b = Bucket.cache.get(data.id);
    if (!b) return;
    Object.assign(b, data);
    b.emit('updated', undefined);
    Bucket.emit('update', b);
});

socket.on('buckets:archived', (data: B) => {
    const b = Bucket.cache.get(data.id);
    if (!b) return;
    b.archived = 1;
    b.emit('updated', undefined);
});

socket.on('buckets:restored', (data: B) => {
    const b = Bucket.cache.get(data.id);
    if (!b) return;
    b.archived = 0;
    b.emit('updated', undefined);
});
