<script lang="ts">
import { Bar } from 'svelte-chartjs';
import { Bucket } from '../../../models/transactions/bucket';
import { resolveAll } from '../../../../shared/check';
import { Color } from '../../../submodules/colors/color';
import { Random } from '../../../../shared/math';
let depositOrWithdrawal: ('deposit' | 'withdrawal')[] = [
    'deposit',
    'withdrawal'
];

export let buckets: Bucket[] = [];
export let from: number;
export let to: number;

const id = Random.uuid();

let labels: string[] = [];
let datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
}[] = [];

const reset = async (
    buckets: Bucket[],
    depositOrWithdrawal: ('deposit' | 'withdrawal')[]
) => {
    const transRes = resolveAll(
        await Promise.all(
            buckets.map(bucket => bucket.getTransactions(from, to))
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

    labels = types.map(t => t.name); // x-axis

    // if (typeOrSubtype === 'type') {
    //     datasets = types.map(t => {
    //         return {
    //             label: t.name,
    //             data: subtypes.map(s => {
    //                 return transactions
    //                     .filter(t => depositOrWithdrawal.includes(t.type))
    //                     .filter(t2 => {
    //                         return s.id === t2.subtypeId;
    //                     })
    //                     .reduce(
    //                         (acc, t) =>
    //                             acc +
    //                             (t.type === 'deposit' ? t.amount : -t.amount),
    //                         0
    //                     );
    //             }),
    //             backgroundColor: Color.random()
    //                 .hsl.setLightness(0.8)
    //                 .setAlpha(0.5)
    //                 .toString()
    //         };
    //     });
    // } else {
    datasets = subtypes
        .map(s => {
            return {
                label: s.name,
                data: types.map(t => {
                    return transactions
                        .filter(t => depositOrWithdrawal.includes(t.type))
                        .filter(
                            t2 => t2.subtypeId === s.id && s.typeId === t.id
                        )
                        .reduce(
                            (acc, t) =>
                                acc +
                                (t.type === 'deposit' ? t.amount : -t.amount),
                            0
                        );
                }),
                backgroundColor: Color.random()
                    .hsl.setLightness(0.8)
                    .setAlpha(0.5)
                    .toString()
            };
        })
        .filter(d => !d.data.every(d => d === 0));
    // }
};

$: reset(buckets, depositOrWithdrawal);
</script>

<div class="mb-3">
    <!-- checkbox group -->
    <!-- <div class="btn-group" role="group">
        <input
            type="radio"
            class="btn-check"
            id="{id}-type"
            value="type"
            name="bar-chart-type"
            checked
            bind:group="{typeOrSubtype}"
        />
        <label class="btn btn-outline-primary" for="{id}-type">Type</label>
        <input
            type="radio"
            class="btn-check"
            id="{id}-subtype"
            value="subtype"
            name="bar-chart-type"
            bind:group="{typeOrSubtype}"
        />
        <label class="btn btn-outline-secondary" for="{id}-subtype"
            >Subtype</label
        >
    </div> -->
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

<Bar
    data="{{
        labels,
        datasets
    }}"
    options="{{
        responsive: true,
        scales: {
            x: {
                stacked: true
            },
            y: {
                stacked: true
            }
        }
    }}"
    style="width: 100%; height: 100%;"
/>
