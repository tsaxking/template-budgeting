<script lang="ts">
import Main from '../components/main/Main.svelte';
import Page from '../components/main/Page.svelte';
import type { PageGroup } from '../../utilities/general-types';
import { getOpenPage } from '../../utilities/page';
import Dashboard from '../pages/Dashboard.svelte';

const groups: PageGroup[] = [
    {
        name: 'Home',
        pages: [
            {
                name: 'dashboard',
                icon: 'home',
                iconType: 'material'
            }
        ]
    }
];

let active: string = getOpenPage() || 'dashboard';
const domain = '';

const navItems: string[] = [];

const accountLinks: string[] = [];
</script>

<Main
    title="Budgeting"
    {groups}
    bind:active
    on:openPage="{e => (active = e.detail)}"
    {navItems}
    {accountLinks}
>
    <Page {active} {domain} title="dashboard"><Dashboard /></Page>
</Main>
