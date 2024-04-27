UPDATE Loans SET
    amount = :amount,
    interestRate = :interestRate,
    startDate = :startDate,
    endDate = :endDate,
    status = :status,
    title = :title,
    description = :description
WHERE id = :id;