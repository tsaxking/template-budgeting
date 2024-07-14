export type SocketEvent = 
      
	| 'disconnect'
	| 'account:created'
	| 'account:logged-in'
	| 'account:logged-out'
	| 'account:password-reset-success'
	| 'account:picture-updated'
	| 'account:removed'
	| 'account:role-added'
	| 'account:role-removed'
	| 'account:settings-set'
	| 'account:unverified'
	| 'account:update-email'
	| 'account:update-first-name'
	| 'account:update-last-name'
	| 'account:update-phone-number'
	| 'account:update-picture'
	| 'account:update-username'
	| 'account:username-changed'
	| 'account:verified'
	| 'balance-correction:created'
	| 'balance-correction:deleted'
	| 'balance-correction:updated'
	| 'buckets:archived'
	| 'buckets:created'
	| 'buckets:restored'
	| 'buckets:updated'
	| 'budget:created'
	| 'budget:deleted'
	| 'budget:subtype-added'
	| 'budget:subtype-removed'
	| 'budget:updated'
	| 'goal:bucket-added'
	| 'goal:bucket-removed'
	| 'goal:created'
	| 'goal:transaction-added'
	| 'goal:transaction-removed'
	| 'goal:updated'
	| 'member:accepted'
	| 'member:add-skill'
	| 'member:rejected'
	| 'member:remove-skill'
	| 'member:request'
	| 'member:revoked'
	| 'member:status-updated'
	| 'member:update-bio'
	| 'member:update-resume'
	| 'member:update-title'
	| 'miles:archived'
	| 'miles:created'
	| 'miles:restored'
	| 'miles:updated'
	| 'page:open'
	| 'permissions:added'
	| 'permissions:removed'
	| 'roles:added-permission'
	| 'roles:added'
	| 'roles:deleted'
	| 'roles:new'
	| 'roles:removed-permission'
	| 'roles:removed'
	| 'roles:updated'
	| 'skills:added'
	| 'skills:removed'
	| 'subscriptions:archived'
	| 'subscriptions:created'
	| 'subscriptions:restored'
	| 'subscriptions:updated'
	| 'test:success'
	| 'test:test'
	| 'transaction-type:created'
	| 'transaction-types:subtype-created'
	| 'transaction-types:subtype-updated'
	| 'transaction-types:type-created'
	| 'transaction-types:type-updated'
	| 'transactions:archived'
	| 'transactions:created'
	| 'transactions:picture-updated'
	| 'transactions:restored'
	| 'transactions:updated'
;