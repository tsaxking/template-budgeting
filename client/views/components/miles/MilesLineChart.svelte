<script lang="ts">
    import { Miles } from '../../../models/transactions/miles';
    import { segment, date } from '../../../../shared/clock';
    import { Line } from 'svelte-chartjs';

    export let from: number;
    export let to: number;
    let labels: string[] = [];
    let data: number[] = [];

    const reset = async () => {
        const res = await Miles.all();
        if (res.isErr()) return console.log(res.error);
    
        const miles = res.value.filter(m => m.date >= from && m.date <= to);
        const dates = segment(miles.map(m => new Date(m.date)), 20);
        labels = dates.map(date);


        data = dates.map((d, i) => {
            if (i === 0) return 0; // always start at 0
            const prev = dates[i - 1];
            return miles
                .filter(m => m.date >= prev.getTime() && m.date <= d.getTime())
                .reduce((acc, m) => acc + +m.amount, 0);
        });
    };

    $: {
        if (from && to) reset();
    }
</script>

<Line 
    data={{
        labels,
        datasets: [
            {
                label: 'Miles',
                data,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }
        ]
    }}

    options={{
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }}

    style="height: 300px; width: 100%;"
/>