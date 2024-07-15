ALTER TABLE Goals ADD COLUMN type TEXT NOT NULL;
ALTER TABLE Goals ADD COLUMN target DECIMAL; -- If null, then it's a savings goal