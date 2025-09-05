/* eslint-disable */
// ----------------------------------------------------------------------

export default function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export function isUUID(str: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}

export function findUUIDsInObject(obj: any, uuids: string[] = []): string[] {
    if (typeof obj === 'string') {
        // If it's a string, check if it's a UUID
        if (isUUID(obj)) {
            uuids.push(obj); // Add to the list if it's a valid UUID
        }
    } else if (Array.isArray(obj)) {
        // If it's an array, iterate through each element
        for (const item of obj) {
            findUUIDsInObject(item, uuids);
        }
    } else if (typeof obj === 'object' && obj !== null) {
        // If it's an object, iterate through each key-value pair
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                findUUIDsInObject(obj[key], uuids);
            }
        }
    }

    return uuids; // Return the collected UUIDs
}

export function countUUIDsInObject(obj: any, uuidCounts: Record<string, number> = {}): Record<string, number> {
    if (typeof obj === 'string') {
        // If it's a string, check if it's a UUID
        if (isUUID(obj)) {
            // Increment the count for the UUID
            uuidCounts[obj] = (uuidCounts[obj] || 0) + 1;
        }
    } else if (Array.isArray(obj)) {
        // If it's an array, iterate through each element
        for (const item of obj) {
            countUUIDsInObject(item, uuidCounts);
        }
    } else if (typeof obj === 'object' && obj !== null) {
        // If it's an object, iterate through each key-value pair
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                countUUIDsInObject(obj[key], uuidCounts);
            }
        }
    }

    return uuidCounts; // Return the object containing UUID counts
}
