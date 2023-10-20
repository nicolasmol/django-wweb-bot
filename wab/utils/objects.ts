function copyObjectWithReplacements<T>(
  original: T,
  replacements: Partial<T>
): T {
  return {
    ...original,
    ...replacements,
  };
}

function isValidId(id: string): boolean {
  return typeof id === "string" && /^[A-Za-z0-9_]+$/.test(id);
}

export { copyObjectWithReplacements, isValidId };
