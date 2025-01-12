export const stringIncludes = (
  _input: string,
  pool: string[]
): string | null => {
  const input = _input.toLowerCase();
  for (const text of pool) {
    if (input.includes(text)) return text;
  }

  return null;
};
