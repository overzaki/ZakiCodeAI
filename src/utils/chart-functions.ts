export function dateToString(_id: { day?: number; month?: number; year?: number }): string {
    const {day, month, year} = _id;

    // Use fallback values or empty strings if the attributes don't exist
    const dayStr = day ? String(day).padStart(2, '0') : '';
    const monthStr = month ? String(month).padStart(2, '0') : '';
    const yearStr = year ? String(year) : '';

    // Construct the string based on the available values
    let dateString = '';

    if (dayStr && monthStr && yearStr) {
        dateString = `${dayStr}-${monthStr}-${yearStr}`;
    } else if (monthStr && yearStr) {
        dateString = `${monthStr}-${yearStr}`;
    } else if (yearStr) {
        dateString = yearStr;
    }

    return dateString;
}
