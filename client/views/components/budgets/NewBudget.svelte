<script lang="ts">
import { Budget } from '../../../models/transactions/budget';
import { createEventDispatcher, onMount } from 'svelte';
import type { BudgetInterval } from '../../../../server/utilities/tables';
import { Subtype } from '../../../models/transactions/subtype';
import { Modal } from '../../../utilities/modals';
import Select from '../../components/types/Select.svelte';
import { Random } from '../../../../shared/math';

const id = Random.uuid();

const d = createEventDispatcher();

let name = '';
let amount = 0;
let description = '';
let interval: BudgetInterval = 'monthly';

let subtypes: Subtype[] = [];

$: {
    d('change', {
        data: {
            name: name.trim(),
            amount,
            description: description.trim(),
            interval
        },
        subtypes
    });
}

const selectSubtype = () => {
    const m = new Modal();
    m.setTitle('Select Subtype');
    const select = new Select({
        target: m.target.querySelector('.modal-body') as HTMLDivElement
    });

    let s: Subtype | undefined;

    const submit = create('button');
    submit.classList.add('btn', 'btn-primary');
    submit.innerText = 'Submit';
    submit.onclick = () => {
        m.hide();
        if (s) subtypes = [...subtypes, s];
    };

    m.addButton(submit);

    select.$on('change', (e: CustomEvent<Subtype>) => {
        s = e.detail;
    });

    m.show();
};
</script>

<div class="container">
    <div class="row">
        <div class="col-12">
            <h1>New Budget</h1>
        </div>
    </div>
    <div class="row">
        <div class="col-12">
            <div class="form-group" id="new-budget-{id}-name">
                <label for="new-budget-{id}-name">Name</label>
                <input type="text" class="form-control" bind:value="{name}" />
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-12">
            <div class="form-group" id="new-budget-{id}-amount">
                <label for="new-budget-{id}-amount">Amount</label>
                <input
                    type="number"
                    class="form-control"
                    bind:value="{amount}"
                />
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-12">
            <div class="form-group" id="new-budget-{id}-description">
                <label for="new-budget-{id}-description">Description</label>
                <textarea class="form-control" bind:value="{description}"
                ></textarea>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-12">
            <div class="form-group" id="new-budget-{id}-interval">
                <label for="new-budget-{id}-interval">Interval</label>
                <select class="form-control" bind:value="{interval}">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                </select>
            </div>
        </div>
    </div>
    <div class="row">
        {#each subtypes as subtype}
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <h5>{subtype.name}</h5>
                    </div>
                </div>
            </div>
        {/each}
        <div class="col-12">
            <button class="btn btn-primary" on:click="{selectSubtype}"
                >Add Subtype</button
            >
        </div>
    </div>
</div>
