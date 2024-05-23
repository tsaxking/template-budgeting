ALTER TABLE Subscriptions DROP COLUMN interval;
ALTER TABLE Subscriptions ADD COLUMN interval TEXT NOT NULL;