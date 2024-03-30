<script lang="ts">
import { onMount } from "svelte";
import { Bucket } from "../../models/transactions/bucket";

let buckets: Bucket[] = [];

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
</script>