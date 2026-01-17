
/**
 * Formats a number or string into Indian Number System format (1,23,456)
 * @param value Number or string to format
 * @returns Formatted string with commas
 */
export const formatIndianNumber = (value: string | number | undefined | null): string => {
    if (value === null || value === undefined || value === '') return '';

    // Remove existing commas and non-numeric characters (except decimal point)
    const cleanValue = value.toString().replace(/[^0-9.]/g, '');

    if (cleanValue === '') return '';

    const parts = cleanValue.split('.');
    const integerPart = parts[0];
    const decimalPart = parts.length > 1 ? '.' + parts[1].substring(0, 2) : '';

    let lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);

    if (otherNumbers !== '') {
        lastThree = ',' + lastThree;
    }

    const res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + decimalPart;
    return res;
};

/**
 * Removes formatting (commas) from a numeric string
 * @param value Formatted string
 * @returns Raw numeric string
 */
export const cleanNumberInput = (value: string): string => {
    if (!value) return '';
    return value.replace(/,/g, '');
};
