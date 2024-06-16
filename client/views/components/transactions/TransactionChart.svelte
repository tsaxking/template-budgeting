<script lang="ts">
import { Transaction } from '../../../models/transactions/transaction';
import { attemptAsync, resolveAll } from '../../../../shared/check';
import { Bucket } from '../../../models/transactions/bucket';
import { Line } from 'svelte-chartjs';
import { onMount } from 'svelte';
import { date, segment } from '../../../../shared/clock';
import { BalanceCorrection } from '../../../models/transactions/balance-correction';

export let buckets: Bucket[] = [];
export let from: number;
export let to: number;

let balance: number[] = [];
let withdrawals: number[] = [];
let deposits: number[] = [];

let dates: Date[] = [];

const mount = async (buckets: Bucket[]) => {
    dates = segment(new Date(from), new Date(to));

    const bRes = resolveAll(
        await Promise.all(
            buckets.map(b => {
                return attemptAsync(async () => {
                    const [sRes, tRes, cRes] = await Promise.all([
                        b.getBalance(from),
                        b.getTransactions(from, to, false),
                        b.getBalanceCorrections(from, to)
                    ]);
                    const start = sRes.unwrap();
                    const data = [...tRes.unwrap(), ...cRes.unwrap()];

                    return dates.map((date, i) => {
                        const all = data.filter(d => d.date <= date.getTime());
                        const balance = all.reduce((acc, d) => {
                            if (d instanceof Transaction) {
                                if (d.amount < 0) {
                                    return acc - d.amount;
                                } else {
                                    return acc;
                                }
                            } else {
                                return d.balance;
                            }
                        }, start);

                        let filtered = all;
                        if (i > 0) {
                            filtered = all.filter(
                                d => d.date > dates[i - 1].getTime()
                            );
                        }

                        const withdrawals = filtered.reduce((acc, d) => {
                            if (
                                d instanceof Transaction &&
                                d.type === 'withdrawal'
                            ) {
                                return acc - d.amount;
                            } else {
                                return acc;
                            }
                        }, 0);

                        const deposits = filtered.reduce((acc, d) => {
                            if (
                                d instanceof Transaction &&
                                d.type === 'deposit'
                            ) {
                                return acc + d.amount;
                            } else {
                                return acc;
                            }
                        }, 0);

                        return {
                            balance,
                            withdrawals,
                            deposits
                        };
                    });
                });
            })
        )
    );

    if (bRes.isErr()) return console.error(bRes.error);
    balance = bRes.value.reduce(
        (acc, b) => {
            return acc.map((v, i) => v + b[i].balance);
        },
        dates.map(() => 0)
    );

    withdrawals = bRes.value.reduce(
        (acc, b) => {
            return acc.map((v, i) => v + b[i].withdrawals);
        },
        dates.map(() => 0)
    );

    deposits = bRes.value.reduce(
        (acc, b) => {
            return acc.map((v, i) => v + b[i].deposits);
        },
        dates.map(() => 0)
    );
};

$: mount(buckets);

Transaction.on('new', () => mount(buckets));
Transaction.on('update', () => mount(buckets));
Transaction.on('archive', () => mount(buckets));
BalanceCorrection.on('new', () => mount(buckets));
BalanceCorrection.on('update', () => mount(buckets));
BalanceCorrection.on('archive', () => mount(buckets));
</script>

<Line
    data="{{
        labels: dates.map(date),
        datasets: [
            {
                label: 'Balance',
                data: balance,
                tension: 0.4
            },
            {
                label: 'Withdrawals',
                data: withdrawals,
                tension: 0.4
            },
            {
                label: 'Deposits',
                data: deposits,
                tension: 0.4
            }
        ]
    }}"
    options="{{
        responsive: true
    }}"
    style="width: 100%; height: 100%;"
/>
