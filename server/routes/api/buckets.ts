import { validate } from '../../middleware/data-type';
import { Route } from '../../structure/app/app';
import { DB } from '../../utilities/databases';
import { uuid } from '../../utilities/uuid';

export const router = new Route();

router.post('/all', (_req, res) => {
    const buckets = DB.all('buckets/all');

    res.json(buckets);
});

router.post('/archived', (_req, res) => {
    const buckets = DB.all('buckets/archived');

    res.json(buckets);
});

router.post<{
    name: string;
    description: string;
    type: 'debit' | 'credit' | 'savings';
}>(
    '/new',
    validate({
        name: 'string',
        description: 'string',
        type: ['debit', 'credit', 'savings']
    }),
    (req, res) => {
        const { name, description, type } = req.body;

        const created = Date.now();
        const id = uuid();

        DB.run('buckets/new', {
            id,
            name,
            description,
            type,
            created
        });

        res.sendStatus('buckets:created');
        req.io.emit('buckets:created', {
            id,
            name,
            description,
            type,
            created
        });
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

        const b = await DB.get('buckets/from-id', { id });

        if (b.isOk() && b.value) {
            DB.run('buckets/update', {
                id,
                name,
                description,
                type,
                created: b.value.created
            });

            res.sendStatus('buckets:updated');
            req.io.emit('buckets:updated', {
                id,
                name,
                description,
                type,
                created: b.value.created
            });
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
    (req, res) => {
        const { bucketId, archived } = req.body;

        const b = DB.get('buckets/from-id', { id: bucketId });

        if (!b) {
            return res.sendStatus('buckets:invalid-id');
        }

        DB.run('buckets/set-archive', {
            id: bucketId,
            archived: archived ? 1 : 0
        });

        if (archived) {
            res.sendStatus('buckets:archived');
            req.io.emit('buckets:archived', { bucketId });
        } else {
            res.sendStatus('buckets:restored');
            req.io.emit('buckets:restored', { bucketId });
        }
    }
);
