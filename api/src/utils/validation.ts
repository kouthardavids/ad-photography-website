export function normalizeSAPhone(input: string): string | null {
    let digits = input.replace(/[\s\-().]/g, "");

    if (digits.startsWith("+27")) digits = "0" + digits.slice(3);
    else if (digits.startsWith("0027")) digits = "0" + digits.slice(4);
    else if (digits.startsWith("27")) digits = "0" + digits.slice(2);

    if (!/^0[1-8]\d{8}$/.test(digits)) return null;

    return "+27" + digits.slice(1);
}

export function isValidEmail(input: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.trim());
}