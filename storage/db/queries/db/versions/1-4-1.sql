CREATE TABLE IF NOT EXISTS Loans (
    id TEXT PRIMARY KEY,
    amount INTEGER NOT NULL,
    interestRate INTEGER NOT NULL,
    startDate BIGINT NOT NULL,
    endDate BIGINT NOT NULL,
    status TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL
);