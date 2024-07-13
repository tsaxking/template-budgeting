DROP TABLE Goals;
DROP TABLE BudgetParsing;

CREATE TABLE Goals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    amount DECIMAL, -- NULL for non-amount goals
    interval TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
    rank INTEGER NOT NULL,
    startDate BIGINT NOT NULL,
    created BIGINT NOT NULL,
    archived BOOLEAN NOT NULL DEFAULT FALSE
);

-- Linking table between goals and subtypes
CREATE TABLE IF NOT EXISTS BucketGoals (
    goalId TEXT NOT NULL,
    bucketId TEXT NOT NULL
);

-- Linking table between goals and subtypes
CREATE TABLE IF NOT EXISTS TransactionGoals (
    goalId TEXT NOT NULL,
    transactionId TEXT NOT NULL UNIQUE -- only 1 goal per transaction
);