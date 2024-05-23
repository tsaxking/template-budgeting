<script lang="ts">
import { createEventDispatcher, onMount } from 'svelte';
import { Bucket } from '../../../models/transactions/bucket';
import Select from '../bootstrap/Select.svelte';
import DateTimeInput from '../bootstrap/DateTimeInput.svelte';
import { Random } from '../../../../shared/math';
import { alert } from '../../../utilities/notifications';

const id = Random.uuid();
let buckets: Bucket[] = [];
let from: string;
let to: string;
let amount = '';
let date = new Date();
let description = '';

const d = createEventDispatcher();


onMount(() => {
    Bucket.all().then(b => {
        if (b.isErr()) return console.error(b.error);
        buckets = b.value;
    });

    return () => {
        buckets = [];
    };
});

const submit = async () => {
    if (from === to) return alert('From and to buckets cannot be the same');

    const f = buckets.find(b => b.id === from);
    if (!f) return alert('From bucket not found');

    const t = buckets.find(b => b.id === to);
    if (!t) return alert('To bucket not found');

    const res = await f.transfer(t, +amount, date.getTime(), description);
    if (res.isErr()) return console.error(res.error);

    d('transfer-created');
};


</script>

<form on:submit|preventDefault={submit}>
    <div class="mb-3">
        <label for="{id}-amount" class="form-label">Amount</label>
        <input 
            type="number"
            id="{id}-amount"
            class="form-control"
            bind:value="{amount}"
            step="0.01"
        >
    </div>
    <div class="mb-3">
        <label for="{id}-date" class="form-label">Date</label>
        <DateTimeInput bind:date="{date}" />
    </div>
    <div class="mb-3">
        <label for="{id}-description" class="form-label">Description</label>
        <textarea 
            id="{id}-description"
            class="form-control"
            bind:value="{description}"
        ></textarea>
    </div>
    <div class="mb-3">
        <label for="{id}-from" class="form-label">From</label>
        <Select 
            options="{buckets.map(b => b.name)}"
            values="{buckets.map(b => b.id)}"
            bind:value="{from}"
        />
    </div>
    <div class="mb-3">
        <label for="{id}-to" class="form-label">To</label>
        <Select 
            options="{buckets.map(b => b.name)}"
            values="{buckets.map(b => b.id)}"
            bind:value="{to}"
        />
    </div>
    <button type="submit" class="btn btn-primary">Transfer</button>
</form>