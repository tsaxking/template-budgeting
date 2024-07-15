INSERT INTO Goals (
    id,
    name,
    description,
    amount,
    interval,
    rank,
    startDate,
    created,
    archived,
    type,
    target
) VALUES (
    :id,
    :name,
    :description,
    :amount,
    :interval,
    :rank,
    :startDate,
    :created,
    :archived,
    :type,
    :target
);