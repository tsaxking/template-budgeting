UPDATE Budgets
SET name = :name,
    description = :description,
    amount = :amount,
    interval = :interval,
    archived = :archived
WHERE id = :id;