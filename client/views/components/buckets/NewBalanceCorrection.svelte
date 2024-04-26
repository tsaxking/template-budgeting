<script lang="ts">
import { createEventDispatcher } from 'svelte';
import { Bucket } from '../../../models/transactions/bucket';

export let bucket: Bucket;

let amount: string = '';
let date: string = new Date().toISOString().split('T')[0];

const d = createEventDispatcher();

const create = async () => {
    const b = await bucket.newBalanceCorrection({
        balance: parseFloat(amount),
        date: new Date(date).getTime()
    });

    if (b.isErr()) {
        console.error(b.error);
    } else {
        d('correction-created');
    }
};
</script>

<div class="container">
    <div class="row mb-3">
        <form on:submit|preventDefault="{create}">
            <div class="mb-3">
                <label for="correction-amount" class="form-label">
                    Amount
                </label>
                <input
                    type="number"
                    id="correction-amount"
                    class="form-control"
                    bind:value="{amount}"
                    step="0.01"
                />
            </div>
            <div class="mb-3">
                <label for="correction-date" class="form-label"> Date </label>
                <input
                    name="correction-date"
                    id="correction-date"
                    class="form-control"
                    type="date"
                    bind:value="{date}"
                />
            </div>
            <button type="submit" class="btn btn-primary"> Submit </button>
        </form>
    </div>
</div>
