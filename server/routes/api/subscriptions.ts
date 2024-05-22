import { validate } from '../../middleware/data-type';
import { Route } from '../../structure/app/app';
import { DB } from '../../utilities/databases';
import { uuid } from '../../utilities/uuid';

export const router = new Route();

router.post('/all', async (_req, res) => {
    const subs = await DB.all('subscriptions/active');
    if (subs.isErr()) return res.sendStatus('unknown:error');
    res.json(subs.value);
});

router.post('/archived', async (_req, res) => {
    const subs = await DB.all('subscriptions/archived');
    if (subs.isErr()) return res.sendStatus('unknown:error');
    res.json(subs.value);
});

router.post<{
    bucketId: string;
}>(
    '/from-bucket',
    validate({
        bucketId: 'string'
    }),
    async (req, res) => {
        const { bucketId } = req.body;

        const subs = await DB.all('subscriptions/from-bucket', {
            bucketId
        });

        if (subs.isErr()) return res.sendStatus('unknown:error');

        res.json(subs.value);
    }
);

router.post<{
    bucketId: string;
    name: string;
    amount: number;
    interval: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    taxDeductible: boolean;
    period: number;
    description: string;
    startDate: number;
    endDate: number | null;
    subtypeId: string;
    type: 'deposit' | 'withdrawal';
}>(
    '/new',
    validate({
        bucketId: 'string',
        name: 'string',
        amount: 'number',
        interval: ['hourly', 'daily', 'weekly', 'monthly', 'yearly'],
        period: 'number',
        taxDeductible: 'boolean',
        description: 'string',
        startDate: 'number',
        endDate: (v: number | null) => v === null || typeof v === 'number',
        subtypeId: 'string',
        type: ['deposit', 'withdrawal']
    }),
    (req, res) => {
        const {
            bucketId,
            name,
            amount,
            interval,
            taxDeductible,
            description,
            startDate,
            endDate,
            subtypeId,
            type
        } = req.body;

        const id = uuid();

        DB.run('subscriptions/new', {
            id,
            bucketId,
            name,
            amount,
            interval,
            taxDeductible: +taxDeductible,
            description,
            picture: '',
            startDate,
            endDate: endDate || undefined,
            subtypeId,
            type
        });

        res.sendStatus('subscriptions:created');
        req.io.emit('subscriptions:created', {
            id,
            bucketId,
            name,
            amount,
            interval,
            taxDeductible,
            description,
            startDate,
            endDate,
            subtypeId,
            type
        });
    }
);

router.post<{
    id: string;
    archive: boolean;
}>(
    '/set-archive',
    validate({
        id: 'string',
        archive: 'boolean'
    }),
    (req, res) => {
        const { id, archive } = req.body;

        const sub = DB.get('subscriptions/from-id', {
            id
        });

        if (!sub) {
            return res.sendStatus('subscriptions:invalid-id');
        }

        DB.run('subscriptions/set-archive', {
            id,
            archived: archive ? 1 : 0
        });

        if (archive) {
            res.sendStatus('subscriptions:archived');
            req.io.emit('subscriptions:archived', id);
        } else {
            res.sendStatus('subscriptions:restored');
            req.io.emit('subscriptions:restored', id);
        }
    }
);

router.post<{
    id: string;
    name: string;
    amount: number;
    interval: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    period: number;
    taxDeductible: boolean;
    description: string;
    picture: string;
    startDate: number;
    endDate: number;
    subtypeId: string;
    bucketId: string;
}>(
    '/update',
    validate({
        id: 'string',
        name: 'string',
        amount: 'number',
        interval: ['hourly', 'daily', 'weekly', 'monthly', 'yearly'],
        period: 'number',
        taxDeductible: 'boolean',
        description: 'string',
        picture: 'string',
        startDate: 'number',
        endDate: 'number',
        subtypeId: 'string',
        bucketId: 'string'
    }),
    (req, res) => {
        const {
            id,
            name,
            amount,
            interval,
            taxDeductible,
            description,
            picture,
            startDate,
            endDate,
            subtypeId,
            bucketId
        } = req.body;

        const sub = DB.get('subscriptions/from-id', {
            id
        });

        if (!sub) {
            return res.sendStatus('subscriptions:invalid-id');
        }

        DB.run('subscriptions/update', {
            id,
            name,
            amount,
            interval,
            taxDeductible: +taxDeductible,
            description,
            picture,
            startDate,
            endDate,
            subtypeId,
            bucketId
        });

        res.sendStatus('subscriptions:updated');
        req.io.emit('subscriptions:updated', {
            id,
            name,
            amount,
            interval,
            taxDeductible,
            description,
            picture,
            startDate,
            endDate,
            subtypeId,
            bucketId
        });
    }
);
