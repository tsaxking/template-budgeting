import { BucketType } from '../../../shared/db-types-extended';
import { validate } from '../../middleware/data-type';
import { Route } from '../../structure/app/app';
import { Buckets } from '../../structure/cache/bucket';

export const router = new Route();

router.post('/all', async (_req, res) => {
    const buckets = await Buckets.all();
    if (buckets.isErr()) return res.sendStatus('unknown:error', buckets.error);
    res.json(buckets.value);
});

router.post('/archived', async (_req, res) => {
    const buckets = await Buckets.archived();
    if (buckets.isErr()) return res.sendStatus('unknown:error', buckets.error);
    res.json(buckets.value);
});

router.post<{
    name: string;
    description: string;
    type: BucketType;
}>(
    '/new',
    validate({
        name: 'string',
        description: 'string',
        type: ['debit', 'credit', 'savings', 'other']
    }),
    async (req, res) => {
        const { name, description, type } = req.body;

        const b = await Buckets.new({
            name,
            description,
            type
        });
        if (b.isErr()) return res.sendStatus('unknown:error', b.error);

        res.sendStatus('buckets:created');
        req.io.emit('buckets:created', b.value);
    }
);

router.post<{
    id: string;
    name: string;
    description: string;
    type: 'debit' | 'credit' | 'savings';
}>(
    '/update',
    validate({
        id: 'string',
        name: 'string',
        description: 'string',
        type: ['debit', 'credit', 'savings']
    }),
    async (req, res) => {
        const { id, name, description, type } = req.body;

        const b = await Buckets.fromId(id);

        if (b.isOk() && b.value) {
            await b.value.update({
                name,
                description,
                type
            });

            res.sendStatus('buckets:updated');
            req.io.emit('buckets:updated', b.value);
        } else {
            res.sendStatus('buckets:invalid-id');
        }
    }
);

router.post<{
    bucketId: string;
    archived: boolean;
}>(
    '/set-archive-status',
    validate({
        bucketId: 'string',
        archived: 'boolean'
    }),
    async (req, res) => {
        const { bucketId, archived } = req.body;

        const b = await Buckets.fromId(bucketId);

        if (b.isErr()) return res.sendStatus('unknown:error', b.error);
        if (!b.value) return res.sendStatus('page:not-found');

        const r = await b.value.setArchive(archived);

        if (r.isErr()) return res.sendStatus('unknown:error', r.error);

        if (archived) {
            res.sendStatus('buckets:archived', { bucketId });
            req.io.emit('buckets:archived', { bucketId });
        } else {
            res.sendStatus('buckets:restored', { bucketId });
            req.io.emit('buckets:restored', { bucketId });
        }
    }
);
