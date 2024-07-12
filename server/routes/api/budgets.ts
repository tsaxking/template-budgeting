import { validate } from '../../middleware/data-type';
import { Route } from '../../structure/app/app';
import { Budget } from '../../structure/cache/budget';
import { Subtype } from '../../structure/cache/subtypes';

export const router = new Route();

router.post<{
    name: string;
    description: string;
    amount: number;
    interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
}>(
    '/new',
    validate({
        name: 'string',
        description: 'string',
        amount: 'number',
        interval: ['daily', 'weekly', 'monthly', 'yearly']
    }),
    async (req, res) => {
        const { name, description, amount, interval } = req.body;

        (
            await Budget.new({
                name,
                description,
                amount,
                interval
            })
        ).unwrap();

        res.sendStatus('budget:created');
    }
);

router.post('/all', async (req, res) => {
    const budgets = (await Budget.all()).unwrap();
    res.json(budgets);
});

router.post<{
    id: string;
    name: string;
    description: string;
    amount: number;
    interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
}>(
    '/update',
    validate({
        id: 'string',
        name: 'string',
        description: 'string',
        amount: 'number',
        interval: ['daily', 'weekly', 'monthly', 'yearly']
    }),
    async (req, res) => {
        const { id, ...data } = req.body;
        const budget = (await Budget.fromId(id)).unwrap();
        if (!budget) return res.sendStatus('budget:not-found');
        (await budget.update(data)).unwrap();

        res.sendStatus('budget:updated');
    }
);

router.post<{
    id: string;
}>(
    '/delete',
    validate({
        id: 'string'
    }),
    async (req, res) => {
        const b = (await Budget.fromId(req.body.id)).unwrap();
        if (!b) return res.sendStatus('budget:not-found');
        (await b.delete()).unwrap();
        res.sendStatus('budget:deleted');
    }
);

router.post<{
    id: string;
}>(
    '/get-subtypes',
    validate({
        id: 'string'
    }),
    async (req, res) => {
        const b = (await Budget.fromId(req.body.id)).unwrap();
        if (!b) return res.sendStatus('budget:not-found');

        const subtypes = (await b.getSubtypes()).unwrap();

        res.json(subtypes);
    }
);

router.post<{
    budgetId: string;
    subtypeId: string;
}>(
    '/add-subtype',
    validate({
        budgetId: 'string',
        subtypeId: 'string'
    }),
    async (req, res) => {
        const b = (await Budget.fromId(req.body.budgetId)).unwrap();
        if (!b) return res.sendStatus('budget:not-found');

        const subtype = (await Subtype.fromId(req.body.subtypeId)).unwrap();
        if (!subtype) return res.sendStatus('budget:subtype-not-found');

        (await b.addSubtype(req.body.subtypeId)).unwrap();

        res.sendStatus('budget:subtype-added');
    }
);

router.post<{
    budgetId: string;
    subtypeId: string;
}>(
    '/remove-subtype',
    validate({
        budgetId: 'string',
        subtypeId: 'string'
    }),
    async (req, res) => {
        const b = (await Budget.fromId(req.body.budgetId)).unwrap();
        if (!b) return res.sendStatus('budget:not-found');

        const subtype = (await Subtype.fromId(req.body.subtypeId)).unwrap();
        if (!subtype) return res.sendStatus('budget:subtype-not-found');

        (await b.removeSubtype(req.body.subtypeId)).unwrap();

        res.sendStatus('budget:subtype-removed');
    }
);
