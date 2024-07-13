<script lang="ts">
import { onMount } from "svelte";
import { resolveAll } from "../../../../shared/check";
import { Bucket } from "../../../models/transactions/bucket";
import { Budget } from "../../../models/transactions/budget";
import { Transaction } from "../../../models/transactions/transaction";

    export let buckets: Bucket[];

    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).getTime();
    const prevFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
    const prevTo = new Date(now.getFullYear(), now.getMonth(), 0).getTime();

    const init = async () => {
        const [
            budgetRes,
            transactionRes,
            prevTransactionRes
        ] = await Promise.all([
            Budget.all(),
            Bucket.transactionsFromBuckets(buckets, from, to),
            Bucket.transactionsFromBuckets(buckets, prevFrom, prevTo)
        ]);

        if (budgetRes.isErr()) return console.error(budgetRes.error);
        if (transactionRes.isErr()) return console.error(transactionRes.error);
        if (prevTransactionRes.isErr()) return console.error(prevTransactionRes.error);
        const transactions = transactionRes.value;
        const prevTransactions = prevTransactionRes.value;

        const budgets = resolveAll(await Promise.all(budgetRes.value.map(b => b.getBudget(
            now.getMonth(),
            now.getFullYear()
        ))));
        if (budgets.isErr()) return console.error(budgets.error);

        // Total spent in all budgets
        const totalBudgetSpent = budgets.value.reduce((acc, b) => acc + b.total, 0);

        let { income, expenses } = Transaction.parse(transactions);

        const {
            net: prevNet
        } = Transaction.parse(prevTransactions);

        expenses -= totalBudgetSpent; // Remove the total spent in budgets, otherwise it's counted twice

        const net = income - totalBudgetSpent;
        const disposable = net - expenses + prevNet;
    }

    onMount(() => {
        init();
        return () => {
            // Cleanup
        }
    });


    Bucket.on('update', init);
    Bucket.on('new', init);
    Transaction.on('new', init);
    Transaction.on('update', init);
    Transaction.on('archive', init);
    Budget.on('new', init);
    Budget.on('update', init);
</script>