<script lang="ts">
    import { Transaction } from "../../../models/transactions/transaction";
    import { Bucket } from "../../../models/transactions/bucket";
import { Line } from "svelte-chartjs";
import { monthsShort } from "../../../../shared/clock";

// TODO: Build a chart that shows the balance over time
// build the dates, then get the data for each date

    export let buckets: Bucket[] = [];
    export let from: number;
    export let to: number;


    let balance: [] = [];

    let dates: string[] = [];

    const getMonths = (transactions: Transaction[]) => {
        const unique = (arr: string[]) => [...new Set(arr)];

        const dateArray = transactions.map(t => new Date(t.date));

        let monthArr = unique(dateArray.map(d => `${d.getMonth() + 1}/${d.getFullYear()}`));
        let dayArr = unique(dateArray.map(d => `${monthsShort[d.getMonth()]} ${d.getFullYear()}`));

        if (monthArr.length > 6) {
            dates = monthArr;
        } else {
            dates = dayArr;
        }

        return dates;
    }

    const mount = (buckets: Bucket[]) => {
        Bucket.transactionsFromBuckets(buckets, from, to)
            .then(async ts => {
                if (ts.isErr()) return console.error(ts.error);
                const data = getMonths(ts.value);
            });
    }

    $: mount(buckets);
    $: getMonths(balance);
    $: console.log({months: dates});
</script>
