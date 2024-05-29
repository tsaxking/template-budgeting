<script lang="ts">
import { Color } from '../../../submodules/colors/color';
import { createEventDispatcher } from 'svelte';
import { select } from "../../../utilities/notifications";
const d = createEventDispatcher();

    export let options: string[] = [];
    export let values: string[] = [];
    export let buttonText = 'Add';

let colors = [
    'primary',
    'secondary',
    'success',
    'danger',
    // 'warning',
    // 'info',
    // 'light'
];



    let selected: number[] = [];
    export let selectedValues: string[] = [];
    export let selectedOptions: string[] = [];

    let available: number[] = options.map((_, i) => i);
    $: {
        selected = selected.filter((v, i) => selected.indexOf(v) === i).sort((a, b) => a - b);
        selectedValues = selected.map(i => values[i] || options[i]);
        selectedOptions = selected.map(i => options[i]);
        available = options
            .map((_, i) => i)
            .filter((_, i) => !selected.includes(i));
    }   

    $: d('change', selectedValues);

    $: {
        // if (colors.length) {
        //     if (colors.length !== options.length) {
        //         throw new Error('Color and options must be the same length');
        //     }
        // }
        if (values.length) {
            if (values.length !== options.length) {
                throw new Error('Values and options must be the same length');
            }
        }
    }

    const add = async () => {
        const value = await select('Select an option', available.map(i => options[i]));
        if (value < 0) return; // did not select a value
        selected = [...selected, available[value]];
    }
</script>

<div class="d-flex me-2">
    {#each selected as s, i}
        <div class="me-1 px-3 text-light h-100 rounded bg-{colors[i % colors.length]}"
            style="
                display: flex;
                align-items: center;
                justify-content: space-between;
            "
        >
            {options[s]}
            <button class="btn-close" aria-label="Close" on:click={() => selected = selected.filter(v => v !== s)}></button>
        </div>
    {/each}
    <button class="ms-5 btn btn-secondary" on:click={add}>
        <div class="material-icons">add</div>
        {buttonText}
    </button>
</div>



<!-- <select multiple class="form-control" bind:value={selected} {style}>
    {#each options as option, i}
        <option value={i}>{option}</option>
    {/each}
</select> -->