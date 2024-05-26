<script lang="ts">
import { Miles } from '../../../models/transactions/miles';
import { Random } from '../../../../shared/math';
import { date } from '../../../../shared/clock';
import { Modal } from '../../../utilities/modals';
import AddMiles from './AddMiles.svelte';
import UpdateMiles from './UpdateMiles.svelte';
import { confirm } from '../../../utilities/notifications';

const id = Random.uuid();

let miles: Miles[] = [];
let viewMiles: Miles[] = [];

export let from: number;
export let to: number;
let search = '';

$: viewMiles = miles.filter(m => {
    if (!search) return true; // if search is empty, return all transactions
    return [m.date, m.description, m.amount]
        .map(v => v.toString().toLocaleLowerCase())
        .join('')
        .includes(search.toLocaleLowerCase());
}).sort((a, b) => +b.date - +a.date);

const getMiles = async () => {
    const res = await Miles.all();
    console.log({ res });
    if (res.isErr()) return console.error(res.error);
    miles = res.value.filter(m => m.date >= from && m.date <= to);
};

const update = (m: Miles) => {
    const modal = new Modal();
    modal.setTitle('Update Miles');
    const u = new UpdateMiles({
        target: modal.target.querySelector('.modal-body') as HTMLElement,
        props: { miles: m }
    });

    const deleteBtn = (() => {
        const b = create('button');
        b.classList.add('btn', 'btn-danger');
        b.innerHTML = '<i class="fas fa-trash"></i> Delete';
        b.addEventListener('click', async () => {
            const confirmed = await confirm('Are you sure you want to delete this transaction?');
        
            if (!confirmed) return;
            m.setArchive(true);
            modal.hide();
            modal.destroy();
        });
        return b;
    })();

    modal.addButton(deleteBtn);

    modal.show();

    u.$on('miles-updated', () => {
        u.$destroy();
    });
};

const createMiles = () => {
    const m = new Modal();
    m.setTitle('Add Miles');
    const b = new AddMiles({
        target: m.target.querySelector('.modal-body') as HTMLElement
    });

    m.show();
    b.$on('miles-created', () => {
        m.hide();
    });
};

$: {
    if (from && to) getMiles();
}

Miles.on('new', () => getMiles());
Miles.on('restored', () => getMiles());
Miles.on('update', () => getMiles());
Miles.on('archived', () => getMiles());

let subtotal = 0;
$: subtotal = viewMiles.reduce((acc, m) => acc + +m.amount, 0);
</script>

<div class="container-fluid">
    <div class="row mb-3">
        <div class="input-group">
            <input
                type="text"
                class="form-control"
                placeholder="Search Miles..."
                bind:value="{search}"
            />
            <button class="btn btn-outline-secondary" type="button">
                <i class="fas fa-search"></i>
            </button>
        </div>
    </div>
    <div class="row mb-3 text-muted">
        <div class="col-6">
            Showing {viewMiles.length} mile entries
        </div>
        <div class="col-6">
            Subtotal: {subtotal} miles
        </div>
    </div>
    <div class="row mb-3">
        <div class="table-responsive">
            <table
                class="table table-striped table-hover"
                id="miles-{id}-table"
            >
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {#each viewMiles as m}
                        <tr on:click="{() => update(m)}" class="cursor-pointer">
                            <td>{date(new Date(+m.date))}</td>
                            <td>{m.description}</td>
                            <td>{m.amount}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
    <div class="row mb-3">
        <button class="btn btn-primary" on:click="{createMiles}">
            <i class="fas fa-plus"></i> Add Miles
        </button>
    </div>
</div>
