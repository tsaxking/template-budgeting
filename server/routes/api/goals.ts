import { Route } from '../../structure/app/app';
import { Goal } from '../../structure/cache/goals';
import { validate } from '../../middleware/data-type';
import { BudgetInterval } from '../../utilities/tables';
import { attemptAsync, resolveAll } from '../../../shared/check';
export const router = new Route();

router.post<{
    name: string;
    description: string;
    amount: number;
    interval: BudgetInterval;
    rank: number;
    startDate: number;
    type: 'percent' | 'fixed';
}>('/new',validate({
    name: 'string',
    description: 'string',
    amount: 'number',
    interval: ['daily', 'weekly', 'monthly', 'yearly'],
    rank: 'number',
    startDate: 'number',
    type: ['percent', 'fixed'],
}), async (req, res) => {
    const goal = (await Goal.new(req.body)).unwrap();

    res.sendStatus('goal:created');
    req.io.emit('goal:created', goal);
});

router.post('/all', async (req, res) => {
    const goals = (await Goal.all()).unwrap();
    const rendered = resolveAll(await Promise.all(goals.map(g => {
        return attemptAsync(async () => {
            const [buckets, transactions] = await Promise.all([
                g.getBuckets(),
                g.getTransactions(),                
            ]);

            return {
                goal: g,
                buckets: buckets.unwrap(),
                transactions: transactions.unwrap(),
            }
        });
    })));

    if (rendered.isErr()) return res.sendStatus('unknown:error');

    res.json(rendered.value);
});

router.post<{
    id: string;
    name: string;
    description: string;
    amount: number;
    interval: BudgetInterval;
    rank: number;
    startDate: number;
    type: 'percent' | 'fixed',
}>('/update', validate({
    id: 'string', 
    name: 'string',
    description: 'string',
    amount: 'number',
    interval: ['daily', 'weekly', 'monthly', 'yearly'],
    rank: 'number',
    startDate: 'number',
    type: ['percent', 'fixed']
}),async (req, res) => {
    const { id, name, description, amount, interval, rank, startDate, type } = req.body;
    const goal = (await Goal.fromId(id)).unwrap();
    if (!goal) return res.sendStatus('goal:not-found');

    (await goal.update({
        name,
        description,
        amount,
        interval,
        rank,
        startDate,
        type,
    })).unwrap();

    res.sendStatus('goal:updated');
    req.io.emit('goal:updated', goal);
});

router.post<{
    goalId: string;
    bucketId: string;
}>('/add-bucket', validate({
    goalId: 'string',
    bucketId: 'string',
}), async (req, res) => {
    const { goalId, bucketId } = req.body;
    const goal = (await (Goal.fromId(goalId))).unwrap();
    if (!goal) return res.sendStatus('goal:not-found');

    (await goal.addBucket(bucketId)).unwrap();

    res.sendStatus('goal:bucket-added');
    req.io.emit('goal:bucket-added', req.body);
});


router.post<{
    goalId: string;
    bucketId: string;
}>('/remove-bucket', validate({
    goalId: 'string',
    bucketId: 'string',
}), async (req, res) => {
    const { goalId, bucketId } = req.body;
    const goal = (await (Goal.fromId(goalId))).unwrap();
    if (!goal) return res.sendStatus('goal:not-found');

    (await goal.addBucket(bucketId)).unwrap();

    res.sendStatus('goal:bucket-removed');
    req.io.emit('goal:bucket-removed', req.body);
});

router.post<{
    goalId: string;
    transactionId: string;
}>('/add-transaction', validate({
    goalId: 'string',
    transactionId: 'string',
}), async (req, res) => {
    const { goalId, transactionId } = req.body;
    const goal = (await (Goal.fromId(goalId))).unwrap();
    if (!goal) return res.sendStatus('goal:not-found');

    (await goal.addTransaction(transactionId)).unwrap();

    res.sendStatus('goal:transaction-added');
    req.io.emit('goal:transaction-added', req.body);
});


router.post<{
    goalId: string;
    transactionId: string;
}>('/remove-bucket', validate({
    goalId: 'string',
    transactionId: 'string',
}), async (req, res) => {
    const { goalId, transactionId } = req.body;
    const goal = (await (Goal.fromId(goalId))).unwrap();
    if (!goal) return res.sendStatus('goal:not-found');

    (await goal.addBucket(transactionId)).unwrap();

    res.sendStatus('goal:transaction-removed');
    req.io.emit('goal:transaction-removed', req.body);
});