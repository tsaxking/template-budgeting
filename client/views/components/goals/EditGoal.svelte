<script lang="ts">
import { createEventDispatcher } from 'svelte';
import { Goal } from '../../../models/transactions/goal';

export let goal: Goal;

let name = goal.name;
let description = goal.description;
let amount = goal.amount;
let interval = goal.interval;
let rank = goal.rank;
let startDate = new Date(goal.startDate).toISOString().split('T')[0];
let target = goal.target;
let type: 'fixed' | 'percent' = goal.type;

const d = createEventDispatcher();

$: d('change', {
    name,
    description,
    amount,
    interval,
    rank,
    type,
    startDate: new Date(startDate),
    target,
});
</script>

<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <h5>Edit Goal</h5>
        </div>
    </div>
    <div class="row">
        <div class="col-12">
            <div class="form-group">
                <label for="name">Name</label>
                <input
                    type="text"
                    class="form-control"
                    id="name"
                    bind:value="{name}"
                />
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-12">
            <div class="form-group">
                <label for="description">Description</label>
                <textarea
                    class="form-control"
                    id="description"
                    bind:value="{description}"
                ></textarea>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-12">
            <div class="form-group">
                <label for="target">Target (0 for no target)</label>
                <input
                    type="number"
                    class="form-control"
                    id="target"
                    bind:value="{target}"
                />
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-12">
            <label for="amount">Amount (deducted each month)</label>
            <div class="input-group">
                <input
                    type="number"
                    class="form-control"
                    id="amount"
                    bind:value="{amount}"
                />
                <select class="form-control" id="type" bind:value="{type}">
                    <option value="fixed">Fixed</option>
                    <option value="percent">Percent</option>
                </select>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-12">
            <div class="form-group">
                <label for="interval">Interval</label>
                <select
                    class="form-select"
                    id="interval"
                    bind:value="{interval}"
                >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                </select>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-12">
            <div class="form-group">
                <label for="rank">Rank</label>
                <input
                    type="number"
                    class="form-control"
                    id="rank"
                    bind:value="{rank}"
                />
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-12">
            <div class="form-group">
                <label for="startDate">Start Date</label>
                <input
                    type="date"
                    class="form-control"
                    id="startDate"
                    bind:value="{startDate}"
                />
            </div>
        </div>
    </div>
</div>
