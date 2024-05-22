CREATE TABLE IF NOT EXISTS Goals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    archived BOOLEAN NOT NULL DEFAULT FALSE,
    created BIGINT NOT NULL,
    description TEXT NOT NULL,
    budgetId TEXT
);

CREATE TABLE IF NOT EXISTS Budgets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    archived BOOLEAN NOT NULL DEFAULT FALSE,
    created BIGINT NOT NULL,
    description TEXT NOT NULL
);