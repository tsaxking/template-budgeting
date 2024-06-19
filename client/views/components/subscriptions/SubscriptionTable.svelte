<script lang="ts">
import { Bucket } from '../../../models/transactions/bucket';
import { Subscription } from '../../../models/transactions/subscription';
import { resolveAll } from '../../../../shared/check';
import { onMount } from 'svelte';
import { Modal } from '../../../utilities/modals';
import NewSubscription from './NewSubscription.svelte';
import UpdateSubscription from './UpdateSubscription.svelte';
import { capitalize, cost } from '../../../../shared/text';

export let buckets: Bucket[] = [];
export let to: number;
export let from: number;

let subscriptions: Subscription[] = [];

const generate = (buckets: Bucket[]) => {
    Promise.all(buckets.map(b => b.getSubscriptions(from, to))).then(subs => {
        const s = resolveAll(subs);
        if (s.isErr()) return console.error(s.error);
        subscriptions = s.value.flat();
    });
};

const create = () => {
    const m = new Modal();
    m.setTitle('New Subscription');
    const s = new NewSubscription({
        target: m.target.querySelector('.modal-body') as HTMLElement
    });

    s.$on('subscription-created', () => {
        m.hide();
    });
    m.show();
};

const update = (subscription: Subscription) => {
    const m = new Modal();
    m.setTitle('Update Subscription');
    const s = new UpdateSubscription({
        target: m.target.querySelector('.modal-body') as HTMLElement
    });

    s.$on('subscription-updated', () => {
        m.hide();
    });
    m.show();
};

$: generate(buckets);

Subscription.on('new', () => generate(buckets));
Subscription.on('update', () => generate(buckets));
</script>

<div class="container-flu">
    <div class="row mb-3">
        <div class="table-responsive">
            <table class="table table-hover table-striped">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Cost</th>
                        <!-- <th>Bucket</th> -->
                        <th>Interval</th>
                        <th>Next Payment</th>
                    </tr>
                </thead>
                <tbody>
                    {#each subscriptions as subscription}
                        <tr
                            on:click="{() => update(subscription)}"
                            class="cursor-pointer"
                        >
                            <td>{capitalize(subscription.name)}</td>
                            <td>{cost(subscription.amount)}</td>
                            <td>{capitalize(subscription.interval)}</td>
                            <td
                                >{(() => {
                                    const s = subscription.nextPayment;
                                    return s
                                        ? s.toLocaleDateString()
                                        : 'No Payment';
                                })()}</td
                            >
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
    <div class="row mb-3">
        <button class="btn btn-primary" on:click="{create}"
            >New Subscription</button
        >
    </div>
</div>
