import { Route } from '../../structure/app/app';
import { DB } from '../../utilities/databases';
import { uuid } from '../../utilities/uuid';
import { validate } from '../../middleware/data-type';

export const router = new Route();

router.post('/get-types', async (_req, res) => {
    const [types, subtypes] = await Promise.all([
        DB.all('types/all-types'),
        DB.all('types/all-subtypes')
    ]);
    res.json({
        types: types.isOk() ? types.value : [],
        subtypes: subtypes.isOk() ? subtypes.value : []
    });
});

router.post<{
    name: string;
}>(
    '/new-type',
    validate({
        name: 'string'
    }),
    (req, res) => {
        const { name } = req.body;

        const dateCreated = Date.now();
        const dateModified = dateCreated;
        const id = uuid();

        DB.run('types/new-type', {
            id,
            name,
            dateCreated,
            dateModified
        });

        res.sendStatus('transaction-types:type-created');
        // res.sendStatus('transaction-types:type-created');
        req.io.emit('transaction-type:type-created', {
            id,
            name,
            dateCreated,
            dateModified
        });
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
    (req, res) => {
        const { name, typeId, type } = req.body;

        const dateCreated = Date.now();
        const dateModified = dateCreated;
        const id = uuid();

        DB.run('types/new-subtype', {
            id,
            name,
            typeId,
            dateCreated,
            dateModified,
            type
        });

        res.sendStatus('transaction-types:subtype-created');
        req.io.emit('transaction-type:subtype-created', {
            id,
            name,
            typeId,
            dateCreated,
            dateModified,
            type
        });
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
    (req, res) => {
        const { id, name } = req.body;

        const dateModified = Date.now();

        DB.run('types/update-type', {
            id,
            name,
            dateModified,
            dateCreated: dateModified
        });

        res.sendStatus('transaction-types:type-updated');
        req.io.emit('transaction-types:type-updated', {
            id,
            name,
            dateModified
        });
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
    (req, res) => {
        const { id, name, typeId, type } = req.body;

        if (['withdrawal', 'deposit'].indexOf(type) === -1) {
            return res.sendStatus('transaction-types:invalid-type');
        }

        const dateModified = Date.now();

        DB.run('types/update-subtype', {
            id,
            name,
            typeId,
            dateModified,
            dateCreated: dateModified,
            type
        });

        res.sendStatus('transaction-types:subtype-updated');
        req.io.emit('transaction-type:subtype-updated', {
            id,
            name,
            typeId,
            dateModified,
            type
        });
    }
);
