CREATE TABLE IF NOT EXISTS Accounts (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    key TEXT NOT NULL,
    salt TEXT NOT NULL,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    passwordChange TEXT,
    picture TEXT,
    verified INTEGER NOT NULL DEFAULT 0,
    verification TEXT,
    emailChange TEXT,
    passwordChangeDate BIGINT,
    phoneNumber TEXT,
    created BIGINT NOT NULL
);


CREATE TABLE IF NOT EXISTS Members (
    id TEXT PRIMARY KEY,
    title TEXT,
    status TEXT DEFAULT 'pending',
    bio TEXT,
    resume TEXT,
    board INTEGER NOT NULL DEFAULT 0
);


CREATE TABLE IF NOT EXISTS Roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    rank INTEGER NOT NULL
);


CREATE TABLE IF NOT EXISTS AccountRoles (
    accountId TEXT NOT NULL,
    roleId TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Permissions (
    permission TEXT NOT NULL, -- changed to primary key in 1-3-0
    description TEXT
);

CREATE TABLE IF NOT EXISTS RolePermissions (
    roleId TEXT NOT NULL,
    permission TEXT NOT NULL
);


-- CREATE TABLE IF NOT EXISTS Limit (
--     ip TEXT PRIMARY KEY,
--     limitStart INTEGER NOT NULL,
--     limitTime INTEGER NOT NULL
-- );


CREATE TABLE IF NOT EXISTS Version (
    major INTEGER NOT NULL DEFAULT 1,
    minor INTEGER NOT NULL DEFAULT 0,
    patch INTEGER NOT NULL DEFAULT 0
);


CREATE TABLE IF NOT EXISTS Sessions (
    id TEXT PRIMARY KEY,
    accountId TEXT,
    ip TEXT,
    userAgent TEXT,
    latestActivity BIGINT,
    requests INTEGER NOT NULL DEFAULT 0,
    created BIGINT NOT NULL,
    prevUrl TEXT

    -- customData TEXT NOT NULL DEFAULT '{}' -- added in 1-4-0
);

CREATE TABLE IF NOT EXISTS AccountSettings (
    accountId TEXT NOT NULL PRIMARY KEY,
    settings TEXT NOT NULL -- JSON
);

-- CREATE TABLE IF NOT EXISTS BlockList (
--     ip TEXT PRIMARY KEY,
--     created INTEGER NOT NULL
-- );



-- Reset the version number
DELETE FROM Version;

INSERT INTO Version (
    major,
    minor,
    patch
) VALUES (
    1,
    0,
    0
);



-- App tables

CREATE TABLE IF NOT EXISTS Transactions (
    id TEXT PRIMARY KEY,
    amount INTEGER NOT NULL, -- in cents
    type TEXT NOT NULL, -- 'withdrawal', 'deposit'
    status TEXT NOT NULL, -- 'pending', 'completed', 'failed'
    date BIGINT NOT NULL, -- timestamp
    bucketId TEXT NOT NULL,
    description TEXT NOT NULL,
    subtypeId TEXT NOT NULL, -- used to identify the subtype of the transaction
    taxDeductible INTEGER NOT NULL DEFAULT 0, -- 0 or 1
    archived INTEGER NOT NULL DEFAULT 0, -- 0 or 1
    picture TEXT
);

CREATE TABLE IF NOT EXISTS Buckets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    created BIGINT NOT NULL, -- timestamp
    archived INTEGER NOT NULL DEFAULT 0, -- 0 or 1
    type TEXT NOT NULL -- 'debit', 'credit', 'savings'
);

CREATE TABLE IF NOT EXISTS BalanceCorrection (
    id TEXT PRIMARY KEY,
    date BIGINT NOT NULL, -- timestamp
    balance INTEGER NOT NULL, -- in cents
    bucketId TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Miles (
    id TEXT PRIMARY KEY,
    amount INTEGER NOT NULL, -- in miles
    date BIGINT NOT NULL, -- timestamp
    archived INTEGER NOT NULL DEFAULT 0 -- 0 or 1
);

CREATE TABLE IF NOT EXISTS Subscriptions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    startDate BIGINT NOT NULL, -- timestamp
    endDate BIGINT, -- timestamp
    interval INTEGER NOT NULL, -- in ms
    bucketId TEXT NOT NULL,
    subtypeId TEXT NOT NULL, -- used to identify the subtype of the subscription
    description TEXT NOT NULL,
    picture TEXT,
    taxDeductible INTEGER NOT NULL DEFAULT 0, -- 0 or 1
    amount INTEGER NOT NULL, -- in cents
    archived INTEGER NOT NULL DEFAULT 0 -- 0 or 1
);

CREATE TABLE IF NOT EXISTS TransactionTypes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    dateCreated BIGINT NOT NULL, -- timestamp
    dateModified BIGINT NOT NULL -- timestamp
);

CREATE TABLE IF NOT EXISTS Subtypes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    dateCreated BIGINT NOT NULL, -- timestamp
    dateModified BIGINT NOT NULL, -- timestamp
    type TEXT NOT NULL, -- 'withdrawal', 'deposit'
    typeId TEXT NOT NULL -- used to identify the type of the subtype
);