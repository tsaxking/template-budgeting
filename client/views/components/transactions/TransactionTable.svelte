<script lang="ts">
import { Transaction } from '../../../models/transactions/transaction';
import { Bucket } from '../../../models/transactions/bucket';
import { resolveAll } from '../../../../shared/check';
import { Subtype } from '../../../models/transactions/subtype';
import { Type } from '../../../models/transactions/type';

export let buckets: Bucket[] = [];
export let from: number;
export let to: number;

let transactions: {
    transaction: Transaction;
    bucket: Bucket | undefined;
    subtype: Subtype;
    type: Type;
}[] = [];

$: Promise.all([
    Promise.all(buckets.map(b => b.getTransactions(from, to)))
]).then(async ([transactionRes]) => {
    const ts = resolveAll(transactionRes);
    if (ts.isErr()) return console.error(ts.error);
    transactions = await Promise.all(
        ts.value.flat().map(async t => {
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
        })
    );
});

const edit = (t: Transaction) => {};

Transaction.on('new', () => (buckets = buckets));
</script>

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
    </table>
    <tbody>
        {#each transactions as t}
            <tr on:click="{() => edit(t.transaction)}" style="cursor: pointer;">
                <td>{new Date(t.transaction.date).toLocaleDateString()}</td>
                <td>{t.transaction.amount}</td>
                <td>{t.type.name}</td>
                <td>{t.subtype.name}</td>
                <td>{t.bucket ? t.bucket.name : 'None'}</td>
                <td>{t.transaction.description}</td>
            </tr>
        {/each}
    </tbody>
</div>
