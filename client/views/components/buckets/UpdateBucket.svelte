<script lang="ts">
import { Bucket } from '../../../models/transactions/bucket';
import { Random } from '../../../../shared/math';
import { createEventDispatcher } from 'svelte';
const id = Random.uuid();

export let bucket: Bucket;

const d = createEventDispatcher();

let name = bucket.name;
let description = bucket.description;
let type = bucket.type;

const update = async () => {
    if (!name.length) return alert('Cannot create a bucket without a name');

    if (name !== bucket.name) {
        const buckets = await Bucket.all();
        if (buckets.isErr()) throw buckets.error;

        if (
            buckets.value.find(
                b => b.name.toLowerCase() === name.toLowerCase()
            )
        ) {
            return alert(`Cannot create bucket with the same name (${name})`);
        }
    }

    bucket.update({
        name,
        description,
        type
    });

    d('submit');
};

</script>

<form on:submit|preventDefault="{update}">
    <div class="mb-3">
        <label for="bucket-name-{id}" class="form-label"> Name </label>
        <input
            type="text"
            id="bucket-name-{id}"
            class="form-control"
            bind:value="{name}"
        />
    </div>
    <div class="mb-3">
        <label for="bucket-description-{id}" class="form-label"> Description </label>
        <textarea
            name="bucket-description"
            id="bucket-description-{id}"
            class="form-control"
            bind:value="{description}"
        ></textarea>
    </div>
    <div class="mb-3">
        <label for="bucket-type-{id}" class="form-label">Type</label>
        <select
            name="bucket-type"
            id="bucket-type-{id}"
            class="form-select"
            bind:value="{type}"
        >
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
            <option value="savings">Savings</option>
            <option value="other"> Other </option>
        </select>
    </div>
    <button type="submit" class="btn btn-primary"> Submit </button>
</form>
