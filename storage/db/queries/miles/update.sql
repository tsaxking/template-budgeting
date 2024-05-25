UPDATE Miles
SET
    date = :date,
    amount = :amount
    description = :description
WHERE id = :id;