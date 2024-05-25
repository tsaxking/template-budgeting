export type Transaction = {
    id: string;
    amount: number;
    type: 'withdrawal' | 'deposit';
    status: 'pending' | 'completed' | 'failed';
    date: number;
    bucketId: string;
    description: string;
    subtypeId: string;
    taxDeductible: 0 | 1;
    archived: 0 | 1;
    picture: string | null;
};

export type BucketType = 'debit' | 'credit' | 'savings' | 'other';

export type Bucket = {
    id: string;
    created: number;
    name: string;
    description: string;
    archived: 0 | 1;
    type: BucketType;
};

export type BalanceCorrection = {
    id: string;
    date: number;
    balance: number; // in cents
    bucketId: string;
};

export type Miles = {
    id: string;
    amount: number;
    date: number;
    archived: 0 | 1;
    description: string;
};

export type SubscriptionInterval =
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly';

export type Subscription = {
    id: string;
    name: string;
    startDate: number;
    endDate: number | null;
    interval: SubscriptionInterval;
    period: number; // how many intervals after the "0" interval (for hourly, 0 = midnight, 1 = 1am, etc.)
    bucketId: string;
    amount: number; // in cents
    subtypeId: string;
    description: string;
    picture: string | null;
    taxDeductible: 0 | 1;
    archived: 0 | 1;
    type: 'deposit' | 'withdrawal';
};

export type TransactionType = {
    id: string;
    name: string;
    dateCreated: number;
    dateModified: number;
};

export type Subtype = {
    id: string;
    name: string;
    dateCreated: number;
    dateModified: number;
    typeId: string;
    type: 'withdrawal' | 'deposit';
};

export type Goals = {
    id: string;
    name: string;
    amount: number;
    archived: 0 | 1;
    created: number;
    description: string;
    budgetId: string | null;
};

export type Budgets = {
    id: string;
    name: string;
    amount: number;
    archived: 0 | 1;
    created: number;
    description: string;
};
