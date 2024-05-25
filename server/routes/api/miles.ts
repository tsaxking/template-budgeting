import { validate } from '../../middleware/data-type';
import { Route } from '../../structure/app/app';
import { Mile } from '../../structure/cache/miles';

export const router = new Route();

router.post('/active', async (_req, res) => {
    const miles = await Mile.active();
    if (miles.isErr()) return res.sendStatus('unknown:error', miles.error);
    res.json(miles.value);
});

router.post('/archived', async (_req, res) => {
    const miles = await Mile.archived();
    if (miles.isErr()) return res.sendStatus('unknown:error', miles.error);
    res.json(miles.value);
});

router.post<{
    amount: number;
    date: number;
}>(
    '/new',
    validate({
        amount: 'number',
        date: 'number'
    }),
    async (req, res) => {
        const { amount, date } = req.body;

        const m = await Mile.new({
            amount,
            date
        });
        if (m.isErr()) return res.sendStatus('unknown:error', m.error);

        res.sendStatus('miles:created');
        req.io.emit('miles:created', m.value);
    }
);

router.post<{
    amount: number;
    date: number;
    id: string;
}>(
    '/miles-update',
    validate({
        amount: 'number',
        date: 'number',
        id: 'string'
    }),
    async (req, res) => {
        const { id, amount, date } = req.body;

        const m = await Mile.fromId(id);
        if (m.isErr()) return res.sendStatus('miles:invalid-id');
        if (!m.value) return res.sendStatus('miles:invalid-id');

        const r = await m.value.update({
            amount,
            date
        });

        if (r.isErr()) return res.sendStatus('unknown:error', r.error);

        res.sendStatus('miles:updated');
        req.io.emit('miles:updated', m.value);
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

        const m = await Mile.fromId(id);
        if (m.isErr()) return res.sendStatus('miles:invalid-id');
        if (!m.value) return res.sendStatus('miles:invalid-id');

        m.value.setArchive(archive);

        if (archive) {
            res.sendStatus('miles:archived');
            req.io.emit('miles:archived', { id });
        } else {
            res.sendStatus('miles:restored');
            req.io.emit('miles:restored', { id });
        }
    }
);
