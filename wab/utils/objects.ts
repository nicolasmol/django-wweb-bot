/**
 * Returns a copy of the original object with the replacements applied.
 * @param original The original object.
 * @param replacements The replacements.
 */
function copyObjectWithReplacements<T>(
  original: T,
  replacements: Partial<T>
): T {
  return {
    ...original,
    ...replacements,
  };
}

/**
 * Returns the nested object.
 * @param obj The object.
 * @param pathArr The path array.
 * @returns The nested object.
 */
function getNestedObject(obj: { [x: string]: any }, pathArr: any[]) {
  for (const element of pathArr) {
    if (!obj[element]) obj[element] = {};
    obj = obj[element];
  }
  return obj;
}

export { copyObjectWithReplacements, getNestedObject };
