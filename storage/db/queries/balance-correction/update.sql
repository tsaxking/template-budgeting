UPDATE BalanceCorrection
SET balance = :balance,
    date = :date,
    bucketId = :bucketId
WHERE id = :id;