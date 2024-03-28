import { validate } from '../../middleware/data-type';
import { Route } from '../../structure/app/app';
import { DB } from '../../utilities/databases';
import { uuid } from '../../utilities/uuid';
import { fileStream } from '../../middleware/stream';

export const router = new Route();

router.post<{
    bucket: string;
    from: string;
    to: string;
}>(
    '/search',
    validate({
        bucket: 'string',
        from: 'string',
        to: 'string'
    }),
    async (req, res) => {
        const { bucket, from, to } = req.body;

        const transactions = await DB.all('transactions/from-bucket', {
            bucketId: bucket
        });

        if (transactions.isErr()) return res.sendStatus('unknown:error');

        const filtered = transactions.value.filter(t => {
            return +t.date >= +from && +t.date <= +to;
        });

        res.stream(filtered.map(t => JSON.stringify(t)));
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
    '/change-transaction-archive-status',
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
    status: 'pending' | 'completed' | 'failed';
    date: number;
    from: string;
    to: string;
    description: string;
    subtypeId: string;
    taxDeductible: boolean;
}>(
    '/transfer',
    validate({
        amount: 'number',
        status: ['pending', 'completed', 'failed'],
        date: 'number',
        from: 'string',
        to: 'string',
        description: 'string',
        subtypeId: 'string',
        taxDeductible: 'boolean'
    }),
    (req, res) => {
        const {
            amount,
            status,
            date,
            from,
            to,
            description,
            subtypeId,
            taxDeductible
        } = req.body;

        const fromId = uuid();
        const toId = uuid();

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
            type: 'withdrawal',
            status,
            date,
            bucketId: from,
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
            type: 'withdrawal',
            status,
            date,
            bucketId: from,
            description,
            subtypeId,
            taxDeductible,
            id: toId
        });
    }
);
