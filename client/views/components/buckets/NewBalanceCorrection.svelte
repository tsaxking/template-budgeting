<script lang="ts">
import { createEventDispatcher } from 'svelte';
import { Bucket } from '../../../models/transactions/bucket';
import DateTimeInput from '../bootstrap/DateTimeInput.svelte';

export let bucket: Bucket;

let amount: string = '';
let date = new Date();

const d = createEventDispatcher();

const create = async () => {
    const b = await bucket.newBalanceCorrection({
        balance: parseFloat(amount),
        date: date.getTime()
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
                <DateTimeInput bind:date />
            </div>
            <button type="submit" class="btn btn-primary"> Submit </button>
        </form>
    </div>
</div>
