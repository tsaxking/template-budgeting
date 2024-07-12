SELECT 
    Subtypes.*
FROM Subtypes
INNER JOIN BudgetSubtypes ON Subtypes.id = BudgetSubtypes.subtypeId
WHERE BudgetSubtypes.budgetId = :budgetId;