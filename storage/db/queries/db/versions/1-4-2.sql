ALTER TABLE BalanceCorrection DROP COLUMN balance;
ALTER TABLE BalanceCorrection ADD COLUMN balance DECIMAL NOT NULL;

ALTER TABLE Transactions DROP COLUMN amount;
ALTER TABLE Transactions ADD COLUMN amount DECIMAL NOT NULL;

ALTER TABLE Subscriptions DROP COLUMN amount;
ALTER TABLE Subscriptions ADD COLUMN amount DECIMAL NOT NULL;