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
    const dates = segment([new Date(from), new Date(to)]);

    const balances = resolveAll(await Promise.all(buckets.map(b => {
        return attemptAsync(async () => {
            const [tRes, cRes] = await Promise.all([
                b.getTransactions(from, to, false),
                b.getBalanceCorrections(from, to)
            ]);
            const transactions = tRes.unwrap();
            const corrections = cRes.unwrap();
        });
    })))
};

// Transaction.on('new', () => mount(buckets));
// Transaction.on('update', () => mount(buckets));
// Transaction.on('archive', () => mount(buckets));
// BalanceCorrection.on('new', () => mount(buckets));
// BalanceCorrection.on('update', () => mount(buckets));
// BalanceCorrection.on('archive', () => mount(buckets));
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
