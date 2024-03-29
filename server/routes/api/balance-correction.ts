import { Route } from '../../structure/app/app';
import { DB } from '../../utilities/databases';
import { uuid } from '../../utilities/uuid';
import { validate } from '../../middleware/data-type';

export const router = new Route();

router.get('/all', async (_req, res) => {
    const balanceCorrections = await DB.all('balance-correction/all');

    if (balanceCorrections.isErr()) return res.sendStatus('unknown:error');

    res.json(balanceCorrections.value);
});

router.post<{
    balance: number;
    bucketId: string;
    date: number;
}>(
    '/new',
    validate({
        balance: 'number',
        bucketId: 'string',
        date: 'number'
    }),
    (req, res) => {
        const { balance, bucketId, date } = req.body;

        const b = DB.get('buckets/from-id', { id: bucketId });

        if (!b) return res.sendStatus('buckets:invalid-id');

        const id = uuid();

        DB.run('balance-correction/new', {
            id,
            balance,
            bucketId,
            date
        });

        res.sendStatus('balance-correction:created');
        req.io.emit('balance-correction:created', {
            id,
            balance,
            bucketId,
            date
        });
    }
);

router.post<{
    id: string;
    balance: number;
    bucketId: string;
    date: number;
}>(
    '/update',
    validate({
        id: 'string',
        balance: 'number',
        bucketId: 'string',
        date: 'number'
    }),
    (req, res) => {
        const { id, balance, bucketId, date } = req.body;

        const b = DB.get('buckets/from-id', { id: bucketId });

        if (!b) return res.sendStatus('buckets:invalid-id');

        DB.run('balance-correction/update', {
            id,
            balance,
            bucketId,
            date
        });

        res.sendStatus('balance-correction:updated');
        req.io.emit('balance-correction:updated', {
            id,
            balance,
            bucketId,
            date
        });
    }
);

router.post<{
    id: string;
}>(
    '/delete',
    validate({
        id: 'string'
    }),
    (req, res) => {
        const { id } = req.body;

        DB.run('balance-correction/delete', { id });

        res.sendStatus('balance-correction:deleted');
        req.io.emit('balance-correction:deleted', { id });
    }
);
