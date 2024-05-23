import { validate } from '../../middleware/data-type';
import { Route } from '../../structure/app/app';
import { fileStream } from '../../middleware/stream';
import { resolveAll } from '../../../shared/check';
import { Transaction } from '../../structure/cache/transactions';

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

        const transactions = await resolveAll(
            await Promise.all(buckets.map(b => Transaction.fromBucket(b)))
        );

        if (transactions.isErr()) return res.sendStatus('unknown:error', transactions.error);

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
        date: 'number',
        bucketId: 'string',
        description: 'string',
        subtypeId: 'string',
        taxDeductible: 'boolean'
    }),
    async (req, res) => {
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

        const t = await Transaction.new({
            amount,
            type,
            status,
            date,
            bucketId,
            description,
            subtypeId,
            taxDeductible: +taxDeductible
        });

        if (t.isErr()) return res.sendStatus('unknown:error', t.error);

        res.sendStatus('transactions:created');
        req.io.emit('transactions:created', t.value);
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
    taxDeductible: 0 | 1;
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
        taxDeductible: [0, 1]
    }),
    async (req, res) => {
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

        const t = await Transaction.fromId(id);
        if (t.isErr()) return res.sendStatus('unknown:error', t.error);
        if (!t.value) return res.sendStatus('transactions:invalid-id');

        const r = await t.value.update({
            amount,
            type,
            status,
            date,
            bucketId,
            description,
            subtypeId,
            taxDeductible: +taxDeductible
        });

        if (r.isErr()) return res.sendStatus('unknown:error', r.error);

        res.sendStatus('transactions:updated');

        req.io.emit('transactions:updated', t.value);
    }
);

router.post<{
    id: string;
    archived: boolean;
}>(
    '/set-archive-status',
    validate({
        id: 'string',
        archived: 'boolean'
    }),
    async (req, res) => {
        const { id, archived } = req.body;

        const t = await Transaction.fromId(id);
        if (t.isErr()) return res.sendStatus('unknown:error', t.error);

        if (!t.value) {
            return res.sendStatus('transactions:invalid-id');
        }

        const r = await t.value.setArchive(archived);
        if (r.isErr()) return res.sendStatus('unknown:error', r.error);

        if (archived) {
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
    async (req, res) => {
        const [file] = req.files;

        if (!file) return res.sendStatus('files:no-files');

        const { id: fileId } = file;
        const { id: transactionId } = req.body;

        const t = await Transaction.fromId(transactionId);
        if (t.isErr()) return res.sendStatus('unknown:error', t.error);
        if (!t.value) {
            return res.sendStatus('transactions:invalid-id');
        }

        const r = await t.value.setPicture(fileId);
        if (r.isErr()) return res.sendStatus('unknown:error', r.error);

        res.sendStatus('transactions:picture-updated');
        req.io.emit('transactions:picture-updated', t.value);
    }
);

router.post<{
    amount: number;
    from: string;
    to: string;
    description: string;
    date: number;
}>(
    '/transfer',
    validate({
        amount: 'number',
        from: 'string',
        to: 'string',
        description: 'string',
        date: 'number'
    }),
    async (req, res) => {
        const {
            amount,
            from,
            date,
            to,
            description,
        } = req.body;

        const status = 'completed';

        const fromT = await Transaction.new({
            amount,
            type: 'withdrawal',
            status,
            date,
            bucketId: from,
            description,
            subtypeId: '',
            taxDeductible: 0
        });

        if (fromT.isErr()) return res.sendStatus('unknown:error', fromT.error);

        const toT = await Transaction.new({
            amount,
            type: 'deposit',
            status,
            date,
            bucketId: to,
            description,
            subtypeId: '',
            taxDeductible: 0
        });

        if (toT.isErr()) return res.sendStatus('unknown:error', toT.error);
        res.sendStatus('transactions:created');
        req.io.emit('transactions:created', fromT.value);
        req.io.emit('transactions:created', toT.value);
    }
);
