import _ from 'lodash';

export const isValidJSON = (value: string | undefined) => {
  try {
    JSON.parse(value as string);
    return true;
  } catch (e) {
    return false;
  }
};

export const capitalizeFirstLetter = (text: string): string => {
  return text[0].toUpperCase() + text.slice(1);
};

export const lowerFirstLetter = (text: string): string => {
  return text[0].toLowerCase() + text.slice(1);
};

export const substringWithSpecificLength = (text: string, length: number = 20) => {
  return text?.length > length ? `${text?.substring(0, length - 4)} ...` : text;
};

export const objectToQueryString = (obj: any) => {
  return new URLSearchParams(obj).toString();
};

export const deleteKeyFromObject = (obj: any = {}, keyToDelete: any = '') => {
  return _.omit(obj, keyToDelete);
};

export const removeKeysFromObject = (obj: any, keysToDelete: any[]) => {
  return Object.keys(obj).reduce((acc: any, key) => {
    if (!keysToDelete.includes(key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
};


// contentNumber => Content Number
export const capitalizeEachWordWithSpace = (text: string) => {
  const words = text.match(/[A-Z][a-z]+|[a-z]+/g);

  // Capitalize the first letter of each word
  const capitalizedWords = words?.map((word) => word?.charAt(0)?.toUpperCase() + word?.slice(1));

  // Join the capitalized words with spaces and add the question mark
  return capitalizedWords?.join(' ');
};

export const reorderList = (list: any[], sourceIndex: number, destinationIndex: number) => {
  if (
      sourceIndex < 0 ||
      sourceIndex >= list.length ||
      destinationIndex < 0 ||
      destinationIndex >= list.length
  ) {
    // throw new Error('Invalid source or destination index');
    return;
  }

  const newList = [...list];

  if (sourceIndex === destinationIndex) {
    return newList;
  } else if (Math.abs(sourceIndex - destinationIndex) === 1) {
    [newList[sourceIndex], newList[destinationIndex]] = [
      newList[destinationIndex],
      newList[sourceIndex],
    ];
    return newList;
  }

  const [removed] = newList.splice(sourceIndex, 1);
  newList.splice(destinationIndex < sourceIndex ? destinationIndex : destinationIndex, 0, removed);
  return newList;
};

export const addNewItemToList = (list: any[], index: number, newSection: any) => {
  if (index < 0 || index > list.length) {
    // throw new Error('Invalid index');
    return;
  }

  const newList = [...list];
  newList.splice(index, 0, newSection);

  return newList;
};

export const removeItemFromList = (list: any[], index: number): any[] => {
  if (index < 0 || index >= list.length) {
    // throw new Error('Invalid index');
    return list;
  }

  const newList = [...list];
  newList.splice(index, 1);

  return newList;
};

export const editItemInList = (list: any[], newItem: any, index: number) => {
  if (index < 0 || index >= list.length) {
    // throw new Error('Invalid index');
    return;
  }

  const newList = [...list];
  newList[index] = newItem;

  return newList;
};

export const findObjectFromListOfObjects = (
    list: any[],
    searchedKey: string,
    searchedValue: string,
) => {
  return list.find((object: any) => object?.[searchedKey] === searchedValue);
};

export const removeDuplicatesFromList = (list: string[]) => {
  return Array.from(new Set(list));
};

export const getNestedObjectValue = (obj: any, path: string[]): any => {
  const key = path[0];
  const remainingPath = path.slice(1);
  if (typeof obj === 'object' && obj !== null) {
    if (obj.hasOwnProperty(key)) {
      return getNestedObjectValue(obj[key], remainingPath);
    } else {
      return obj;
    }
  } else {
    return obj;
  }
};

export const wait = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

////////////////////////////////////////////////////////

// recursive functions

// Example usage:
// const deepObject = {
//   a: "targetString1",
//   b: {
//     c: "targetString2",
//     d: ["targetString3", "targetString4"],
//     e: {
//       f: "targetString5",
//       g: "targetString6",
//     }
//   },
//   h: ["targetString7", { i: "targetString8" }]
// };
//
// const stringList = ["targetString1", "targetString5", "nonExistentString"];
// const result = checkStringsInLeafNodesOfObjectWithPaths(deepObject, stringList);

// Output example (paths may vary based on your object structure):
// {
//   targetString1: { exists: true, paths: [['a']] },
//   targetString5: { exists: true, paths: [['b', 'e', 'f']] },
//   nonExistentString: { exists: false, paths: [] }
// }
export const checkStringsInLeafNodesOfObjectWithPaths = (
    obj: any,
    stringList: string[],
): {
  [key: string]: {
    exists: boolean;
    paths: string[];
  };
} => {
  // Helper function to check if a value is an object
  const isObject = (val: any) => val && typeof val === 'object';

  // Create a set for faster lookup
  const stringsToCheck: any = new Set(stringList);
  const foundStrings: any = {};

  // Initialize the foundStrings with empty arrays
  stringList.forEach((str) => {
    foundStrings[str] = [];
  });

  // Helper function to recursively traverse the object
  function traverse(value: any, path: any = []) {
    // If the value is an array, iterate through its elements
    if (Array.isArray(value)) {
      value.forEach((item: any, index: any) => {
        traverse(item, path.concat(index));
      });
      return;
    }

    // If the value is an object, iterate through its properties
    if (isObject(value)) {
      Object.keys(value).forEach((key: any) => {
        traverse(value[key], path.concat(key));
      });
      return;
    }

    // If the value is a leaf node, check if it matches any string in the list
    if (stringsToCheck.has(value)) {
      foundStrings[value].push(path);
    }
  }

  // Start the traversal from the root object
  traverse(obj);

  // Create a result map indicating which strings were found, their paths, and their existence
  const result: any = {};
  for (const str of stringList) {
    result[str] = {
      exists: foundStrings[str].length > 0,
      paths: foundStrings[str],
    };
  }

  return result;
};

////////////////////////////////////////////////////////

// Example usage:
// const deepObject = {
//   a: "targetString1",
//   b: {
//     c: "targetString2",
//     d: ["targetString3", "targetString4"],
//     e: {
//       f: "targetString5",
//       g: "targetString6",
//     }
//   },
//   h: ["targetString7", { i: "targetString8" }]
// };
//
// const pathsList = [
//   ['a'],
//   ['b', 'nonexistent'], // This will result in undefined
//   ['h', 1, 'i']
// ];
//
// const result = getValuesFromPaths(deepObject, pathsList);
// console.log(result); // Output: ['targetString1', 'targetString8']

export const getValuesInObjectFromPaths = (obj: any, pathsList: any) => {
  // Helper function to get value by path
  function getValueByPath(obj: any, path: any) {
    return path.reduce(
        (acc: any, key: any) => (acc && acc[key] !== undefined ? acc[key] : undefined),
        obj,
    );
  }

  // Create an array to store the values
  const values: any = [];

  // Iterate over each path and get the corresponding value
  pathsList.forEach((path: any) => {
    const value = getValueByPath(obj, path);
    if (value !== undefined && value !== null) {
      values.push(value);
    }
  });

  return values;
};

export const getItemsExistInFirstListAndDontExistInSecondOne = (
    list1: any[],
    list2: any[],
    comparisonKey: string,
) => {
  return list1.filter(
      (item1) => !list2.some((item2) => item2?.[comparisonKey] === item1?.[comparisonKey]),
  );
};

export const removeLastCountableItems = (arr: any[], itemsToRemove: number = 1) => {
  // Check if the array length is greater than {itemsToRemove}
  if (arr.length > itemsToRemove) {
    // Remove the last {itemsToRemove} items
    arr.splice(-itemsToRemove);
  } else {
    // If the array has {4} or fewer items, clear the array
    arr.length = 0;
  }
  return arr;
};

export const replaceKey = (obj: any, oldKey: string, newKey: string) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj; // Base case: if it's not an object, return the value
  }

  // Iterate through the object's keys
  for (let key in obj) {
    // Check if the current key matches the old key
    if (key === oldKey) {
      // Assign the value to the new key and delete the old key
      obj[newKey] = obj[key];
      delete obj[key];
    }

    // If the value is an object or array, recurse into it
    if (typeof obj[key] === 'object') {
      replaceKey(obj[key], oldKey, newKey);
    }
  }

  return obj;
};

export const replaceKeysWithValues = (obj: any, mapping: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return obj; // Base case: if it's not an object or array, return the value
  }

  const newObj: any = Array.isArray(obj) ? [] : {}; // Initialize as array or object

  if (Array.isArray(obj)) {
    // If it's an array, map through its elements
    return obj.map(item => replaceKeysWithValues(item, mapping));
  } else {
    // Otherwise, it's an object, so replace its keys
    for (let key in obj) {
      // Get the new key from the mapping, if it exists, otherwise use the original key
      const newKey = mapping[key] || key;

      // Recursively replace keys for nested objects or arrays
      newObj[newKey] = replaceKeysWithValues(obj[key], mapping);
    }
  }

  return newObj;
};

export const replaceKeysAndValues = (obj: any, mapping: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    // If it's a primitive value (not an object or array), check if there's a value replacement
    return mapping[obj] || obj;
  }

  const newObj: any = Array.isArray(obj) ? [] : {}; // Initialize as array or object

  if (Array.isArray(obj)) {
    // If it's an array, map through its elements
    return obj.map(item => replaceKeysAndValues(item, mapping));
  } else {
    // If it's an object, replace its keys and values
    for (let key in obj) {
      // Get the new key from the mapping, if it exists, otherwise use the original key
      const newKey = mapping[key] || key;

      // Recursively replace keys and values for nested objects or arrays
      newObj[newKey] = replaceKeysAndValues(obj[key], mapping);
    }
  }

  return newObj;
};

export const replaceKeysWithValuesWithPaths = (obj: any, mapping: any, path: string = '') => {
  if (typeof obj !== 'object' || obj === null) {
    return obj; // Base case: if it's not an object, return the value
  }
  const result = path.split('.').filter((item) => item !== 'config').join('.');

  const newObj: any = Array.isArray(obj) ? [] : {};

  for (let key in obj) {
    const currentPath = result ? `${result}.${key}` : key;

    // Get the new key from the mapping, if it exists at this path, otherwise use the original key
    const newKey = mapping[currentPath] || key;

    // Recursively replace keys for nested objects or arrays
    newObj[newKey] = replaceKeysWithValuesWithPaths(obj[key], mapping, currentPath);
  }

  return newObj;
};


export const deepCloneObject = (object: any) => {
  return JSON.parse(JSON.stringify(object));
};

export const getLastItemFromList = (list: any[]) => {
  return list.at(-1);
};

export const getLastItemAndRestItemsInSeparateLists = (list: any[]) => {
  const newList = [...list];
  const lastItem = [newList.pop()];

  const allExceptLast = newList;

  return {
    lastItem,
    allExceptLast,
  };
};

export const isLastIndexInList = (array: any[], index: number) => {
  return index === array.length - 1;
};

export function capitalizeFirstLetterWord(text: string) {
  return text
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
}
