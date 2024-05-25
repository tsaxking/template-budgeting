<script lang="ts">
import { onMount } from 'svelte';
import { Bucket } from '../../../models/transactions/bucket';
import { dateTime } from '../../../../shared/clock';
import { cost } from '../../../../shared/text';
import { BalanceCorrection } from '../../../models/transactions/balance-correction';
import { Modal } from '../../../utilities/modals';
import NewBalanceCorrection from './NewBalanceCorrection.svelte';
import { Transaction } from '../../../models/transactions/transaction';
import UpdateBalanceCorrection from './UpdateBalanceCorrection.svelte';
import UpdateBucket from './UpdateBucket.svelte';

export let bucket: Bucket;
// export let from: number;
export let to: number;

let balance = 0;
let corrections: BalanceCorrection[] = [];

const generate = (bucket: Bucket) => {
    Promise.all([
        bucket.getBalance(0, to),
        bucket.getBalanceCorrections(0, to)
    ]).then(([b, c]) => {
        if (b.isErr()) return console.error(b.error);
        balance = b.value;
        if (c.isErr()) return console.error(c.error);
        corrections = c.value;
    });
};

const editBucket = () => {
    const m = new Modal();
    m.setTitle('Edit Bucket');
    const b = new UpdateBucket({
        target: m.target.querySelector('.modal-body') as HTMLElement,
        props: {
            bucket
        }
    });
    m.show();
    b.$on('submit', () => {
        m.hide();
        m.destroy();
    });
};

$: generate(bucket);

const correction = () => {
    const m = new Modal();
    m.setTitle('New Balance Correction');
    const b = new NewBalanceCorrection({
        target: m.target.querySelector('.modal-body') as HTMLElement,
        props: {
            bucket
        }
    });
    m.show();
    b.$on('correction-created', () => {
        m.hide();
        m.destroy();
    });
};

const editCorrection = (correction: BalanceCorrection) => {
    const m = new Modal();
    m.setTitle('Edit Balance Correction');
    const b = new UpdateBalanceCorrection({
        target: m.target.querySelector('.modal-body') as HTMLElement,
        props: {
            correction
        }
    });
    m.show();
    b.$on('submit', () => {
        m.hide();
        m.destroy();
    });
};

bucket.on('updated', () => generate(bucket));
bucket.on('balance-correction', () => generate(bucket));

Transaction.on('new', () => generate(bucket));
Transaction.on('update', () => generate(bucket));
Transaction.on('archive', () => generate(bucket));
BalanceCorrection.on('new', () => generate(bucket));
BalanceCorrection.on('update', () => generate(bucket));
BalanceCorrection.on('archive', () => generate(bucket));
</script>

<div class="container-fluid">
    <!-- <button on:click={() => bucket.getTransactions(0, to).then(console.log)}>click me!</button> -->
    <div class="row mb-2">
        <table class="table table-striped table-hover">
            <thead>
                <tr>
                    <th colspan="2" class="text-center"> Basics: </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th class="text-end"> Balance </th>
                    <td
                        class="text-start {balance >= 0
                            ? 'text-success'
                            : 'text-danger'}"
                    >
                        {cost(balance)}
                    </td>
                </tr>
                <tr>
                    <th class="text-end"> Created </th>
                    <td class="text-start text-primary">
                        {dateTime(new Date(bucket.created))}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <div class="row mb-2">
        <button class="btn btn-primary" on:click="{correction}">
            New Correction
        </button>
    </div>
    <div class="row mb-2">
        <table class="table table-striped table-hover">
            <thead>
                <tr>
                    <th colspan="2" class="text-center"> Corrections </th>
                </tr>
            </thead>
            <tbody>
                {#each corrections as correction}
                    <tr
                        on:click="{() => editCorrection(correction)}"
                        class="cursor-pointer"
                    >
                        <td
                            class="{correction.balance >= 0
                                ? 'text-success'
                                : 'text-danger'}"
                        >
                            {cost(correction.balance)}
                        </td>
                        <td>
                            {dateTime(new Date(correction.date))}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
    <div class="row mb-2">
        <button class="btn btn-secondary" on:click="{editBucket}">
            <i class="material-icons"> edit </i>
            Edit
        </button>
    </div>
</div>
