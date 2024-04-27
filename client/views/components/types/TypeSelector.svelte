<script lang="ts">
import { createEventDispatcher, onMount } from 'svelte';
import { Type } from '../../../models/transactions/type';
import { prompt } from '../../../utilities/notifications';
import Select from '../bootstrap/Select.svelte';
let types: Type[] = [];

Type.on('new', (t) => {
    types = [...types, t];
});

const d = createEventDispatcher();

export let value: Type | undefined;
console.log(value);
let selected: string | undefined = value?.id || '';
$: {
    value = value ? value : types.find(type => type.id === selected);
    d('change', value);
}

$: console.log({ selected });

const create = async () => {
    prompt('Enter the name of the new type').then((n) => {
        if (n) Type.new(n);
    });
};

onMount(() => {
    Type.all().then(t => {
        if (t.isErr()) return console.error(t.error);
        types = t.value;
    });
    return () => {
        types = [];
        value = undefined;
        selected = undefined;
    };
});
</script>

<div class="container-fluid p-0 m-0">
    <div class="row m-0 p-0">
        <div class="col-9 m-0 p-0">
            <Select
                bind:value="{selected}"
                options="{types.map(t => t.name)}"
                values="{types.map(t => t.id)}"
                defaultValue="Select a type"
            />
        </div>
        <div class="col-3 m-0 p-0">
            <button class="btn btn-primary" on:click|preventDefault="{create}">
                <i class="fas fa-plus"></i>
            </button>
        </div>
    </div>
</div>
