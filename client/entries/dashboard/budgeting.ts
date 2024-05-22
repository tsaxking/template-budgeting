import { Bucket } from '../../models/transactions/bucket';
import '../../utilities/imports';

import Budgeting from '../../views/dashboards/Budgeting.svelte';

const app = new Budgeting({
    target: document.body
});
