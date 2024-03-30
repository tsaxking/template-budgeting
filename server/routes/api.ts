import { Route } from '../structure/app/app';

export const router = new Route();

import { router as subscriptions } from './api/subscriptions';
import { router as transactions } from './api/transactions';
import { router as types } from './api/types';
import { router as buckets } from './api/buckets';
import { router as balanceCorrection } from './api/balance-correction';
import { router as miles } from './api/miles';

router.route('/subscriptions', subscriptions);
router.route('/transactions', transactions);
router.route('/types', types);
router.route('/buckets', buckets);
router.route('/balance-correction', balanceCorrection);
router.route('/miles', miles);
