import { Route } from '../../structure/app/app';
import { DB } from '../../utilities/databases';
import { uuid } from '../../utilities/uuid';
import { validate } from '../../middleware/data-type';
import { BalanceCorrection } from '../../structure/cache/balance-correction';

export const router = new Route();

router.post('/all', async (_req, res) => {
    const balanceCorrections = await DB.all('balance-correction/all');

    if (balanceCorrections.isErr()) return res.sendStatus('unknown:error', balanceCorrections.error);

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
    async (req, res) => {
        const { balance, bucketId, date } = req.body;

        const b = await BalanceCorrection.new({
            balance,
            bucketId,
            date
        });

        if (b.isErr()) return res.sendStatus('unknown:error', b.error);

        res.sendStatus('balance-correction:created');
        req.io.emit('balance-correction:created', b);
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
    async (req, res) => {
        const { id, balance, bucketId, date } = req.body;

        const b = await BalanceCorrection.get(id);
        if (b.isErr()) return res.sendStatus('unknown:error', b.error);
        if (!b.value) return res.sendStatus('page:not-found');
        
        await b.value.update({
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
    async (req, res) => {
        const { id } = req.body;

        const b = await BalanceCorrection.get(id);
        if (b.isErr()) return res.sendStatus('unknown:error', b.error);
        if (!b.value) return res.sendStatus('page:not-found');
        b.value.destroy();

        res.sendStatus('balance-correction:deleted');
        req.io.emit('balance-correction:deleted', { id });
    }
);
