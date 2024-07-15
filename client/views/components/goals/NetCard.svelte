<script lang="ts">
import { onMount } from 'svelte';
import { Bucket } from '../../../models/transactions/bucket';
import { Budget } from '../../../models/transactions/budget';
import { Transaction } from '../../../models/transactions/transaction';
import { Goal } from '../../../models/transactions/goal';
import { cost } from '../../../../shared/text';
import { Modal } from '../../../utilities/modals';
import NewGoal from './NewGoal.svelte';
import { type BudgetInterval } from '../../../../server/utilities/tables';
import EditGoal from './EditGoal.svelte';

let data: {
    goal: Goal;
    saved: number;
}[] = [];
let disposable = 0;

const init = async () => {
    const info = await Bucket.parseNet(new Date());
    if (info.isErr()) return console.error(info.error);
    data = info.value.saved;
    disposable = info.value.disposable;

    console.log('DATA', data);
    console.log('DISPOSABLE', disposable);
};

onMount(() => {
    init();
    return () => {
        // Cleanup
    };
});

Bucket.on('update', init);
Bucket.on('new', init);
Transaction.on('new', init);
Transaction.on('update', init);
Transaction.on('archive', init);
Budget.on('new', init);
Budget.on('update', init);

const edit = (goal: Goal) => {
    const m = new Modal();
    m.setTitle('Edit Goal');
    const g = new EditGoal({
        target: m.target.querySelector('.modal-body') as HTMLDivElement,
        props: {
            goal
        }
    });

    let name = goal.name;
    let description = goal.description;
    let target = goal.target;
    let interval: BudgetInterval = goal.interval;
    let rank = goal.rank;
    let startDate = new Date(goal.startDate);
    let amount = goal.amount;
    let type: 'fixed' | 'percent' = goal.type;

    g.$on('change', ({ detail }) => {
        console.log('CHANGE', detail);
        name = detail.name;
        description = detail.description;
        target = detail.target;
        interval = detail.interval;
        rank = detail.rank;
        startDate = detail.startDate;
        amount = detail.amount;
        type = detail.type;
    });

    const submit = document.createElement('button');
    submit.classList.add('btn', 'btn-primary');
    submit.innerText = 'Submit';
    submit.onclick = async () => {
        const res = await goal.update({
            name,
            description,
            target,
            interval,
            rank,
            startDate: startDate.getTime(),
            amount,
            archived: false,
            type
        });
        if (res.isErr()) console.error(res.error);

        m.hide();
        m.destroy();
        g.$destroy();
    };
    m.addButton(submit);

    m.show();
};

const create = () => {
    const m = new Modal();
    m.setTitle('New Goal');
    const g = new NewGoal({
        target: m.target.querySelector('.modal-body') as HTMLDivElement
    });

    let name = '';
    let description = '';
    let target = 0;
    let interval: BudgetInterval = 'monthly';
    let rank = 0;
    let startDate = new Date();
    let amount = 0;
    let type: 'fixed' | 'percent' = 'percent';

    g.$on('change', ({ detail }) => {
        name = detail.name;
        description = detail.description;
        target = detail.target;
        interval = detail.interval;
        rank = detail.rank;
        startDate = detail.startDate;
        amount = detail.amount;
        type = detail.type;
    });

    const submit = document.createElement('button');
    submit.classList.add('btn', 'btn-primary');
    submit.innerText = 'Submit';
    submit.onclick = async () => {
        Goal.new({
            name,
            description,
            target,
            interval,
            rank,
            startDate: startDate.getTime(),
            amount,
            type
        });

        m.hide();
        m.destroy();
        g.$destroy();
    };
    m.addButton(submit);

    m.show();
};
</script>

<div class="container-fluid">
    <div class="row">
        <h5>
            Disposable: {cost(disposable)}
        </h5>
    </div>
    {#each data as { goal, saved }}
        <div class="row mb-3">
            <h5>
                {goal.name}
            </h5>
            <div class="col-10">
                {#if goal.target !== 0}
                    <div
                        class="progress"
                        role="progressbar"
                        aria-label="{goal.name} Progress"
                        aria-valuenow="{saved}"
                        aria-valuemin="0"
                        aria-valuemax="{goal.target}"
                        style="height: 30px;"
                    >
                        <div
                            class="progress-bar
                            bg-primary
                        "
                            style="width: {(saved / goal.target) * 100}%;"
                        >
                            {cost(saved)} / {cost(goal.target)}
                        </div>
                    </div>
                {:else}
                    Saved: {cost(saved)} (no target)
                {/if}
            </div>
            <div class="col-2">
                <button class="btn btn-primary" on:click="{() => edit(goal)}">
                    <i class="material-icons">edit</i>
                </button>
            </div>
        </div>
    {/each}
    <div class="row">
        <button class="btn btn-primary" on:click="{create}">
            <i class="material-icons">add</i>
        </button>
    </div>
</div>