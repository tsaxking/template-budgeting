<script lang="ts">
import { Transaction } from '../../../models/transactions/transaction';
import { Bucket } from '../../../models/transactions/bucket';
import { attemptAsync, resolveAll } from '../../../../shared/check';
import { Subtype } from '../../../models/transactions/subtype';
import { Type } from '../../../models/transactions/type';
import { cost } from '../../../../shared/text';
import { Modal } from '../../../utilities/modals';
import UpdateTransaction from './UpdateTransaction.svelte';
import { confirm } from '../../../utilities/notifications';
import { Random } from '../../../../shared/math';
import { onMount } from 'svelte';
// import JQuery from 'jquery';

const id = Random.uuid();

export let buckets: Bucket[] = [];
export let from: number;
export let to: number;
let search = '';

let transactions: {
    transaction: Transaction;
    bucket: Bucket | undefined;
    subtype?: Subtype;
    type?: Type;
}[] = [];
let transactionView: {
    transaction: Transaction;
    bucket: Bucket | undefined;
    subtype?: Subtype;
    type?: Type;
}[] = [];

$: {
    Bucket.transactionsFromBuckets(buckets, from, to).then(async ts => {
        if (ts.isErr()) return console.error(ts.error);
        const t = resolveAll(
            await Promise.all(
                ts.value.reverse().map(async t => {
                    return attemptAsync(async () => {
                        const [bucket, typeInfo] = await Promise.all([
                            Bucket.fromId(t.bucketId),
                            t.getTypeInfo()
                        ]);

                        if (bucket.isErr()) throw bucket.error;
                        if (typeInfo.isErr()) {
                            console.log('Type error');
                            return {
                                transaction: t,
                                bucket: bucket.value
                            };
                        }

                        return {
                            transaction: t,
                            bucket: bucket.value,
                            subtype: typeInfo.value?.subtype,
                            type: typeInfo.value?.type
                        };
                    });
                })
            )
        );
        if (t.isErr()) return console.error(t.error);

        transactions = t.value;
        dt();
    });
}

$: {
    transactionView = transactions
        .filter(t => {
            if (!search) return true;
            return [
                t.transaction.description,
                t.type?.name,
                t.subtype?.name,
                t.bucket ? t.bucket.name : '',
                t.transaction.amount.toString(),
                new Date(t.transaction.date).toLocaleDateString(),
                t.transaction.type
            ]
                .map(t => t?.toLowerCase() || '')
                .join('')
                .includes(search.toLowerCase());
        })
        .sort((a, b) => b.transaction.date - a.transaction.date);
}

const update = (t: Transaction) => {
    const m = new Modal();
    m.setTitle('Update Transaction');
    const b = new UpdateTransaction({
        target: m.target.querySelector('.modal-body') as HTMLElement,
        props: {
            transaction: t
        }
    });

    const deleteBtn = (() => {
        const b = create('button');
        b.classList.add('btn', 'btn-danger');
        b.innerHTML = `<i class="fas fa-archive"></i> Archive`;
        b.addEventListener('click', async () => {
            const confirmed = await confirm(
                'Are you sure you want to delete this transaction?'
            );
            if (!confirmed) return;
            t.setArchive(true);
            m.hide();
            m.destroy();
        });
        return b;
    })();

    m.addButton(deleteBtn);

    m.show();
    b.$on('transaction-updated', () => {
        m.hide();
        m.destroy();
    });
};

Transaction.on('new', () => (buckets = buckets));
Transaction.on('archive', () => (buckets = buckets));

let subtotal = 0;
$: {
    subtotal = transactionView.reduce((acc, t) => {
        if (t.transaction.type === 'deposit') return acc + t.transaction.amount;
        return acc - t.transaction.amount;
    }, 0);
}

// let table: any; // yes, this is bad practice, but I'm not sure how to fix it

const dt = () => {
    // setTimeout(() => {
    //     // table?.destroy?.();
    //     table = new DataTable(`#transaction-${id}-table`);
    // }, 1000);
};
onMount(() => {
    dt();

    // const dt = JQuery(`#transaction-${id}-table`).DataTable(); // Initialize DataTable

    // return () => dt.destroy(); // Destroy DataTable
});
</script>

<div class="container-fluid">
    <div class="row mb-3">
        <div class="input-group">
            <input
                type="text"
                class="form-control"
                placeholder="Search"
                bind:value="{search}"
            />
            <button class="btn btn-outline-secondary" type="button">
                <i class="fas fa-search"></i>
            </button>
        </div>
    </div>
    <div class="row mb-3 text-muted">
        <div class="col-6">
            Showing {transactionView.length} transactions
        </div>
        {#if !!search.length}
            <div class="col-6">
                Subtotal: {cost(subtotal)}
            </div>
        {/if}
    </div>
    <div class="row">
        <div class="table-responsive">
            <table
                class="table table-striped table-hover"
                id="transaction-{id}-table"
            >
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Type</th>
                        <th>Subtype</th>
                        <th>Bucket</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {#each transactionView as t}
                        <tr
                            on:click="{() => update(t.transaction)}"
                            class="cursor-pointer"
                        >
                            <td
                                >{new Date(
                                    t.transaction.date
                                ).toLocaleDateString()}</td
                            >
                            {#if t.transaction.type === 'deposit'}
                                <td class="text-success"
                                    >{cost(+t.transaction.amount)}</td
                                >
                            {:else}
                                <td class="text-danger"
                                    >{cost(-+t.transaction.amount)}</td
                                >
                            {/if}
                            <td>{t.type?.name || ''}</td>
                            <td>{t.subtype?.name || ''}</td>
                            <td>{t.bucket ? t.bucket.name : 'None'}</td>
                            <td>{t.transaction.description}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
</div>
