UPDATE Sessions SET
    accountId = :accountId,
    userAgent = :userAgent,
    latestActivity = :latestActivity,
    requests = :requests,
    ip = :ip,
    prevUrl = :prevUrl,
    customData = :customData,
    created = :created
WHERE id = :id;