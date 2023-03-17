export function throwError(error: unknown) {
  if (error instanceof Error) {
    throw new Error(`${error.name} ${error.message}`);
  } else {
    throw new Error(`${error}`);
  }
}
