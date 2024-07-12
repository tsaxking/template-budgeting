<script lang="ts">
import { Budget } from '../../../models/transactions/budget';
import { createEventDispatcher, onMount } from 'svelte';
import { Subtype } from '../../../models/transactions/subtype';
import { Modal } from '../../../utilities/modals';
import Select from '../../components/types/Select.svelte';
import { resolveAll } from '../../../../shared/check';

const d = createEventDispatcher();

export let budget: Budget;

let name = budget.name;
let description = budget.description;
let amount = budget.amount;
let interval = budget.interval;
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
        select.$destroy();
    };

    m.addButton(submit);

    select.$on('change', (e: CustomEvent<Subtype>) => {
        s = e.detail;
    });

    m.show();
};

const init = async () => {
    const res = await budget.getSubtypes();
    if (res.isErr()) return console.log(res.error);
    subtypes = res.value;
};

onMount(() => {
    init();
});

</script>

<div class="container">
    <div class="row">
        <div class="col-12">
            <h1>New Budget</h1>
        </div>
    </div>
    <div class="row">
        <div class="col-12">
            <div class="form-group" id="edit-budget-{budget.id}-name">
                <label for="edit-budget-{budget.id}-name">Name</label>
                <input type="text" class="form-control" bind:value="{name}" />
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-12">
            <div class="form-group" id="edit-budget-{budget.id}-amount">
                <label for="edit-budget-{budget.id}-amount">Amount</label>
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
            <div class="form-group" id="edit-budget-{budget.id}-description">
                <label for="edit-budget-{budget.id}-description"
                    >Description</label
                >
                <textarea class="form-control" bind:value="{description}"
                ></textarea>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-12">
            <div class="form-group" id="edit-budget-{budget.id}-interval">
                <label for="edit-budget-{budget.id}-interval">Interval</label>
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
