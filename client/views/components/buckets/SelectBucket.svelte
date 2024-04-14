<script lang="ts">
    import { onMount } from "svelte";
    import { Bucket } from "../../../models/transactions/bucket";
    import { capitalize } from "../../../../shared/text";
    
    let buckets: Bucket[] = [];
    let selected: string[] = [];
    export let active: Bucket[] = [];
    $: active = buckets.filter((b) => selected.includes(b.id));
    
    onMount(() => {
        Bucket.all().then((b) => {
            if (b.isErr()) return console.error(b.error);
            buckets = b.value;
        });
    
    
    
        return () => {
            // cleanup
            buckets = [];
        }
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
    </script>
    
    <div class="btn-group" role="group" aria-label="buckets">
        {#each buckets as bucket, i}
        <input type="checkbox" class="btn-check" id="bucket-check-{i}" bind:group={selected} value={bucket.id}>
        <label class="btn btn-outline-{colors[colors.length % i]}" for="bucket-check-{i}">
            {capitalize(bucket.name)}
        </label>
        {/each}
    </div>