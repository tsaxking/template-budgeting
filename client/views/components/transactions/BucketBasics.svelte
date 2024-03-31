<script lang="ts">
import { onMount } from "svelte";
import { Bucket } from "../../../models/transactions/bucket";

    export let bucket: Bucket;
    export let from: number;
    export let to: number;

    onMount(() => {
        Promise.all([
            bucket.getBalance(from, to)
        ]).then(([
            balances
        ]) => {});
        
        return () => {}
    });
</script>