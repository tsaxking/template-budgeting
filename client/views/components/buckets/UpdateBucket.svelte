<script lang="ts">
import { Bucket } from '../../../models/transactions/bucket';
import { BucketType } from '../../../../shared/db-types-extended';

export let bucket: Bucket | undefined = undefined;

let name = '';
let description = '';
let type: BucketType = 'debit';

$: name = bucket?.name || '';
$: description = bucket?.description || '';
$: type = bucket?.type || 'debit';

const update = async () => {
    if (!bucket)
        throw new Error('There should always be a bucket by this point');
    if (!name.length) return alert('Cannot create a bucket without a name');

    if (name !== bucket.name) {
        const buckets = await Bucket.all();
        if (buckets.isErr()) throw buckets.error;

        if (
            buckets.value.findIndex(
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
};
</script>

<form on:submit|preventDefault="{update}">
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
            bind:value="{name}"
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
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
            <option value="savings">Savings</option>
        </select>
    </div>
</form>
