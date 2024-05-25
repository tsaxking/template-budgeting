INSERT INTO Miles (
    id,
    amount,
    date,
    archived,
    description
) VALUES (
    :id,
    :amount,
    :date,
    0,
    :description
);