<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';

    export let date: Date;

    const d = createEventDispatcher();

    let value: string = (() => {
        const [m, d, y] = date.toLocaleDateString().split('/');
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    })();
    let time: string = date.toTimeString().split(' ')[0];

    const update = (value: string, time: string) => {
        console.log(value, time);
        date = new Date(`${value}T${time}`);
        d('change', date);
    };

    onMount(() => {
        return () => {};
    });

    $: update(value, time);
</script>

<!-- date and time input -->

<div class="input-group">
    <span class="input-group-text">
        <i class="bi bi-calendar"></i>
    </span>
    <input
        type="date"
        class="form-control"
        bind:value="{value}"
    />
    <span class="input-group-text">
        <i class="bi bi-clock"></i>
    </span>
    <input
        type="time"
        class="form-control"
        bind:value="{time}"
    />
</div>