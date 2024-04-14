<script lang="ts">
import SelectBucket from "../components/buckets/SelectBucket.svelte";
import { Bucket } from "../../models/transactions/bucket";
import { onMount } from "svelte";
import DashboardCard from "../components/main/DashboardCard.svelte";
import BucketBasics from "../components/buckets/BucketBasics.svelte";


let buckets: Bucket[] = [];
let search: string = '';

let from: number = Date.now();
let to: number = Date.now();
</script>

<div class="container-fluid">
    <div class="row mb-3">
        <SelectBucket bind:active={buckets} />

        <div class="col-12">
            <div class="input-group">
                <input type="date" class="form-control" bind:value={from} />
                <input type="date" class="form-control" bind:value={to} />
                <input type="text" class="form-control" bind:value={search} />
            </div>
        </div>
    </div>
    <div class="row mb-3">
        {#each buckets as bucket}
            <DashboardCard title="Summary: {bucket.name}">
                <BucketBasics {bucket} {from} {to} />
            </DashboardCard>
        {/each}
    </div>
</div>