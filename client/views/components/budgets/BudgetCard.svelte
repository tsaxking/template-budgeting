<script lang="ts">
import { onMount } from 'svelte';
import { attemptAsync, resolveAll } from '../../../../shared/check';
import { Budget } from '../../../models/transactions/budget';
import { cost } from '../../../../shared/text';
import { Modal } from '../../../utilities/modals';
import EditBudget from './EditBudget.svelte';
import NewBudget from './NewBudget.svelte';
import { confirm } from '../../../utilities/notifications';
import { Subtype } from '../../../models/transactions/subtype';
import type { BudgetInterval } from '../../../../server/utilities/tables';
import { Transaction } from '../../../models/transactions/transaction';

const now = new Date();
let budgets: {
    max: number;
    total: number;
    percent: number;
    budget: Budget;
    color: string;
}[] = [];

const init = async () => {
    const res = await Budget.all();
    if (res.isErr()) return console.error(res.error);
    const data = resolveAll(
        await Promise.all(
            res.value.map(async b => {
                return attemptAsync(async () => {
                    const budget = (
                        await b.getBudget(now.getMonth(), now.getFullYear())
                    ).unwrap();
                    const percent = Math.round(
                        (budget.total / budget.max) * 100
                    );
                    return {
                        ...budget,
                        percent,
                        color:
                            percent > 75
                                ? 'danger'
                                : percent > 50
                                  ? 'warning'
                                  : 'success',
                        budget: b
                    };
                });
            })
        )
    );
    if (data.isErr()) return console.error(data.error);
    budgets = data.value;

    console.log('BUDGETS:', budgets);
};

onMount(() => {
    init();
    return () => {
        budgets = [];
    };
});

const edit = (budget: Budget) => {
    const m = new Modal();
    m.setTitle(`Edit Budget ${budget.name}`);
    const e = new EditBudget({
        target: m.target.querySelector('.modal-body') as HTMLDivElement,
        props: {
            budget
        }
    });

    let name = '';
    let amount = 0;
    let description = '';
    let interval: BudgetInterval = 'monthly';
    let subtypes: Subtype[] = [];

    e.$on('change', (e) => {
        const { data, subtypes: s } = e.detail;
        name = data.name;
        amount = data.amount;
        description = data.description;
        interval = data.interval;
        subtypes = s;
    });

    const submit = create('button');
    submit.classList.add('btn', 'btn-primary');
    submit.innerText = 'Submit';
    submit.onclick = async () => {
        const [update, ...rest] = await Promise.all([
            budget.update({
                name,
                amount,
                description,
                interval
            }),
            ...subtypes.map(s => budget.addSubtype(s))
        ]);

        if (update.isErr()) console.error(update.error);
        const res = resolveAll(rest);
        if (res.isErr()) console.error(res.error);

        m.hide();
        e.$destroy();
    };

    const destroy = create('button');
    destroy.classList.add('btn', 'btn-danger');
    destroy.innerText = 'Delete';
    destroy.onclick = async () => {
        if (await confirm('Are you sure you want to delete this budget?')) {
            const res = await budget.setArchive(true);
            if (res.isErr()) return console.error(res.error);
            m.hide();
            e.$destroy();
        }
    };

    m.addButton(destroy);
    m.addButton(submit);

    m.show();
};

const newBudget = () => {
    const m = new Modal();
    m.setTitle('New Budget');
    const e = new NewBudget({
        target: m.target.querySelector('.modal-body') as HTMLDivElement
    });

    let name = '';
    let amount = 0;
    let description = '';
    let interval: BudgetInterval = 'monthly';
    let subtypes: Subtype[] = [];

    e.$on('change', (e) => {
        const { data, subtypes: s } = e.detail;
        name = data.name;
        amount = data.amount;
        description = data.description;
        interval = data.interval;
        subtypes = s;
    });

    const submit = create('button');
    submit.classList.add('btn', 'btn-primary');
    submit.innerText = 'Submit';
    submit.onclick = () => {
        Budget.new({
            name,
            amount,
            description,
            interval,
        }, subtypes);

        m.hide();
        e.$destroy();
    };

    m.addButton(submit);

    m.show();
};


Budget.on('new', init);
Budget.on('update', init);
Budget.on('archive', init);
Transaction.on('new', init);
Transaction.on('update', init);
Transaction.on('archive', init);
</script>

<div class="container">
    {#each budgets as budget, i}
        <div class="row mb-3">
            <h5>{budget.budget.name}</h5>
            <div class="col-10">
                <div
                    class="progress"
                    role="progressbar"
                    aria-label="{budget.budget.name} Progress"
                    aria-valuenow="{budget.total}"
                    aria-valuemin="0"
                    aria-valuemax="{budget.max}"
                    style="height: 30px;"
                >
                    <div
                        class="progress-bar
                        bg-{budget.color}
                    "
                        style="width: {budget.percent}%;"
                    >
                        {budget.percent}% ({cost(budget.total)} / {cost(
                            budget.max
                        )})
                    </div>
                </div>
            </div>
            <div class="col-2">
                <button
                    class="btn btn-primary"
                    on:click="{() => edit(budget.budget)}"
                >
                    <i class="material-icons">edit</i>
                </button>
            </div>
            {#if i < budgets.length - 1}
                <hr />
            {/if}
        </div>
    {/each}

    <div class="row">
        <button class="btn btn-primary" on:click="{newBudget}">
            <i class="material-icons">add</i>
        </button>
    </div>
</div>
