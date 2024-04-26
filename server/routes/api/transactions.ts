import { validate } from '../../middleware/data-type';
import { Route } from '../../structure/app/app';
import { DB } from '../../utilities/databases';
import { uuid } from '../../utilities/uuid';
import { fileStream } from '../../middleware/stream';
import { resolveAll } from '../../../shared/check';

export const router = new Route();

router.post<{
    buckets: string[];
    from: number;
    to: number;
}>(
    '/search',
    validate({
        buckets: (v: unknown[]) =>
            Array.isArray(v) && v.every(i => typeof i === 'string'),
        from: 'number',
        to: 'number'
    }),
    async (req, res) => {
        const { buckets, from, to } = req.body;

        const transactions = resolveAll(
            await Promise.all(
                buckets.map(b =>
                    DB.all('transactions/from-bucket', { bucketId: b })
                )
            )
        );

        if (transactions.isErr()) return res.sendStatus('unknown:error');

        const filtered = transactions.value.flat().filter(t => {
            return +t.date >= +from && +t.date <= +to;
        });

        res.json(filtered);
    }
);

router.post<{
    amount: number;
    type: 'withdrawal' | 'deposit';
    status: 'pending' | 'completed' | 'failed';
    date: number;
    bucketId: string;
    description: string;
    subtypeId: string;
    taxDeductible: boolean;
}>(
    '/new',
    validate({
        amount: 'number',
        type: ['withdrawal', 'deposit'],
        status: ['pending', 'completed', 'failed'],
        date: 'string',
        bucketId: 'string',
        description: 'string',
        subtypeId: 'string',
        taxDeductible: 'boolean'
    }),
    (req, res) => {
        const {
            amount,
            type,
            status,
            date,
            bucketId,
            description,
            subtypeId,
            taxDeductible
        } = req.body;

        const id = uuid();

        DB.run('transactions/new', {
            id,
            amount,
            type,
            status,
            date,
            bucketId,
            description,
            subtypeId,
            taxDeductible: +taxDeductible
        });

        res.sendStatus('transactions:created');

        req.io.emit('transactions:created', {
            id,
            amount,
            type,
            status,
            date,
            bucketId,
            description,
            subtypeId,
            taxDeductible
        });
    }
);

router.post<{
    id: string;
    amount: number;
    type: 'withdrawal' | 'deposit';
    status: 'pending' | 'completed' | 'failed';
    date: number;
    bucketId: string;
    description: string;
    subtypeId: string;
    taxDeductible: boolean;
}>(
    '/update',
    validate({
        id: 'string',
        amount: 'number',
        type: ['withdrawal', 'deposit'],
        status: ['pending', 'completed', 'failed'],
        date: 'number',
        bucketId: 'string',
        description: 'string',
        subtypeId: 'string',
        taxDeductible: 'boolean'
    }),
    (req, res) => {
        const {
            id,
            amount,
            type,
            status,
            date,
            bucketId,
            description,
            subtypeId,
            taxDeductible
        } = req.body;

        const t = DB.get('transactions/from-id', { id });

        if (!t) {
            return res.sendStatus('transactions:invalid-id');
        }

        DB.run('transactions/update', {
            id,
            amount,
            type,
            status,
            date,
            bucketId,
            description,
            subtypeId,
            taxDeductible: +taxDeductible
        });

        res.sendStatus('transactions:updated');

        req.io.emit('transactions:updated', {
            id,
            amount,
            type,
            status,
            date,
            bucketId,
            description,
            subtypeId,
            taxDeductible
        });
    }
);

router.post<{
    id: string;
    archive: boolean;
}>(
    '/change-archive-status',
    validate({
        id: 'string',
        archive: 'boolean'
    }),
    (req, res) => {
        const { id, archive } = req.body;

        const t = DB.get('transactions/from-id', { id });

        if (!t) {
            return res.sendStatus('transactions:invalid-id');
        }

        DB.run('transactions/set-archive', {
            id,
            archived: archive ? 1 : 0
        });

        if (archive) {
            res.sendStatus('transactions:archived');
            req.io.emit('transactions:archived', id);
        } else {
            res.sendStatus('transactions:restored');
            req.io.emit('transactions:restored', id);
        }
    }
);

router.post<{
    id: string;
}>(
    '/change-picture',
    validate({
        id: 'string'
    }),
    fileStream({
        extensions: ['png', 'jpg', 'jpeg'],
        maxFileSize: 1024 * 1024 * 5 // 5MB
    }),
    (req, res) => {
        const [file] = req.files;

        if (!file) return res.sendStatus('files:no-files');

        const { id: fileId } = file;
        const { id: transactionId } = req.body;

        const t = DB.get('transactions/from-id', { id: transactionId });

        if (!t) {
            return res.sendStatus('transactions:invalid-id');
        }

        DB.run('transactions/update-picture', {
            id: transactionId,
            picture: fileId
        });

        res.sendStatus('transactions:picture-updated');
        req.io.emit('transactions:picture-updated', {
            id: transactionId,
            picture: fileId
        });
    }
);

router.post<{
    amount: number;
    from: string;
    to: string;
    description: string;
    subtypeId: string;
    taxDeductible: boolean;
    date: number;
}>(
    '/transfer',
    validate({
        amount: 'number',
        from: 'string',
        to: 'string',
        description: 'string',
        subtypeId: 'string',
        taxDeductible: 'boolean',
        date: 'number'
    }),
    (req, res) => {
        const {
            amount,
            from,
            date,
            to,
            description,
            subtypeId,
            taxDeductible
        } = req.body;

        const fromId = uuid();
        const toId = uuid();
        const status = 'completed';

        DB.run('transactions/new', {
            amount: amount,
            type: 'withdrawal',
            status,
            date,
            bucketId: from,
            description,
            subtypeId,
            taxDeductible: +taxDeductible,
            id: fromId
        });
        DB.run('transactions/new', {
            amount: amount,
            type: 'deposit',
            status,
            date,
            bucketId: to,
            description,
            subtypeId,
            taxDeductible: +taxDeductible,
            id: toId
        });

        res.sendStatus('transactions:created');
        req.io.emit('transactions:created', {
            amount: amount,
            type: 'withdrawal',
            status,
            date,
            bucketId: from,
            description,
            subtypeId,
            taxDeductible,
            id: fromId
        });
        req.io.emit('transactions:created', {
            amount: amount,
            type: 'deposit',
            status,
            date,
            bucketId: to,
            description,
            subtypeId,
            taxDeductible,
            id: toId
        });
    }
);
