<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import { Bucket } from '../../../models/transactions/bucket';
    import Select from '../bootstrap/Select.svelte';
    import { Type } from '../../../models/transactions/type';
    import { Subtype } from '../../../models/transactions/subtype';
    import TypeSelector from '../types/TypeSelector.svelte';
    import SubtypeSelector from '../types/SubtypeSelector.svelte';
    import DateTimeInput from '../bootstrap/DateTimeInput.svelte';
    import { Random } from '../../../../shared/math';
    import { Subscription } from '../../../models/transactions/subscription';
    import type { SubscriptionInterval } from '../../../../shared/db-types-extended';
    import { capitalize } from '../../../../shared/text';

    export let subscription: Subscription;

    const id = Random.uuid();
    let buckets: Bucket[] = [];
    
    onMount(() => {
        Bucket.all().then(b => {
            if (b.isErr()) return console.error(b.error);
            buckets = b.value;
        });
    
        return () => {
            buckets = [];
        };
    });
    
        let bucketId = subscription.bucketId;
        let name = subscription.name;
        let amount = subscription.amount;
        let interval: SubscriptionInterval = subscription.interval;
        let period = subscription.period;
        let taxDeductible = !!subscription.taxDeductible;
        let description = subscription.description;
        let startDate = subscription.start;
        let endDate = subscription.end;
        let subtypeId = subscription.subtypeId;
        let type: 'withdrawal' | 'deposit' = subscription.type;    
    let t: Type | undefined;
    let s: Subtype | undefined;
    
    $: subtypeId = s?.id || '';
    const d = createEventDispatcher();
    
    const create = async () => {
        subscription.update({
            bucketId,
            name,
            amount,
            interval,
            taxDeductible: !!taxDeductible,
            description,
            startDate: startDate.getTime(),
            endDate: endDate?.getTime() || null,
            subtypeId,
            type,
            period
        });
    
        d('subscription-updated');
    }
    </script>
    
    <form on:submit|preventDefault={create}>
        <div class="mb-3">
            <label for="transaction-name" class="form-label"> Name </label>
            <input
                type="text"
                id="transaction-name"
                class="form-control"
                bind:value="{name}"
            />
        </div>
        <div class="mb-3">
            <label for="transaction-amount" class="form-label"> Amount </label>
            <input
                type="number"
                id="transaction-amount"
                class="form-control"
                bind:value="{amount}"
                step="0.01"
            />
        </div>
        <div class="mb-3">
            <!-- button radio -->
            <div class="btn-group" role="group">
                <input
                    type="radio"
                    class="btn-check"
                    name="transaction-type"
                    id="transaction-type-withdrawal-{id}"
                    value="withdrawal"
                    bind:group="{type}"
                />
                <label
                    class="btn btn-outline-danger"
                    for="transaction-type-withdrawal-{id}"
                >
                    Withdrawal
                </label>
                <input
                    type="radio"
                    class="btn-check"
                    name="transaction-type"
                    id="transaction-type-deposit-{id}"
                    value="deposit"
                    bind:group="{type}"
                />
                <label
                    class="btn btn-outline-success"
                    for="transaction-type-deposit-{id}"
                >
                    Deposit
                </label>
            </div>
        </div>
        <div class="mb-3">
            <DateTimeInput bind:date={startDate} />
        </div>
        <div class="mb-3">
            <DateTimeInput bind:date={endDate} />
        </div>
        <div class="mb-3">
            <!-- interval select -->
            <label for="transaction-interval" class="form-label"> Interval </label>
            <Select
                bind:value="{interval}"
                options={['daily', 'weekly', 'monthly', 'yearly']}></Select>
        </div>
        <div class="mb-3">
            <label for="transaction-period" class="form-label"> Interval day/time ({capitalize(interval)}) </label>
            <div class="input-group">
                <!-- TODO: Get rid of period from subscriptions, it's already taken care of based on start date -->
                <input
                    type="number"
                    id="transaction-period"
                    class="form-control"
                    bind:value="{period}"
                    min={
                        interval === 'hourly' ? 0 : 1
                    }
                    max={
                        interval === 'hourly' ? 23 :
                        interval === 'daily' ? 31 :
                        interval === 'weekly' ? 7 :
                        interval === 'monthly' ? 31 :
                        interval === 'yearly' ? 365 : 1
                    }
                    step="1"
                />
                <span class="input-group-text">
                    {#if interval === 'hourly'}
                        hours
                    {:else if interval === 'daily'}
                        days (0-23 hours)
                    {:else if interval === 'weekly'}
                        weeks (1-7 days)
                    {:else if interval === 'monthly'}
                        months (1-31 days)
                    {:else if interval === 'yearly'}
                        years (1-365 days)
                    {/if}
                </span>
            </div>
            <small 
                class="form-text text-muted"
            >
                If the interval is monthly, this is which day of the month the subscription will be charged, etc.
            </small>
    
    
        </div>
        <div class="mb-3">
            <label for="transaction-bucket" class="form-label"> Bucket </label>
            <Select
                bind:value="{bucketId}"
                options="{buckets.map(b => b.name)}"
                values="{buckets.map(b => b.id)}"
            />
        </div>
        <div class="mb-3">
            <label for="transaction-description" class="form-label">
                Description
            </label>
            <textarea
                name="transaction-description"
                id="transaction-description"
                class="form-control"
                bind:value="{description}"
            ></textarea>
        </div>
        <div class="mb-3">
            <label for="transaction-type mb-1" class="form-label"> Type </label>
            <TypeSelector bind:value="{t}" />
            {#if t}
                <label for="transaction-subtype mb-1"> Subtype </label>
                <SubtypeSelector bind:value="{s}" bind:type="{t}" />
            {/if}
        </div>
        <div class="mb-3">
            <div class="form-check form-switch">
                <input
                    type="checkbox"
                    class="form-check-input"
                    id="transaction-tax-deductible"
                    bind:checked="{taxDeductible}"
                />
                <label class="form-check-label" for="transaction-tax-deductible">
                    Tax Deductible
                </label>
            </div>
        </div>
        <button type="submit" class="btn btn-primary"> Create </button>
    </form>