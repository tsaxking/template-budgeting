import { validate } from '../../middleware/data-type';
import { Route } from '../../structure/app/app';
import { DB } from '../../utilities/databases';
import { uuid } from '../../utilities/uuid';

export const router = new Route();

router.post('/active', (_req, res) => {
    const miles = DB.all('miles/active');

    res.json(miles);
});

router.post('/archived', (_req, res) => {
    const miles = DB.all('miles/archived');

    res.json(miles);
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
    (req, res) => {
        const { amount, date } = req.body;

        const id = uuid();

        DB.run('miles/new', {
            id,
            amount,
            date,
            archived: 0
        });

        res.sendStatus('miles:created');
        req.io.emit('miles:created', {
            id,
            amount,
            date
        });
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
    (req, res) => {
        const { id, amount, date } = req.body;

        const m = DB.get('miles/from-id', { id });
        if (!m) return res.sendStatus('miles:invalid-id');

        DB.run('miles/update', {
            id,
            amount,
            date
        });

        res.sendStatus('miles:updated');
        req.io.emit('miles:updated', {
            id,
            amount,
            date
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

        const m = DB.get('miles/from-id', { id });
        if (!m) return res.sendStatus('miles:invalid-id');

        DB.run('miles/set-archive', {
            id,
            archived: archive ? 1 : 0
        });

        if (archive) {
            res.sendStatus('miles:archived');
            req.io.emit('miles:archived', { id });
        } else {
            res.sendStatus('miles:restored');
            req.io.emit('miles:restored', { id });
        }
    }
);
