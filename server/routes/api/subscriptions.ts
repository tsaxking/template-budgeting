import { validate } from '../../middleware/data-type';
import { Route } from '../../structure/app/app';
import { DB } from '../../utilities/databases';
import { uuid } from '../../utilities/uuid';

export const router = new Route();

router.post('/all', (_req, res) => {
    const subs = DB.all('subscriptions/active');

    res.json(subs);
});

router.post('/archived', (_req, res) => {
    const subs = DB.all('subscriptions/archived');

    res.json(subs);
});

router.post<{
    bucketId: string;
}>(
    '/from-bucket',
    validate({
        bucketId: 'string'
    }),
    (req, res) => {
        const { bucketId } = req.body;

        const subs = DB.all('subscriptions/from-bucket', {
            bucketId
        });

        res.json(subs);
    }
);

router.post<{
    bucketId: string;
    name: string;
    amount: number;
    interval: number;
    taxDeductible: boolean;
    description: string;
    picture: string;
    startDate: number;
    endDate: number;
    subtypeId: string;
}>(
    '/new',
    validate({
        bucketId: 'string',
        name: 'string',
        amount: 'number',
        interval: 'number',
        taxDeductible: 'boolean',
        description: 'string',
        picture: 'string',
        startDate: 'number',
        endDate: 'number',
        subtypeId: 'string'
    }),
    (req, res) => {
        const {
            bucketId,
            name,
            amount,
            interval,
            taxDeductible,
            description,
            picture,
            startDate,
            endDate,
            subtypeId
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
            picture,
            startDate,
            endDate,
            subtypeId
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
            picture,
            startDate,
            endDate,
            subtypeId
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
    interval: number;
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
        interval: 'number',
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
