const isEmpty = (obj: unknown) =>
  [Object, Array].includes((obj as any)?.constructor) &&
  !Object.entries(obj || {}).length;

export { isEmpty };
