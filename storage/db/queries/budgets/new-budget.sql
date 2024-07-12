INSERT INTO Budgets (
    id,
    name,
    description,
    amount,
    interval,
    created,
    archived
) VALUES (
    :id,
    :name,
    :description,
    :amount,
    :interval,
    :created,
    :archived
);