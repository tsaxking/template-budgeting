<script lang="ts">
import { Transaction } from '../../../models/transactions/transaction';
import { resolveAll } from '../../../../shared/check';
import { Bucket } from '../../../models/transactions/bucket';
import { Line } from 'svelte-chartjs';
import { onMount } from 'svelte';
import { date, segment } from '../../../../shared/clock';
import { BalanceCorrection } from '../../../models/transactions/balance-correction';

// TODO: Build a chart that shows the balance over time
// build the dates, then get the data for each date

export let buckets: Bucket[] = [];
export let from: number;
export let to: number;

let balance: number[] = [];
let withdrawals: number[] = [];
let deposits: number[] = [];

let dates: Date[] = [];
const mount = async (buckets: Bucket[]) => {
    const [correctionsResult, transactionsResult] = await Promise.all([
        resolveAll(
            await Promise.all(
                buckets.map(b => b.getBalanceCorrections(from, to))
            )
        ),
        Bucket.transactionsFromBuckets(buckets, from, to)
    ]);

    if (correctionsResult.isErr())
        return console.error(correctionsResult.error);
    if (transactionsResult.isErr())
        return console.error(transactionsResult.error);

    const corrections = correctionsResult.value.flat();
    const transactions = transactionsResult.value;

    const data = [...corrections, ...transactions].sort(
        (a, b) => a.date - b.date
    );

    dates = segment(data.map(d => new Date(+d.date)), 20);

    balance = [];
    withdrawals = [];
    deposits = [];

    for (const [i, d] of dates.entries()) {
        let transactions: (Transaction | BalanceCorrection)[] = [];
        if (i == 0) {
            transactions = data.filter(t => t.date <= d.getTime() && t.date >= from);
        } else {
            transactions = data.filter(t => t.date <= d.getTime() && t.date >= dates[i - 1].getTime());
        }

        balance.push(
            transactions.reduce((acc, cur, i) => {
                if (cur instanceof BalanceCorrection) {
                    acc += cur.balance;
                    return acc;
                } else {
                    let amount = cur.amount;
                    amount = cur.type === 'withdrawal' ? -amount : amount;
                    acc += (acc + amount);
                    return acc;
                }
            }, 0)
        );

        withdrawals.push(
            transactions.reduce((acc, cur) => {
                if (cur instanceof Transaction && cur.type === 'withdrawal') {
                    acc += -cur.amount;
                }
                return acc;
            }, 0)
        );

        deposits.push(
            transactions.reduce((acc, cur) => {
                if (cur instanceof Transaction && cur.type === 'deposit') {
                    acc += cur.amount;
                }
                return acc;
            }, 0)
        );
    }

    // balance = data.reduce((acc, cur, i) =>  {
    //     if (cur instanceof BalanceCorrection) {
    //         acc.push(cur.balance);
    //         return acc;
    //     } else {
    //         let amount = cur.amount;
    //         amount = cur.type === 'withdrawal' ? -amount : amount;
    //         acc.push((acc[i - 1] || 0) + amount);
    //         return acc;
    //     }
    // }, [] as number[]);

    // withdrawals = data.map(t => {
    //     if (t instanceof Transaction && t.type === 'withdrawal') return -t.amount;
    //     return 0;
    // });
    // deposits = data.map(t => {
    //     if (t instanceof Transaction && t.type === 'deposit') return t.amount;
    //     return 0;
    // });
};

onMount(() => {
    mount(buckets);
    return () => {
        balance = [];
        dates = [];
    };
});

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
                data: balance
            },
            {
                label: 'Withdrawals',
                data: withdrawals
            },
            {
                label: 'Deposits',
                data: deposits
            }
        ]
    }}"
/>
