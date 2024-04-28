<script lang="ts">
    import { Bucket } from '../../../models/transactions/bucket';
    import { Subscription } from '../../../models/transactions/subscription';
    import { resolveAll } from '../../../../shared/check';
    import { onMount } from 'svelte';

    export let buckets: Bucket[] = [];
    export let to: number;
    export let from: number;

    let subscriptions: Subscription[] = [];

    const generate = () => {
        Promise.all(buckets.map(b => b.getSubscriptions()))
            .then(subs => {
                const s = resolveAll(subs);
                if (s.isErr()) return console.error(s.error);
                subscriptions = s.value.flat();
            });
    };
    
    onMount(() => {
        generate();
        return () => {};
    });
</script>

<div class="table-responsive">
    <table class="table table-hover table-striped">
        <thead>
            <tr>
                <th>Name</th>
                <th>Cost</th>
                <th>Next Payment</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {#each subscriptions as subscription}
                <tr>
                    <td>{subscription.name}</td>
                    <td>{subscription.amount}</td>
                    <!-- <td>{subscription.}</td> -->
                    <!-- <td>
                        <button class="btn btn-sm btn-primary">Edit</button>
                        <button class="btn btn-sm btn-danger">Delete</button>
                    </td> -->
                </tr>
            {/each}
        </tbody>
    </table>
</div>