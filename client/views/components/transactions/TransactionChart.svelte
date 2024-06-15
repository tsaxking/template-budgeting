<script lang="ts">
import { Transaction } from '../../../models/transactions/transaction';
import { resolveAll } from '../../../../shared/check';
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
    // TODO: this is a mess, I want this to be more performant
    const [correctionsResult, transactionsResult] = await Promise.all([
        resolveAll(
            await Promise.all(
                buckets.map(b => b.getBalanceCorrections(from, to))
            )
        ),
        Bucket.transactionsFromBuckets(buckets, from, to, false) // don't include transfers
    ]);

    if (correctionsResult.isErr())
        return console.error(correctionsResult.error);
    if (transactionsResult.isErr())
        return console.error(transactionsResult.error);

    const correctionTransactions = resolveAll(
        await Promise.all(correctionsResult.value.flat().map(c => c.build()))
    );
    if (correctionTransactions.isErr())
        return console.error(correctionTransactions.error);
    const transactions = transactionsResult.value;

    const data = [...correctionTransactions.value, ...transactions].sort(
        (a, b) => +a.date - +b.date
    );

    dates = segment(
        data.map(d => new Date(+d.date)),
        20
    );

    balance = [];
    withdrawals = [];
    deposits = [];

    for (const [i, d] of dates.entries()) {
        let transactions: Transaction[] = [];
        const upTo = data.filter(t => t.date <= d.getTime());
        if (i == 0) {
            transactions = data.filter(
                t => t.date <= d.getTime() && t.date > from
            );
        } else {
            transactions = data.filter(
                t => t.date <= d.getTime() && t.date > dates[i - 1].getTime()
            );
        }

        balance.push(
            upTo.reduce((acc, cur) => {
                acc += cur.type === 'withdrawal' ? -cur.amount : cur.amount;
                return acc;
            }, 0)
        );

        withdrawals.push(
            transactions.reduce((acc, cur) => {
                if (cur.metadata.type === 'balance-correction') return acc;
                if (cur.type === 'withdrawal') {
                    acc += -cur.amount;
                }
                return acc;
            }, 0)
        );

        deposits.push(
            transactions.reduce((acc, cur) => {
                if (cur.metadata.type === 'balance-correction') return acc;
                if (cur.type === 'deposit') {
                    acc += cur.amount;
                }
                return acc;
            }, 0)
        );
    }
};

onMount(() => {
    mount(buckets);
    return () => {
        balance = [];
        dates = [];
    };
});

$: if (to && from) mount(buckets);

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
