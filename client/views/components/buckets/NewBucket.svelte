<script lang="ts">
import { Bucket } from '../../../models/transactions/bucket';
import { type BucketType } from '../../../../shared/db-types-extended';
import { alert } from '../../../utilities/notifications';
import { createEventDispatcher } from 'svelte';

const d = createEventDispatcher();

let name = '';
let description = '';
let type: BucketType = 'debit';

const create = async () => {
    if (!name.length) return alert('Cannot create a bucket without a name');
    const buckets = await Bucket.all();
    if (buckets.isErr()) throw buckets.error;

    if (
        buckets.value.findIndex(
            b => b.name.toLowerCase() === name.toLowerCase()
        ) !== -1
    ) {
        return alert(`Cannot create bucket with the same name (${name})`);
    }

    Bucket.new(name, description, type);

    d('new-bucket', { name, description, type });
};
</script>

<form on:submit|preventDefault="{create}">
    <div class="mb-3">
        <label for="bucket-name" class="form-label"> Name </label>
        <input
            type="text"
            id="bucket-name"
            class="form-control"
            bind:value="{name}"
        />
    </div>
    <div class="mb-3">
        <label for="bucket-description" class="form-label"> Description </label>
        <textarea
            name="bucket-description"
            id="description"
            class="form-control"
            bind:value="{description}"
        ></textarea>
    </div>
    <div class="mb-3">
        <label for="bucket-type" class="form-label">Type</label>
        <select
            name="bucket-type"
            id="bucket-type"
            class="form-select"
            bind:value="{type}"
        >
            <option value="debit" selected>Debit</option>
            <option value="credit">Credit</option>
            <option value="savings">Savings</option>
            <option value="other">Other</option>
        </select>
    </div>
    <button type="submit" class="btn btn-primary">Submit</button>
</form>
