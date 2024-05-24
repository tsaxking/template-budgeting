<script lang="ts">
    import { Bar } from "svelte-chartjs";
    import { Bucket } from "../../../models/transactions/bucket";
import { attemptAsync, resolveAll } from "../../../../shared/check";

    export let buckets: Bucket[] = [];
    export let from: number;
    export let to: number;

    let labels: string[] = [];
    let datasets: {
        label: string;
        data: number[];
    }[] = [];

    const reset = async (buckets: Bucket[]) => {
        const transRes = resolveAll(await Promise.all(buckets.map(bucket => bucket.getTransactions(from, to))));
        if (transRes.isErr()) return console.error(transRes.error);
        const transactions = transRes.value.flat();
        const typesRes = resolveAll(await Promise.all(transactions.map(t => t.getTypeInfo())));
        if (typesRes.isErr()) return console.error(typesRes.error);
        const types = typesRes.value.map((t, i) => ({ typeInfo: t, transaction: transactions[i] }));
        labels = types.map(t => t.typeInfo.type.name);

        // datasets = resolveAll(await Promise.all(types.map(async type => {
        //     return attemptAsync(async () => {
                
        //     });
        // })));

        datasets = types.map((t, i) => {
            const data = types.filter(t2 => t2.typeInfo.subtype.id === t.transaction.subtypeId);
            return {
                label: t.typeInfo.type.name,
                data: data.map(t1 => t1.transaction.type === 'deposit' ? t1.transaction.amount : -t1.transaction.amount)
            }
        });
    };

    $: reset(buckets);
</script>

<Bar data={{
    labels,
    datasets,
}}
    options={{
        responsive: true
    }}

    style="width: 100%; height: 100%;"
/>