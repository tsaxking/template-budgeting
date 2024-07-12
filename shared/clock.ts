import { $Math } from './math';

/**
 * Start time of the application
 * @date 10/12/2023 - 1:50:41 PM
 *
 * @type {*}
 */
const start = Date.now();
/**
 * Returns the uptime of the application
 * @date 10/12/2023 - 1:50:41 PM
 */
export const uptime = () => Date.now() - start;

/**
 * All months as an array of strings
 * @date 10/12/2023 - 1:50:41 PM
 *
 * @type {string[]}
 */
export const months: string[] = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

export const monthsShort: string[] = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sept',
    'Oct',
    'Nov',
    'Dec'
];

/**
 * All days as an array of strings
 * @date 10/12/2023 - 1:50:41 PM
 *
 * @type {string[]}
 */
export const days: string[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
];

export const daysShort: string[] = [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat'
];

/**
 * Gets the current month
 * @date 10/12/2023 - 1:50:41 PM
 */
export const currentMonth = () => months[new Date().getMonth()];
/**
 * Gets the current year
 * @date 10/12/2023 - 1:50:41 PM
 */
export const currentYear = () => new Date().getFullYear();
/**
 * Gets the current day
 * @date 10/12/2023 - 1:50:41 PM
 */
export const currentDay = () => days[new Date().getDay()];

type D = Date | number | string;

/**
 * Curry function that takes a date and returns a string formatted with the date and/or time
 * If no date is passed, it will use the current date
 * @param format A string that will be formatted with the date
 * @returns A function that takes a date and returns a string
 */
export const dateString = (format: string) => {
    return (date: D = new Date()) => {
        const input = date;
        if (typeof date === 'string') {
            if (isNaN(Number(date))) {
                date = new Date(date);
            } else {
                date = new Date(Number(date));
            }
        }
        if (typeof date === 'number') date = new Date(date);

        const DATE = date as Date;
        const data = format
            // year
            .replace(/YYYY/g, DATE.getFullYear()?.toString())
            .replace(/YY/g, DATE.getFullYear()?.toString().slice(-2))
            // month
            .replace(/MMM/g, monthsShort[DATE.getMonth()]?.toString())
            .replace(/MM/g, (DATE.getMonth() + 1)?.toString().padStart(2, '0'))
            .replace(/month/gi, months[DATE.getMonth()]?.toString())
            // day
            .replace(/DDD/g, daysShort[DATE.getDay()]?.toString())
            .replace(/DD/g, DATE.getDate()?.toString().padStart(2, '0'))
            .replace(/day/gi, days[DATE.getDay()]?.toString())
            // time
            .replace(/hh/g, () => {
                const hours = DATE.getHours();
                if (format.includes('AM') || format.includes('PM')) {
                    if (hours === 0) return '12';
                    if (hours > 12) {
                        return (hours - 12)?.toString().padStart(2, '0');
                    }
                }
                return hours?.toString().padStart(2, '0');
            }) // 24 hour
            .replace(/mm/g, DATE.getMinutes()?.toString().padStart(2, '0'))
            .replace(/ss/g, DATE.getSeconds()?.toString().padStart(2, '0'))
            .replace(/ms/g, DATE.getMilliseconds()?.toString().padStart(3, '0'))
            // time no padding
            .replace(
                /h/g,
                DATE.getHours() > 12
                    ? (DATE.getHours() - 12)?.toString()
                    : DATE.getHours()?.toString()
            ) // 12 hour
            .replace(/m/g, DATE.getMinutes()?.toString())
            .replace(/s/g, DATE.getSeconds()?.toString())
            .replace(/ms/g, DATE.getMilliseconds()?.toString())
            // am/pm
            .replace(/am/g, DATE.getHours() >= 12 ? 'pm' : 'am')
            .replace(/AM/g, DATE.getHours() >= 12 ? 'PM' : 'AM')
            .replace(/a.m./g, DATE.getHours() >= 12 ? 'p.m.' : 'a.m.')
            .replace(/A.M./g, DATE.getHours() >= 12 ? 'P.M.' : 'A.M.')
            .replace(/pm/g, DATE.getHours() >= 12 ? 'pm' : 'am')
            .replace(/PM/g, DATE.getHours() >= 12 ? 'PM' : 'AM')
            .replace(/p.m./g, DATE.getHours() >= 12 ? 'p.m.' : 'a.m.')
            .replace(/P.M./g, DATE.getHours() >= 12 ? 'P.M.' : 'A.M.');
        return data;
    };
};

// some common formats
export const time = dateString('h:mm AM');
export const time24 = dateString('hh:mm');
export const date = dateString('MM/DD/YYYY');
export const dateTime = dateString('MM/DD/YYYY hh:mm AM');
export const dateTime24 = dateString('MM/DD/YYYY hh:mm');
export const fullDate = dateString('month DD, YYYY');
export const fullDateTime = dateString('month DD, YYYY hh:mm AM');
export const fullDateTime24 = dateString('month DD, YYYY hh:mm');

const timezoneOffsets = {
    EST: -5, // Eastern Standard Time
    EDT: -4, // Eastern Daylight Time
    CST: -6, // Central Standard Time
    CDT: -5, // Central Daylight Time
    MST: -7, // Mountain Standard Time
    MDT: -6, // Mountain Daylight Time
    PST: -8, // Pacific Standard Time
    PDT: -7, // Pacific Daylight Time
    AKST: -9, // Alaska Standard Time
    AKDT: -8, // Alaska Daylight Time
    HST: -10, // Hawaii Standard Time
    HAST: -10, // Hawaii-Aleutian Standard Time
    HADT: -9, // Hawaii-Aleutian Daylight Time
    SST: -11, // Samoa Standard Time
    SDT: -10, // Samoa Daylight Time
    CHST: 10, // Chamorro Standard Time
    UTC: 0 // Coordinated Universal Time
};

type Timezone = keyof typeof timezoneOffsets;

/**
 * Changes the timezone of a date
 * @param to The timezone to change to
 * @returns A function that takes a date and returns a date with the new timezone
 */
export const changeTimezone = (to: Timezone) => (date: Date) => {
    const offset = timezoneOffsets[to];
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    return new Date(utc + 3600000 * offset);
};

export const segment = (from: Date, to: Date, segments?: number): Date[] => {
    if (from >= to) return [];
    from = new Date(from);
    to = new Date(to);
    const range = to.getTime() - from.getTime();
    if (segments) {
        return Array.from({ length: Math.round(segments) }).map((_, i) => {
            const start = from.getTime() + (range / segments) * i;
            return new Date(start);
        });
    } else {
        let r: number; // custom range
        from.setSeconds(0);
        from.setMilliseconds(0);
        to.setSeconds(0);
        to.setMilliseconds(0);

        switch (true) {
            case range < 1000 * 60 * 60: // less than an hour => 15 minute segments
                from.setMinutes(0);
                to.setMinutes(to.getMinutes() + 1);
                r = to.getTime() - from.getTime();
                return Array.from({ length: r / (1000 * 60 * 15) }).map(
                    (_, i) => {
                        const d = new Date(from.getTime() + 1000 * 60 * 15 * i);
                        d.setSeconds(0);
                        d.setMilliseconds(0);
                        return d;
                    }
                );
            case range < 1000 * 60 * 60 * 24: // less than a day => 1 hour segments
                from.setMinutes(0);
                to.setMinutes(0);
                to.setHours(to.getHours() + 1);
                r = to.getTime() - from.getTime();
                return Array.from({ length: r / (1000 * 60 * 60) }).map(
                    (_, i) => {
                        const d = new Date(from.getTime() + 1000 * 60 * 60 * i);
                        d.setMinutes(0);
                        d.setSeconds(0);
                        d.setMilliseconds(0);
                        return d;
                    }
                );
            case range < 1000 * 60 * 60 * 24 * 7: // less than a week => 12 hour segments
                from.setMinutes(0);
                from.setHours(0);
                to.setMinutes(0);
                to.setHours(12 + Math.floor((to.getHours() - 12) / 12) * 12); // round to nearest 12 hours
                r = to.getTime() - from.getTime();
                return Array.from({ length: r / (1000 * 60 * 60 * 12) }).map(
                    (_, i) => {
                        const d = new Date(
                            from.getTime() + 1000 * 60 * 60 * 12 * i
                        );
                        d.setMinutes(0);
                        d.setSeconds(0);
                        d.setMilliseconds(0);
                        return d;
                    }
                );
            case range < 1000 * 60 * 60 * 24 * 30: // less than a month => 1 day segments
                from.setMinutes(0);
                from.setHours(0);
                from.setDate(1);
                to.setMinutes(0);
                to.setHours(0);
                to.setDate(to.getDate() + 1);
                r = to.getTime() - from.getTime();
                return Array.from({ length: r / (1000 * 60 * 60 * 24) }).map(
                    (_, i) => {
                        const d = new Date(
                            from.getTime() + 1000 * 60 * 60 * 24 * i
                        );
                        d.setMinutes(0);
                        d.setSeconds(0);
                        d.setMilliseconds(0);
                        return d;
                    }
                );
            case range < (1000 * 60 * 60 * 24 * 365) / 2: // less than 6 months => 1 week segments
                from.setMinutes(0);
                from.setHours(0);
                from.setDate(1);
                to.setMinutes(0);
                to.setHours(0);
                to.setDate(
                    to.getDate() + 7 + Math.floor((to.getDate() - 1) / 7) * 7
                );
                r = to.getTime() - from.getTime();
                return Array.from({
                    length: r / (1000 * 60 * 60 * 24 * 7)
                }).map((_, i) => {
                    const d = new Date(
                        from.getTime() + 1000 * 60 * 60 * 24 * 7 * i
                    );
                    d.setMinutes(0);
                    d.setSeconds(0);
                    d.setMilliseconds(0);
                    return d;
                });
            default: // more than 6 months => 1 month segments
                from.setMinutes(0);
                from.setHours(0);
                from.setDate(1);
                from.setMonth(from.getMonth() + 1);
                to.setMinutes(0);
                to.setHours(0);
                to.setDate(1);
                to.setMonth(to.getMonth() + 3);
                r = to.getTime() - from.getTime();
                return Array.from({
                    length: r / (1000 * 60 * 60 * 24 * 30)
                }).map((_, i) => {
                    const d = new Date(
                        from.getTime() + 1000 * 60 * 60 * 24 * 30 * i
                    );
                    d.setMinutes(0);
                    d.setSeconds(0);
                    d.setMilliseconds(0);
                    d.setDate(1);
                    return d;
                });
        }
    }
};
