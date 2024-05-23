<script lang="ts">
import { onMount } from 'svelte';
import { Bucket } from '../../../models/transactions/bucket';
import { capitalize } from '../../../../shared/text';
import { Modal } from '../../../utilities/modals';
import NewBucket from './NewBucket.svelte';

let buckets: Bucket[] = [];
let selected: string[] = [];
export let active: Bucket[] = [];
$: active = buckets.filter(b => selected.includes(b.id));

onMount(() => {
    Bucket.all().then(b => {
        if (b.isErr()) return console.error(b.error);
        buckets = b.value;
    });

    return () => {
        // cleanup
        buckets = [];
    };
});

let colors = [
    'primary',
    'secondary',
    'success',
    'danger',
    'warning',
    'info',
    'light'
];

const createBucket = () => {
    const m = new Modal();
    m.setTitle('New Bucket');
    const b = new NewBucket({
        target: m.target.querySelector('.modal-body') as HTMLElement
    });
    m.show();
    b.$on('new-bucket', () => {
        m.hide();
        m.destroy();
    });
};

onMount(() => {
    Bucket.all().then(b => {
        if (b.isErr()) return console.error(b.error);
        buckets = b.value;
    });

    return () => {
        // cleanup
        buckets = [];
    };
});

Bucket.on('new', b => {
    buckets = [...buckets, b];
});
</script>

<div class="btn-group button-selector" role="group" aria-label="buckets">
    {#each buckets as bucket, i}
        <input
            type="checkbox"
            class="btn-check"
            id="bucket-check-{i}"
            bind:group="{selected}"
            value="{bucket.id}"
        />
        <label
            class="btn btn-outline-{colors[colors.length % (i + 1)]}"
            for="bucket-check-{i}"
        >
            {capitalize(bucket.name)}
        </label>
    {/each}
    <button class="btn btn-primary" on:click="{createBucket}">
        <div class="material-icons">add</div>
        New Bucket
    </button>
</div>

<style>
    .button-selector {
        width: 100vw;
        overflow-x: auto;
    }
</style>