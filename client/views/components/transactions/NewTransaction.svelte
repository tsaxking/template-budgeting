<script lang="ts">
import { createEventDispatcher, onMount } from 'svelte';
import { Transaction } from '../../../models/transactions/transaction';
import { Bucket } from '../../../models/transactions/bucket';
import Select from '../bootstrap/Select.svelte';

let buckets: Bucket[] = [];

onMount(() => {
    Bucket.all().then(b => {
        if (b.isErr()) return console.error(b.error);
        buckets = b.value;
    });
});

let amount = '';
let date = new Date().toISOString().split('T')[0];
let status = 'pending';
let bucketId = '';
let description = '';
let subtypeId = '';
let taxDeductible = false;

const d = createEventDispatcher();

const create = async () => {};
</script>

<form on:submit|preventDefault="{create}">
    <div class="mb-3">
        <label for="transaction-amount" class="form-label"> Amount </label>
        <input
            type="number"
            id="transaction-amount"
            class="form-control"
            bind:value="{amount}"
            step="0.01"
        />
    </div>
    <div class="mb-3">
        <label for="transaction-date" class="form-label"> Date </label>
        <input
            name="transaction-date"
            id="transaction-date"
            class="form-control"
            type="date"
            bind:value="{date}"
        />
    </div>
    <div class="mb-3">
        <label for="transaction-status" class="form-label"> Status </label>
        <select
            name="transaction-status"
            id="transaction-status"
            class="form-select"
            bind:value="{status}"
        >
            <option value="pending" selected>Pending</option>
            <option value="cleared">Cleared</option>
            <option value="reconciled">Reconciled</option>
        </select>
    </div>
    <div class="mb-3">
        <label for="transaction-bucket" class="form-label"> Bucket </label>
        <Select
            bind:value="{bucketId}"
            options="{buckets.map(b => b.name)}"
            values="{buckets.map(b => b.id)}"
        />
    </div>
    <div class="mb-3">
        <label for="transaction-description" class="form-label">
            Description
        </label>
        <textarea
            name="transaction-description"
            id="transaction-description"
            class="form-control"
            bind:value="{description}"
        ></textarea>
    </div>
    <!-- <div class="mb-3">
        <label for="transaction-subtype" class="form-label
        ">
            Subtype
        </label>
        <Select bind:value={subtypeId} options={buckets.map(b => b.name)} values={buckets.map(b => b.id)} />
    </div> -->
    <div class="mb-3">
        <label for="transaction-tax-deductible" class="form-label">
            Tax Deductible
        </label>
        <input
            type="checkbox"
            id="transaction-tax-deductible"
            class="form-check
        "
            bind:checked="{taxDeductible}"
        />
    </div>
</form>
