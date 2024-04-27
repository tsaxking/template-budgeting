<script lang="ts">
import { Type } from '../../../models/transactions/type';
import { Subtype } from '../../../models/transactions/subtype';
import { prompt } from '../../../utilities/notifications';
import Select from '../bootstrap/Select.svelte';
import { createEventDispatcher, onMount } from 'svelte';
import { Modal } from '../../../utilities/modals';
import NewSubtype from './NewSubtype.svelte';
export let type: Type;
export let subtypes: Subtype[] = [];

const mount = (type: Type) => {
    type.getSubtypes().then(s => {
        if (s.isErr()) {
            subtypes = [];
            return console.error(s.error);
        }
        subtypes = s.value;
    });
}

Subtype.on('new', () => {
    mount(type);
});

const d = createEventDispatcher();

export let value: Subtype | undefined;
let selected: string | undefined = value?.id;
$: {
    value = subtypes.find(subtype => subtype.id === selected);
    d('change', value);
}

$: mount(type);

$: console.log({ selected });

const create = async () => {
    const m = new Modal();
    m.setTitle('Create a new subtype');
    const b = new NewSubtype({
        target: m.target.querySelector('.modal-body') as HTMLElement,
        props: {
            T: type
        }
    });
    m.show();
    b.$on('created', () => {
        m.hide();
    });
};

onMount(() => {
    mount(type);
    return () => {
        subtypes = [];
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
                options="{subtypes.map(t => t.name)}"
                values="{subtypes.map(t => t.id)}"
                defaultValue="Select a subtype"
            />
        </div>
        <div class="col-3 m-0 p-0">
            <button class="btn btn-primary" on:click|preventDefault="{create}">
                <i class="fas fa-plus"></i>
            </button>
        </div>
    </div>
</div>
