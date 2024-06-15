<script lang="ts">
import SelectBucket from '../components/buckets/SelectBucket.svelte';
import { Bucket } from '../../models/transactions/bucket';
import DashboardCard from '../components/main/DashboardCard.svelte';
import BucketBasics from '../components/buckets/BucketBasics.svelte';
import TransactionTable from '../components/transactions/TransactionTable.svelte';
import { Modal } from '../../utilities/modals';
import NewTransaction from '../components/transactions/NewTransaction.svelte';
import NewSubscription from '../components/subscriptions/NewSubscription.svelte';
import { onMount } from 'svelte';
import TransactionChart from '../components/transactions/TransactionChart.svelte';
import SubscriptionTable from '../components/subscriptions/SubscriptionTable.svelte';
import NewTransfer from '../components/transactions/NewTransfer.svelte';
import TransactionBarChart from '../components/transactions/TransactionBarChart.svelte';
import TypesLineChart from '../components/transactions/TypesLineChart.svelte';
import MilesTable from '../components/miles/MilesTable.svelte';
import MilesLineChart from '../components/miles/MilesLineChart.svelte';
import BalanceBasics from '../components/buckets/BalanceBasics.svelte';
import SpendingChart from '../components/budgets/SpendingChart.svelte';

let buckets: Bucket[] = [];

const now = new Date();
let from: number;
let to: number;
let fromStr: string;
let toStr: string;

$: {
    from = new Date(fromStr).getTime();
    reset();
}
$: {
    to = new Date(toStr).getTime();
    reset();
}

const reset = () => (buckets = buckets);

const transaction = () => {
    const m = new Modal();
    m.setTitle('New Transaction');
    const t = new NewTransaction({
        target: m.target.querySelector('.modal-body') as HTMLElement
    });
    m.show();
    t.$on('transaction-created', () => {
        m.hide();
        m.destroy();
    });
};

const subscription = () => {
    const m = new Modal();
    m.setTitle('New Subscription');
    const t = new NewSubscription({
        target: m.target.querySelector('.modal-body') as HTMLElement
    });
    m.show();
    t.$on('subscription-created', () => {
        m.hide();
        m.destroy();
    });
};

const transfer = () => {
    const m = new Modal();
    m.setTitle('New Transfer');
    const t = new NewTransfer({
        target: m.target.querySelector('.modal-body') as HTMLElement
    });
    m.show();
    t.$on('transfer-created', () => {
        m.hide();
        m.destroy();
    });
};

onMount(() => {
    const fromDate = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate()
    );
    fromDate.setHours(0, 0, 0, 0);
    const [fm, fd, fy] = fromDate.toLocaleDateString().split('/');
    fromStr = `${fy}-${fm.padStart(2, '0')}-${fd.padStart(2, '0')}`;
    const toDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
    );
    const [tm, td, ty] = toDate.toLocaleDateString().split('/');
    toStr = `${ty}-${tm.padStart(2, '0')}-${td.padStart(2, '0')}`;

    return () => {};
});

Bucket.on('update', reset);
</script>

<div class="container-fluid">
    <div class="row mb-3">
        <SelectBucket bind:active="{buckets}" />
    </div>
    <div class="row mb-3">
        <div class="col-12">
            <div class="input-group">
                <span class="input-group-text">
                    <i class="bi bi-calendar"></i>
                </span>
                <input
                    id="dashboard-date-from"
                    type="date"
                    class="form-control"
                    bind:value="{fromStr}"
                />
                <span class="input-group-text">
                    <i class="bi bi-calendar"></i>
                </span>
                <input
                    id="dashboard-date-to"
                    type="date"
                    class="form-control"
                    bind:value="{toStr}"
                />
            </div>
        </div>
    </div>
    <div class="row mb-3">
        <div class="btn-group" role="group">
            <button class="btn btn-success" on:click="{transaction}">
                <i class="material-icons"> add </i>
                New Transaction
            </button>
            <button class="btn btn-warning" on:click="{subscription}">
                <i class="material-icons"> add </i>
                New Subscription
            </button>
            <button class="btn btn-info" on:click="{transfer}">
                <i class="material-icons"> trending_flat </i>
                Transfer
            </button>
        </div>
    </div>
    <div class="row mb-3">
        <DashboardCard title="Balance Basics" expandable="{true}">
            <BalanceBasics />
        </DashboardCard>
        <DashboardCard title="Balance/Time" expandable="{true}">
            <TransactionChart {from} {to} {buckets} />
        </DashboardCard>
        <DashboardCard title="Total Expenses" expandable="{true}">
            <TransactionBarChart {buckets} {from} {to} />
        </DashboardCard>
        <DashboardCard title="Types/Time" expandable="{true}">
            <TypesLineChart {buckets} {from} {to} />
        </DashboardCard>
        <!-- <DashboardCard title="Spending Chart" expandable="{true}">
            <SpendingChart {from} {to} />
        </DashboardCard> -->
        {#each buckets as bucket}
            <DashboardCard title="{bucket.name}" expandable="{true}">
                <BucketBasics {bucket} {to} />
            </DashboardCard>
        {/each}
        <DashboardCard title="Transactions" expandable="{true}">
            <TransactionTable {from} {to} {buckets} />
        </DashboardCard>
        <DashboardCard title="Subscriptions" expandable="{true}">
            <SubscriptionTable {buckets} {from} {to} />
        </DashboardCard>
        <DashboardCard title="Miles Table" expandable="{true}">
            <MilesTable {from} {to} />
        </DashboardCard>
        <DashboardCard title="Miles Chart" expandable="{true}">
            <MilesLineChart {from} {to} />
        </DashboardCard>
    </div>
</div>
