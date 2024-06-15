SELECT Transactions.*
FROM Transactions
INNER JOIN Subtypes ON Transactions.subtypeId = Subtypes.id
WHERE Subtypes.typeId = :typeId AND Transactions.archived = 0;