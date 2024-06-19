type B = {
    [key: string]: number;
}

const monthlyExpenses: B = {
    rent: 650,
    food: 200,
    utilities: 50,
    gas: 60
}

const monthlyIncome: B = {
    alizaLessons: 120,
    tylerLessons: 115,
    oliverLessons: 120,
    wyattLessons: 120,
    tarasKidLessons: 80,
    elevate: 2000,
    gigs: 500,
    // boiseJazz: 200
}

const debts: B = {
    parentLoan: 15000,
    payment: -5000,
    erVisit: -500,
    planeTicket: -300,
    healthcare: 230
}

const sellOrExpectedIncome: B = {
    jblSRX815: 900 * 2,
    jblEON615: 300 * 2,
    SQ5: 3000,
    behringer5in: 75 * 2,
    mac2000Lights: 175*4,
    armada: 1000,
    meridianHS: 50,
    // capitalHS: 500
}

const toBuy: B = {
    jblSRX818s: 1000 * 2,
    mackie5in: 200 * 2,
    rcfhd6: 1499 * 8,
    micStands: 190,
    mics: 849,
    nl4Cable500ft: 380,
    nl4Connectors: 25 * 4,
    // qscK8s: 1549,
    // '4K TV': 800 * 2,
}

const total = (b: B): number => Object.values(b).reduce((a, c) => a + c, 0);
const log = (name: string, number: number) => console.log((name + ":").padEnd(20), number);

const haveNow = 3500;
const netMonthly = total(monthlyIncome) - total(monthlyExpenses);
const debt = total(debts);
const sold = total(sellOrExpectedIncome);
const buy = total(toBuy);

const debtTime = (debt - (haveNow + sold)) / netMonthly;

log('Net Monthly:', netMonthly);
log('Remaining Debt', debt - haveNow);
log('Debt paid months', (debt - haveNow) / netMonthly);
log('Sold costs', sold);
log('^ With sold', debtTime);
log('Future pa cost', buy);
log('After sold, future PA time', buy / netMonthly + debtTime);