<script lang="ts">
import { createEventDispatcher, onMount } from 'svelte';
import { Transaction } from '../../../models/transactions/transaction';
import { Bucket } from '../../../models/transactions/bucket';
import Select from '../bootstrap/Select.svelte';
import { Type } from '../../../models/transactions/type';
import { Subtype } from '../../../models/transactions/subtype';
import TypeSelector from '../types/TypeSelector.svelte';
import SubtypeSelector from '../types/SubtypeSelector.svelte';
import DateTimeInput from '../bootstrap/DateTimeInput.svelte';

let buckets: Bucket[] = [];

onMount(() => {
    Bucket.all().then(b => {
        if (b.isErr()) return console.error(b.error);
        buckets = b.value;
    });
});

let amount = '';
let date = new Date();
let status: 'pending' | 'completed' | 'failed' = 'pending';
let bucketId = '';
let description = '';
let type: 'withdrawal' | 'deposit' = 'withdrawal';
let subtypeId = '';
let taxDeductible = false;

let t: Type | undefined;
let s: Subtype | undefined;

$: subtypeId = s?.id || '';

const d = createEventDispatcher();

const create = async () => {
    Transaction.new({
        amount: parseFloat(amount),
        date: date.getTime(),
        status,
        bucketId,
        description,
        type,
        subtypeId,
        taxDeductible
    });

    d('transaction-created');
};
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
        <DateTimeInput bind:date={date} />
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
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
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
    <div class="mb-3">
        <label for="transaction-type mb-1" class="form-label"> Type </label>
        <TypeSelector bind:value={t} />
        {#if t}
            <label for="transaction-subtype mb-1">
                Subtype
            </label>
            <SubtypeSelector bind:value={s} type={t} />
        {/if}
    </div>
    <div class="mb-3">
        <div class="form-check form-switch">
            <input
                type="checkbox"
                class="form-check-input"
                id="transaction-tax-deductible"
                bind:checked="{taxDeductible}"
            />
            <label
                class="form-check-label"
                for="transaction-tax-deductible"
            >
                Tax Deductible
            </label>
        </div>
    </div>
    <button type="submit" class="btn btn-primary"> Create </button>
</form>
