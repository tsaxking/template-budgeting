<script lang="ts">
import { Type } from '../../../models/transactions/type';
import { resolveAll } from '../../../../shared/check';
import { Pie } from 'svelte-chartjs';
import Select from '../bootstrap/Select.svelte';

export let from: number;
export let to: number;
export let type: 'type' | 'subtype' = 'type';
export let io: 'withdrawal' | 'deposit' = 'withdrawal';
let types: Type[] = [];
let selected = 'types';
let selectedType: Type | undefined;
$: selectedType = types.find(t => t.id === selected);

let datasets: { label: string; data: number[] }[] = [];
let labels: string[] = [];

const reset = async (
    from: number,
    to: number,
    type: 'type' | 'subtype',
    io: 'withdrawal' | 'deposit',
    selectedType: Type | undefined
) => {
    if (type === 'type') {
        const typeRes = await Type.all();
        if (typeRes.isErr()) return console.error(typeRes.error);
        types = typeRes.value;
        const res = resolveAll(
            await Promise.all(types.map(type => type.getTransactions(from, to)))
        );
        if (res.isErr()) return console.error(res.error);

        labels = types.map(t => t.name);
        datasets = [
            {
                label: '',
                data: res.value.map(t =>
                    t
                        .filter(t => t.type === io)
                        .reduce((acc, curr) => acc + curr.amount, 0)
                )
            }
        ];
    } else {
        const subtypes = await selectedType?.getSubtypes();
        if (!subtypes) return console.error('Type is not selected');
        if (subtypes.isErr()) return console.error(subtypes.error);
        const res = resolveAll(
            await Promise.all(
                subtypes.value.map(subtype => subtype.getTransactions(from, to))
            )
        );
        if (res.isErr()) return console.error(res.error);

        labels = subtypes.value.map(t => t.name);
        datasets = [
            {
                label: '',
                data: res.value.map(t =>
                    t
                        .filter(t => t.type === io)
                        .reduce((acc, curr) => acc + curr.amount, 0)
                )
            }
        ];
    }
};

$: reset(from, to, type, io, selectedType);
</script>

<Select
    options="{['All Types', ...types.map(t => t.name)]}"
    values="{['types', ...types.map(t => t.id)]}"
    bind:value="{selected}"
/>

<div class="btn-group">
    <button
        class="btn btn-danger"
        class:active="{io == 'withdrawal'}"
        on:click="{() => (io = 'withdrawal')}"
    >
        Withdrawals
    </button>
    <button
        class="btn btn-success"
        class:active="{io == 'deposit'}"
        on:click="{() => (io = 'deposit')}"
    >
        Deposits
    </button>
</div>

<Pie
    data="{{
        labels,
        datasets
    }}"
    options="{{
        responsive: true
    }}"
/>
