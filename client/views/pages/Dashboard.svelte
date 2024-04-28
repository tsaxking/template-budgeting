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

let buckets: Bucket[] = [];
let search: string = '';

const now = new Date();
let from: number;
let to: number;
let fromStr: string;
let toStr: string;

$: from = new Date(fromStr).getTime();
$: to = new Date(toStr).getTime();

$: console.log(fromStr, toStr);

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

Bucket.on('update', () => (buckets = buckets));
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
        </div>
    </div>
    <div class="row mb-3">
        {#each buckets as bucket}
            <DashboardCard title="{bucket.name}" expandable="{true}">
                <BucketBasics {bucket} {to} />
            </DashboardCard>
        {/each}
        <DashboardCard title="Transactions" expandable="{true}">
            <TransactionTable {from} {to} {buckets} />
        </DashboardCard>
        <DashboardCard title="Subscriptions" expandable="{true}">
            <SubscriptionTable {buckets} {from} {to}/>
        </DashboardCard>
        <DashboardCard title="Chart" expandable="{true}">
            <TransactionChart {from} {to} {buckets} />
        </DashboardCard>
    </div>
</div>
