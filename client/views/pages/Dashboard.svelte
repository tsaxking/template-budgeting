<script lang="ts">
import SelectBucket from '../components/buckets/SelectBucket.svelte';
import { Bucket } from '../../models/transactions/bucket';
import DashboardCard from '../components/main/DashboardCard.svelte';
import BucketBasics from '../components/buckets/BucketBasics.svelte';
import TransactionTable from '../components/transactions/TransactionTable.svelte';
import { Modal } from '../../utilities/modals';
import NewTransaction from '../components/transactions/NewTransaction.svelte';

let buckets: Bucket[] = [];
let search: string = '';

let from: number = Date.now() - 1000 * 60 * 60 * 24 * 52; // 1 year ago
let to: number = Date.now();

let fromStr = new Date(from).toISOString().split('T')[0];
let toStr = new Date(to).toISOString().split('T')[0];
$: from = new Date(fromStr).getTime();
$: to = new Date(toStr).getTime();

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
                <span class="input-group-text">
                    <i class="bi bi-search"></i>
                </span>
                <input
                    id="dashboard-search-transactions"
                    type="text"
                    class="form-control"
                    placeholder="Search..."
                    bind:value="{search}"
                />
            </div>
        </div>
    </div>
    <div class="row mb-3">
        <button class="btn btn-success">
            <i class="material-icons"> add </i>
            New Transaction
        </button>
    </div>
    <div class="row mb-3">
        {#each buckets as bucket}
            <DashboardCard title="{bucket.name}">
                <BucketBasics {bucket} {from} {to} />
            </DashboardCard>
        {/each}
        <DashboardCard title="Transactions">
            <TransactionTable {from} {to} {buckets} />
        </DashboardCard>
    </div>
</div>
