<script lang="ts">
import { createEventDispatcher } from "svelte";
import { Type } from "../../../models/transactions/type";
    export let T: Type;

    let name: string;
    let type: 'withdrawal' | 'deposit';

    const d = createEventDispatcher();

    const create = () => {
        T.newSubtype(name, type);
        d('created');
    }

</script>

<form on:submit|preventDefault={create}>
    <div class="form-group">
        <label for="name">Name</label>
        <input type="text" class="form-control" id="name" bind:value={name} />
    </div>
    <div class="form-group">
        <label for="type">Type</label>
        <select class="form-control" id="type" bind:value={type}>
            <option value="withdrawal">Withdrawal</option>
            <option value="deposit">Deposit</option>
        </select>
    </div>
    <button type="submit" class="btn btn-primary">Create</button>
</form>