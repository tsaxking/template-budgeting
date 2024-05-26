import { Transaction } from "../server/structure/cache/transactions";

const main = async () => {
    const all = (await Transaction.all()).expect('Failed to get all transactions');
    for (const t of all) {
        const pair = all.find(d => {
            return d.amount === t.amount && d.date === t.date && d.type !== t.type && d.status === t.status && d.description === t.description && d.subtypeId === t.subtypeId;
        });
        if (!pair) continue;
        (await t.update({ ...t, transfer: 1 })).expect('Failed to update transaction');
        (await pair.update({ ...pair, transfer: 1 })).expect('Failed to update transaction');
    }
    process.exit(0);
};


main();