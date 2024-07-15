import { Route } from '../../structure/app/app';
import { validate } from '../../middleware/data-type';
import { Type } from '../../structure/cache/types';
import { Subtype } from '../../structure/cache/subtypes';
import { attemptAsync, resolveAll } from '../../../shared/check';

export const router = new Route();

router.post('/get-types', async (_req, res) => {
    const [types, subtypes] = await Promise.all([Type.all(), Subtype.all()]);

    if (types.isErr()) return res.sendStatus('unknown:error', types.error);
    if (subtypes.isErr())
        return res.sendStatus('unknown:error', subtypes.error);

    res.json({
        types: types.value,
        subtypes: subtypes.value
    });
});

router.post('/get-subtypes', async (req, res) => {
    const subtypes = await Subtype.all();

    if (subtypes.isErr())
        return res.sendStatus('unknown:error', subtypes.error);

    res.json(subtypes.value);
});

router.post<{
    name: string;
}>(
    '/new-type',
    validate({
        name: 'string'
    }),
    async (req, res) => {
        const { name } = req.body;

        const t = await Type.new({
            name
        });
        if (t.isErr()) return res.sendStatus('unknown:error', t.error);

        res.sendStatus('transaction-types:type-created');
        req.io.emit('transaction-types:type-created', t.value);
    }
);

router.post<{
    name: string;
    typeId: string;
    type: 'withdrawal' | 'deposit';
}>(
    '/new-subtype',
    validate({
        name: 'string',
        typeId: 'string',
        type: ['withdrawal', 'deposit']
    }),
    async (req, res) => {
        const { name, typeId, type } = req.body;

        const s = await Subtype.new({
            name,
            typeId,
            type
        });

        if (s.isErr()) return res.sendStatus('unknown:error', s.error);

        res.sendStatus('transaction-types:subtype-created');
        req.io.emit('transaction-types:subtype-created', s.value);
    }
);

router.post<{
    id: string;
    name: string;
}>(
    '/update-type',
    validate({
        id: 'string',
        name: 'string'
    }),
    async (req, res) => {
        const { id, name } = req.body;

        const t = await Type.fromId(id);
        if (t.isErr()) return res.sendStatus('unknown:error', t.error);
        if (!t.value)
            return res.sendStatus('unknown:error', { error: 'type-not-found' });

        t.value.update({
            name
        });

        res.sendStatus('transaction-types:type-updated');
        req.io.emit('transaction-types:type-updated', t);
    }
);

router.post<{
    id: string;
    name: string;
    typeId: string;
    type: 'withdrawal' | 'deposit';
}>(
    '/update-subtype',
    validate({
        id: 'string',
        name: 'string',
        typeId: 'string',
        type: ['withdrawal', 'deposit']
    }),
    async (req, res) => {
        const { id, name, typeId, type } = req.body;

        const s = await Subtype.fromId(id);
        if (s.isErr()) return res.sendStatus('unknown:error', s.error);
        if (!s.value)
            return res.sendStatus('unknown:error', {
                error: 'subtype-not-found'
            });

        s.value.update({
            name,
            typeId,
            type
        });

        res.sendStatus('transaction-types:subtype-updated');
        req.io.emit('transaction-types:subtype-updated', s.value);
    }
);

router.post<{
    id: string;
    from: number;
    to: number;
}>(
    '/get-type-transactions',
    validate({
        id: 'string',
        from: 'number',
        to: 'number'
    }),
    async (req, res) => {
        const { id, from, to } = req.body;
        const type = await Type.fromId(id);
        if (type.isErr()) return res.sendStatus('unknown:error', type.error);
        if (!type.value)
            return res.sendStatus('unknown:error', { error: 'type-not-found' });

        const transactions = await type.value.getTransactions(from, to);
        if (transactions.isErr())
            return res.sendStatus('unknown:error', transactions.error);
        res.json(transactions.value);
    }
);

router.post<{
    ids: string[];
    from: number;
    to: number;
}>(
    '/get-subtype-transactions',
    validate({
        ids: (val: unknown) =>
            Array.isArray(val) && val.every(v => typeof v === 'string'),
        from: 'number',
        to: 'number'
    }),
    async (req, res) => {
        const { ids, from, to } = req.body;
        const subtypes = resolveAll(
            await Promise.all(ids.map(id => Subtype.fromId(id)))
        ).unwrap();
        const transactions = resolveAll(
            await Promise.all(
                subtypes.map(s =>
                    attemptAsync(async () => {
                        return s
                            ? (await s.getTransactions(from, to)).unwrap()
                            : [];
                    })
                )
            )
        ).unwrap();

        res.json(transactions);
    }
);
