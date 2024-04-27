<script lang="ts">
import { Transaction } from '../../../models/transactions/transaction';
import { Bucket } from '../../../models/transactions/bucket';
import { resolveAll } from '../../../../shared/check';
import { Subtype } from '../../../models/transactions/subtype';
import { Type } from '../../../models/transactions/type';
import { cost } from '../../../../shared/text';
import { Modal } from '../../../utilities/modals';
import UpdateTransaction from './UpdateTransaction.svelte';

export let buckets: Bucket[] = [];
export let from: number;
export let to: number;
let search = '';

let transactions: {
    transaction: Transaction;
    bucket: Bucket | undefined;
    subtype: Subtype;
    type: Type;
}[] = [];

// $: Promise.all([
//     Promise.all(buckets.map(b => b.getTransactions(from, to)))
// ]).then(async ([transactionRes]) => {
//     const ts = resolveAll(transactionRes);
//     if (ts.isErr()) return console.error(ts.error);
//     transactions = (await Promise.all(
//         ts.value.flat().reverse().map(async t => {
//             const [bucket, typeInfo] = await Promise.all([
//                 Bucket.fromId(t.bucketId),
//                 t.getTypeInfo()
//             ]);

//             if (bucket.isErr()) throw bucket.error;
//             if (typeInfo.isErr()) throw typeInfo.error;

//             return {
//                 transaction: t,
//                 bucket: bucket.value,
//                 subtype: typeInfo.value.subtype,
//                 type: typeInfo.value.type
//             };
//         })
//     )).filter(t => {
//         if (!search) return true;
//         return [
//             t.transaction.description,
//             t.type.name,
//             t.subtype.name,
//             t.bucket ? t.bucket.name : ''
//         ].map(t => t.toLowerCase()).join('').includes(search.toLowerCase());
//     });
// });

$: {
    Bucket.transactionsFromBuckets(buckets, from, to)
    .then(async ts => {
        if (ts.isErr()) return console.error(ts.error);
        transactions = (await Promise.all(ts.value.reverse().map(async t => {
            const [bucket, typeInfo] = await Promise.all([
                Bucket.fromId(t.bucketId),
                t.getTypeInfo()
            ]);

            if (bucket.isErr()) throw bucket.error;
            if (typeInfo.isErr()) throw typeInfo.error;

            return {
                transaction: t,
                bucket: bucket.value,
                subtype: typeInfo.value.subtype,
                type: typeInfo.value.type
            };
        }))).filter(t => {
        if (!search) return true;
        return [
            t.transaction.description,
            t.type.name,
            t.subtype.name,
            t.bucket ? t.bucket.name : ''
        ].map(t => t.toLowerCase()).join('').includes(search.toLowerCase());
    });
    })
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
    m.show();
    b.$on('transaction-updated', () => {
        m.hide();
        m.destroy();
    });
};

Transaction.on('new', () => (buckets = buckets));

let subtotal = 0;
$: {
    subtotal = transactions.reduce((acc, t) => {
        if (t.transaction.type === 'deposit') return acc + t.transaction.amount;
        return acc - t.transaction.amount;
    }, 0);
}
</script>

<div class="container">
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
            Showing {transactions.length} transactions
        </div>
        {#if !!search.length}
        <div class="col-6">
            Subtotal: {cost(subtotal)}
        </div>
        {/if}
    </div>
    <div class="row">
        <div class="table-responsive">
            <table class="table table-striped table-hover">
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
                    {#each transactions as t}
                        <tr on:click="{() => update(t.transaction)}" style="cursor: pointer;">
                            <td>{new Date(t.transaction.date).toLocaleDateString()}</td>
                            <td 
                                class="{t.transaction.type === 'deposit' ? 'text-success' : 'text-danger'}"
                            >{cost(t.transaction.amount)}</td>
                            <td>{t.type.name}</td>
                            <td>{t.subtype.name}</td>
                            <td>{t.bucket ? t.bucket.name : 'None'}</td>
                            <td>{t.transaction.description}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
</div>

