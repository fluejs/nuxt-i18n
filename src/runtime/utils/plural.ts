export const plural = (num: number, forms: string[]): string => {
    const number = Math.abs(num);

    if (forms.length <= 2) {
        if (Number.isInteger(number)) {
            return number === 1 ? forms[0] : forms[1];
        }

        return forms[1];
    }

    if (Number.isInteger(number)) {
        const cases = [
            2,
            0,
            1,
            1,
            1,
            2,
        ];

        const index = (number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5];
        return forms[index] ?? forms[1];
    }

    return forms[1];
};
