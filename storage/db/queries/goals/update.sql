UPDATE Goals
SET name = :name,
    description = :description,
    amount = :amount,
    interval = :interval,
    rank = :rank,
    startDate = :startDate,
    created = :created,
    archived = :archived,
    type = :type,
    target = :target
WHERE id = :id;