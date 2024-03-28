import Account from '../server/structure/accounts';

(async () => {
    const [username] = process.argv;

    const a = await Account.fromUsername(username);

    if (!a) throw new Error('Account not found');

    const status = a?.verify();

    console.log(username + "'s", 'verification status:', status);

    process.exit(status == 'verified' ? 0 : 1);
})();
