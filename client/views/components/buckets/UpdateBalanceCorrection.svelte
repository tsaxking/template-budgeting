<script lang="ts">
import { BalanceCorrection } from '../../../models/transactions/balance-correction';
import DateTimeInput from '../bootstrap/DateTimeInput.svelte';
import { createEventDispatcher, onMount } from 'svelte';
import { Bucket } from '../../../models/transactions/bucket';
import Select from '../bootstrap/Select.svelte';

export let correction: BalanceCorrection;

let buckets: Bucket[] = [];
let date = new Date(correction.date);
let bucketId = correction.bucketId;
let balance: number = correction.balance;

const d = createEventDispatcher();
const submit = () => {
    correction.update({
        date: date.getTime(),
        balance
    });
    d('submit');
}

onMount(() => {
    Bucket.all().then(b => {
        if (b.isErr()) return console.error(b.error);
        buckets = b.value;
    });
    return () => { buckets = []; };
});
</script>

<form on:submit|preventDefault="{submit}">
    <DateTimeInput bind:date />
    <div class="mb-3">
        <label for="correction-balance" class="form-label">
            Balance
        </label>
        <input
            type="number"
            id="correction-balance"
            class="form-control"
            bind:value="{balance}"
            step="0.01"
        /> 
    </div>
    <div class="mb-3">
        <Select bind:value="{bucketId}" options="{buckets.map(b => b.name)}" values={buckets.map(b => b.id)} />
    </div>
    <button type="submit" class="btn btn-primary"> Submit </button>
</form>