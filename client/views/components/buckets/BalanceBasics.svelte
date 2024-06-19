<script lang="ts">
import { attemptAsync } from '../../../../shared/check';
import { Bucket } from '../../../models/transactions/bucket';
import { cost } from '../../../../shared/text';
import { onMount } from 'svelte';

let total = 0;
let credit = 0;
let debit = 0;
let savings = 0;
let other = 0;

$: total = credit + debit + savings + other;

const reset = () => {
    const now = Date.now();
    attemptAsync(async () => {
        credit = (await Bucket.getCreditBalance(now)).unwrap();
        debit = (await Bucket.getDebitBalance(now)).unwrap();
        savings = (await Bucket.getSavingsBalance(now)).unwrap();
        other = (await Bucket.getOtherBalance(now)).unwrap();
    });
};

onMount(() => {
    reset();
});
</script>

<div class="table-responsive">
    <table class="table table-striped table-hover table-bordered">
        <thead>
            <tr>
                <th>Category</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Total</td>
                <td class="{total >= 0 ? 'text-success' : 'text-danger'}"
                    >{cost(total)}</td
                >
            </tr>
            <tr>
                <td>Debit</td>
                <td class="{debit >= 0 ? 'text-success' : 'text-danger'}"
                    >{cost(debit)}</td
                >
            </tr>
            <tr>
                <td>Credit</td>
                <td class="{credit >= 0 ? 'text-success' : 'text-danger'}"
                    >{cost(credit)}</td
                >
            </tr>
            <tr>
                <td>Savings</td>
                <td class="{savings >= 0 ? 'text-success' : 'text-danger'}"
                    >{cost(savings)}</td
                >
            </tr>
            <tr>
                <td>Other</td>
                <td class="{other >= 0 ? 'text-success' : 'text-danger'}"
                    >{cost(other)}</td
                >
            </tr>
        </tbody>
    </table>
</div>
