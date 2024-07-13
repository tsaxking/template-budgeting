INSERT INTO Goals (
    id,
    name,
    description,
    amount,
    interval,
    rank,
    startDate,
    created,
    archived
) VALUES (
    :id,
    :name,
    :description,
    :amount,
    :interval,
    :rank,
    :startDate,
    :created,
    :archived
);