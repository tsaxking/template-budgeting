SELECT Buckets.* FROM Buckets
INNER JOIN BucketGoals ON Buckets.id = BucketGoals.bucketId
WHERE BucketGoals.goalId = :goalId;