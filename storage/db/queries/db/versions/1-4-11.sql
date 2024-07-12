DROP TABLE IF EXISTS Budgets;

CREATE TABLE IF NOT EXISTS Budgets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    amount MONEY NOT NULL,
    interval TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
    created BIGINT NOT NULL,
    archived BOOLEAN NOT NULL DEFAULT FALSE
);

-- Linking table between budgets and subtypes
CREATE TABLE IF NOT EXISTS BudgetSubtypes (
    subtypeId TEXT NOT NULL,
    budgetId TEXT NOT NULL
);