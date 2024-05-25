import { validate } from '../../middleware/data-type';
import { Route } from '../../structure/app/app';
import { Subscription } from '../../structure/cache/subscriptions';

export const router = new Route();

router.post('/all', async (_req, res) => {
    const subs = await Subscription.active();
    if (subs.isErr()) return res.sendStatus('unknown:error', subs.error);
    res.json(subs.value);
});

router.post('/archived', async (_req, res) => {
    const subs = await Subscription.archived();
    if (subs.isErr()) return res.sendStatus('unknown:error', subs.error);
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

        const subs = await Subscription.fromBucket(bucketId);
        if (subs.isErr()) return res.sendStatus('unknown:error', subs.error);

        res.json(subs.value);
    }
);

router.post<{
    bucketId: string;
    name: string;
    amount: number;
    interval: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    taxDeductible: boolean;
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
        taxDeductible: 'boolean',
        description: 'string',
        startDate: 'number',
        endDate: (v: number | null) => v === null || typeof v === 'number',
        subtypeId: 'string',
        type: ['deposit', 'withdrawal']
    }),
    async (req, res) => {
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

        const s = await Subscription.new({
            bucketId,
            name,
            amount,
            interval,
            taxDeductible: +taxDeductible,
            description,
            startDate,
            endDate: endDate || undefined,
            subtypeId,
            type
        });

        if (s.isErr()) return res.sendStatus('unknown:error', s.error);

        res.sendStatus('subscriptions:created');
        req.io.emit('subscriptions:created', s.value);
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
    async (req, res) => {
        const { id, archive } = req.body;

        const sub = await Subscription.fromId(id);
        if (sub.isErr()) {
            return res.sendStatus('unknown:error', sub.error);
        }

        if (!sub.value) {
            return res.sendStatus('subscriptions:invalid-id');
        }

        const r = await sub.value.setArchive(archive);
        if (r.isErr()) {
            return res.sendStatus('unknown:error', r.error);
        }

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
    type: 'deposit' | 'withdrawal';
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
        bucketId: 'string',
        type: ['deposit', 'withdrawal']
    }),
    async (req, res) => {
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
            bucketId,
            type
        } = req.body;

        const sub = await Subscription.fromId(id);

        if (sub.isErr()) {
            console.error(sub.error);
            return res.sendStatus('unknown:error', sub.error);
        }

        if (!sub.value) {
            return res.sendStatus('subscriptions:invalid-id');
        }

        const r = await sub.value.update({
            name,
            amount,
            interval,
            taxDeductible: +taxDeductible,
            description,
            picture,
            startDate,
            endDate,
            subtypeId,
            bucketId,
            type
        });
        if (r.isErr()) {
            return res.sendStatus('unknown:error', r.error);
        }
        res.sendStatus('subscriptions:updated');
        req.io.emit('subscriptions:updated', sub);
    }
);
