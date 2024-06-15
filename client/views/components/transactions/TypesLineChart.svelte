<script lang="ts">
import { Line } from 'svelte-chartjs';
import { Bucket } from '../../../models/transactions/bucket';
import { resolveAll } from '../../../../shared/check';
import { Color } from '../../../submodules/colors/color';
import { segment, date } from '../../../../shared/clock';
import { Random } from '../../../../shared/math';
const id = Random.uuid();

export let buckets: Bucket[] = [];
export let from: number;
export let to: number;

let dates: Date[] = [];
let datasets: {
    label: string;
    data: number[];
    // backgroundColor: string;
}[] = [];
let depositOrWithdrawal: ('deposit' | 'withdrawal')[] = [
    'deposit',
    'withdrawal'
];
let typeOrSubtype: 'type' | 'subtype' = 'type';

const reset = async (
    buckets: Bucket[],
    type: 'type' | 'subtype',
    depositOrWithdrawal: ('deposit' | 'withdrawal')[]
) => {
    const transRes = resolveAll(
        await Promise.all(
            buckets.map(bucket => bucket.getTransactions(from, to, false)) // don't include transfers
        )
    );
    if (transRes.isErr()) return console.error(transRes.error);
    const transactions = transRes.value.flat();
    const typeInfos = (
        await Promise.all(
            transactions.map(async t => {
                const info = await t.getTypeInfo();
                if (info.isErr()) return null;
                return info.value;
            })
        )
    ).filter(Boolean);

    const types = typeInfos
        .map(t => t.type)
        .filter((t, i, a) => a.findIndex(a => a.id === t.id) === i);
    const subtypes = typeInfos
        .map(t => t.subtype)
        .filter((t, i, a) => a.findIndex(a => a.id === t.id) === i);
    const dateArr = segment(
        transactions.map(t => new Date(+t.date)),
        20
    );

    dates = dateArr; // x-axis

    if (type === 'type') {
        datasets = types
            .map(type => {
                return {
                    label: type.name,
                    data: dateArr.map((d, i, a) => {
                        if (i === 0) return 0;
                        const prevDate = a[i - 1];
                        return (
                            transactions
                                // filter date
                                .filter(trans => {
                                    const transDate = new Date(+trans.date);
                                    if (
                                        prevDate.getTime() > transDate.getTime()
                                    )
                                        return false;
                                    if (i === a.length - 1) return true;
                                    return d.getTime() > transDate.getTime();
                                })
                                // filter by type
                                .filter(trans => {
                                    const subtype = subtypes.find(
                                        s => s.id === trans.subtypeId
                                    );
                                    if (!subtype) return false;
                                    return subtype.typeId === type.id;
                                })
                                // sum
                                .reduce((acc, cur) => {
                                    if (!depositOrWithdrawal.includes(cur.type))
                                        return acc;
                                    if (cur.type === 'deposit')
                                        return (acc += cur.amount);
                                    return (acc -= cur.amount);
                                }, 0)
                        );
                    })
                };
            })
            .filter(d => !d.data.every(d => d === 0));
    } else {
        // subtype
        datasets = subtypes
            .map(subtype => {
                return {
                    label: subtype.name,
                    data: dateArr.map((d, i, a) => {
                        if (i === 0) return 0;
                        const prevDate = a[i - 1];
                        return (
                            transactions
                                // filter date
                                .filter(trans => {
                                    const transDate = new Date(+trans.date);
                                    if (
                                        prevDate.getTime() > transDate.getTime()
                                    )
                                        return false;
                                    if (i === a.length - 1) return true;
                                    return d.getTime() > transDate.getTime();
                                })
                                // filter by subtype
                                .filter(trans => {
                                    return trans.subtypeId === subtype.id;
                                })
                                // sum
                                .reduce((acc, cur) => {
                                    if (!depositOrWithdrawal.includes(cur.type))
                                        return acc;
                                    if (cur.type === 'deposit')
                                        return (acc += cur.amount);
                                    return (acc -= cur.amount);
                                }, 0)
                        );
                    })
                };
            })
            .filter(d => !d.data.every(d => d === 0));
    }
};

$: {
    if (to && from) reset(buckets, typeOrSubtype, depositOrWithdrawal);
}
</script>

<div class="mb-3">
    <!-- checkbox group -->
    <div class="btn-group" role="group">
        <input
            type="radio"
            class="btn-check"
            id="{id}-type"
            value="type"
            name="line-chart-type"
            checked
            bind:group="{typeOrSubtype}"
        />
        <label class="btn btn-outline-primary" for="{id}-type">Type</label>
        <input
            type="radio"
            class="btn-check"
            id="{id}-subtype"
            value="subtype"
            name="line-chart-type"
            bind:group="{typeOrSubtype}"
        />
        <label class="btn btn-outline-secondary" for="{id}-subtype"
            >Subtype</label
        >
    </div>
    <div class="btn-group" role="group">
        <input
            type="checkbox"
            class="btn-check"
            id="{id}-deposit"
            value="deposit"
            autocomplete="off"
            checked
            bind:group="{depositOrWithdrawal}"
        />
        <label class="btn btn-outline-success" for="{id}-deposit">Deposit</label
        >
        <input
            type="checkbox"
            class="btn-check"
            id="{id}-withdrawal"
            value="withdrawal"
            autocomplete="off"
            checked
            bind:group="{depositOrWithdrawal}"
        />
        <label class="btn btn-outline-danger" for="{id}-withdrawal"
            >Withdrawal</label
        >
    </div>
</div>

<Line
    data="{{
        labels: dates.map(date),
        datasets: datasets.map(d => ({ ...d, tension: 0.4 }))
    }}"
    options="{{
        responsive: true
    }}"
    style="height: 100%; width: 100%;"
/>
