INSERT INTO Transactions (
    id,
    amount,
    type,
    status,
    date,
    bucketId,
    description,
    subtypeId,
    taxDeductible,
    transfer
) VALUES (
    :id,
    :amount,
    :type,
    :status,
    :date,
    :bucketId,
    :description,
    :subtypeId,
    :taxDeductible,
    :transfer
);