<script lang="ts">
import { createEventDispatcher } from 'svelte';
import { Random } from '../../../../shared/math';
import { Miles } from '../../../models/transactions/miles';
import { alert } from '../../../utilities/notifications';
import DateTimeInput from '../bootstrap/DateTimeInput.svelte';
const id = Random.uuid();
const d = createEventDispatcher();

let amount = 0;
let description = '';
let date = new Date();

const submit = async () => {
    if (!amount || !description) return alert('Please fill out all fields');

    const res = await Miles.new(amount, date.getTime(), description);
    if (res.isErr()) return console.error(res.error);
    d('miles-created', res.value);
};
</script>

<form on:submit|preventDefault="{submit}">
    <div class="mb-3">
        <label for="miles-amount-{id}" class="form-label"> Amount </label>
        <input
            type="number"
            id="miles-amount-{id}"
            class="form-control"
            step="{0.25}"
            bind:value="{amount}"
        />
    </div>
    <div class="mb-3">
        <DateTimeInput bind:date />
    </div>
    <div class="mb-3">
        <label for="miles-description-{id}" class="form-label">
            Description
        </label>
        <textarea
            name="miles-description"
            id="miles-description-{id}"
            class="form-control"
            bind:value="{description}"
        ></textarea>
    </div>
    <div class="mb-3">
        <button type="submit" class="btn btn-primary"> Add Miles </button>
    </div>
</form>
