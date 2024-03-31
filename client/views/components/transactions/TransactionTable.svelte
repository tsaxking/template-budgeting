<script lang="ts">
import { onMount } from "svelte";
import { Transaction } from "../../../../shared/db-types-extended";
import { Bucket } from "../../../models/transactions/bucket";
import { resolveAll } from "../../../../shared/check";

    export let buckets: Bucket[] = [];
    export let from: number;
    export let to: number;

    let transactions: Transaction[] = [];

    $: Promise.all([
            Promise.all(buckets.map(b => b.getTransactions(from, to)))
        ]).then(([
            transactionRes
        ]) => {
            const ts = resolveAll(transactionRes);
            if (ts.isErr()) return console.error(ts.error);
            transactions = ts.value.flat();
        });
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
                <th>Notes</th>
            </tr>
        </thead>
    </table>
    <tbody>
        {#each transactions as transaction}
            <tr>
                <td>{new Date(transaction.date).toLocaleDateString()}</td>
                <td>{transaction.amount}</td>
                <td>{transaction.type}</td>
                <td>{transaction.subtype}</td>
                <td>{transaction.bucket}</td>
                <td>{transaction.notes}</td>
            </tr>
        {/each}
    </tbody>
</div>