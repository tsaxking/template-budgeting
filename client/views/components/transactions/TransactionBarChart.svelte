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
        const typeInfos = (await Promise.all(transactions.map(async t => {
            const info = await t.getTypeInfo();
            if (info.isErr()) return null;
            return info.value;
        })))
        .filter(Boolean);

        console.log({ typeInfos });
        
        const types = typeInfos.map(t => t.type).filter((t, i, a) => a.findIndex(a => a.id === t.id) === i);
        const subtypes = typeInfos.map(t => t.subtype).filter((t, i, a) => a.findIndex(a => a.id === t.id) === i);

        labels = types.map(t => t.name); // x-axis

        datasets = subtypes.map(s => {
            return {
                label: s.name,
                data: types.map(t => {
                    return transactions.filter(t => t.subtypeId === s.id)
                        .reduce((acc, t) => acc + t.amount, 0);
                })
            };
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