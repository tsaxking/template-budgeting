<script lang="ts">
    import { Transaction } from "../../../models/transactions/transaction";
    import { resolveAll } from '../../../../shared/check';
    import { Bucket } from "../../../models/transactions/bucket";
import { Line } from "svelte-chartjs";
import { onMount } from 'svelte';
import { date } from "../../../../shared/clock";
import { BalanceCorrection } from "../../../models/transactions/balance-correction";

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
            resolveAll(await Promise.all(buckets.map(b => b.getBalanceCorrections(from, to)))),
            Bucket.transactionsFromBuckets(buckets, from, to)
        ]);

        if (correctionsResult.isErr()) return console.error(correctionsResult.error);
        if (transactionsResult.isErr()) return console.error(transactionsResult.error);

        const corrections = correctionsResult.value.flat();
        const transactions = transactionsResult.value;

        const data = [...corrections, ...transactions].sort((a, b) => a.date - b.date);

        balance = data.map((t, i) => {
            if (t instanceof Transaction) {
                let amount = t.amount;
                if (t.type === 'withdrawal') amount = amount * -1;
                if (i === 0) return amount;
                else return balance[i - 1] + amount;
            } else {
                return t.balance;
            }
        });

        dates = data.map(t => new Date(t.date));

        withdrawals = (data.filter(t => t instanceof Transaction && t.type === 'withdrawal') as Transaction[]).map(t => -t.amount);
        deposits = (data.filter(t => t instanceof Transaction && t.type === 'deposit') as Transaction[]).map(t => t.amount);
    }

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
    data={{
        labels: dates.map(date),
        datasets: [
            {
                label: 'Balance',
                data: balance,
            },
            {
                label: 'Withdrawals',
                data: withdrawals,
            },
            {
                label: 'Deposits',
                data: deposits,
            }
        ]
    }}
/>