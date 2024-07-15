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
import { Random } from '../../../../shared/math';
import { Goal } from '../../../models/transactions/goal';
import { select } from '../../../utilities/notifications';

const id = Random.uuid();

export let transaction: Transaction;

let buckets: Bucket[] = [];

onMount(() => {
    transaction.getTypeInfo().then(data => {
        if (data.isErr()) return console.error(data.error);
        t = data.value?.type || undefined;
        s = data.value?.subtype || undefined;
    });

    Bucket.all().then(b => {
        if (b.isErr()) return console.error(b.error);
        buckets = b.value;
    });

    return () => {
        buckets = [];
    };
});

let amount = transaction.amount.toString();
let date = new Date(transaction.date);
let status: 'pending' | 'completed' | 'failed' = transaction.status;
let bucketId = transaction.bucketId;
let description = transaction.description;
let type: 'withdrawal' | 'deposit' = transaction.type;
let subtypeId = transaction.subtypeId;
let taxDeductible = transaction.taxDeductible === 1;

let t: Type | undefined;
let s: Subtype | undefined;

$: subtypeId = s?.id || '';
$: console.log({ t, s });

const d = createEventDispatcher();

const update = async () => {
    transaction.update({
        amount: parseFloat(amount),
        date: date.getTime(),
        status,
        bucketId,
        description,
        type,
        subtypeId,
        taxDeductible: taxDeductible ? 1 : 0
    });

    d('transaction-updated');
};

const addToGoal = async () => {
    const goals = await Goal.all();
    if (goals.isErr()) return console.error(goals.error);

    const index = await select(
        'Select a goal',
        goals.value.map(g => g.name)
    );

    const g = goals.value[index];
    if (!g) return;

    g.addTransaction(transaction);
};

const removeFromGoal = async () => {
    const goals = await Goal.all();
    if (goals.isErr()) return console.error(goals.error);

    const index = await select(
        'Select a goal',
        goals.value.map(g => g.name)
    );

    const g = goals.value[index];
    if (!g) return;

    g.removeTransaction(transaction);
};
</script>

<form on:submit|preventDefault="{update}">
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
        <!-- button radio -->
        <div class="btn-group" role="group">
            <input
                type="radio"
                class="btn-check"
                name="transaction-type"
                id="transaction-type-withdrawal-{id}"
                value="withdrawal"
                bind:group="{type}"
            />
            <label
                class="btn btn-outline-danger"
                for="transaction-type-withdrawal-{id}"
            >
                Withdrawal
            </label>
            <input
                type="radio"
                class="btn-check"
                name="transaction-type"
                id="transaction-type-deposit-{id}"
                value="deposit"
                bind:group="{type}"
            />
            <label
                class="btn btn-outline-success"
                for="transaction-type-deposit-{id}"
            >
                Deposit
            </label>
        </div>
    </div>
    <div class="mb-3">
        <DateTimeInput bind:date />
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
        <TypeSelector bind:value="{t}" />
        {#if t}
            <label for="transaction-subtype mb-1"> Subtype </label>
            <SubtypeSelector bind:value="{s}" bind:type="{t}" />
        {/if}
    </div>
    {#if type === 'withdrawal'}
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
    {/if}
    <button type="submit" class="btn btn-primary"> Update </button>
    <button type="button" class="btn btn-secondary" on:click="{addToGoal}">
        Add to Goal
    </button>
    <button type="button" class="btn btn-secondary" on:click="{removeFromGoal}">
        Remove from Goal
    </button>
</form>
