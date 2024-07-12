<script lang="ts">
import { Subtype } from '../../../models/transactions/subtype';
import { Type } from '../../../models/transactions/type';
import SubtypeSelector from './SubtypeSelector.svelte';
import TypeSelector from './TypeSelector.svelte';
import { createEventDispatcher } from 'svelte';

const d = createEventDispatcher();

let subtype: Subtype | undefined;
let type: Type | undefined;
</script>

<TypeSelector on:change="{({ detail }) => (type = detail)}" />
{#if type}
    <SubtypeSelector
        bind:value="{subtype}"
        {type}
        on:change="{({ detail }) => d('change', detail)}"
    />
{/if}
