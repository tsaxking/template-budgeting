SELECT Transactions.* FROM Transactions
INNER JOIN TransactionGoals ON Transactions.id = TransactionGoals.transactionId
WHERE TransactionGoals.goalId = :goalId;