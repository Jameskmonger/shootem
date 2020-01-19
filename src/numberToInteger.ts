export const numberToInteger = (value: number) => {
  if (value < 0) {
    return Math.ceil(value);
  }

  return Math.floor(value);
};
