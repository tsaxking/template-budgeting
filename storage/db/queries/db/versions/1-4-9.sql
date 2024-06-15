DROP TABLE Miles;

CREATE TABLE IF NOT EXISTS Miles (
    id TEXT PRIMARY KEY,
    amount DECIMAL NOT NULL, -- in miles
    date BIGINT NOT NULL, -- timestamp
    archived INTEGER NOT NULL DEFAULT 0, -- 0 or 1
    description TEXT NOT NULL
);
