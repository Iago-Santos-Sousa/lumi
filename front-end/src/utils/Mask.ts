const CPF = (value: string): string => {
  if (!value) {
    return value;
  }

  const onlyNums = value.replace(/[^\d]/g, "");
  if (onlyNums.length <= 3) {
    return onlyNums;
  }
  if (onlyNums.length <= 6) {
    return onlyNums.slice(0, 3) + "." + onlyNums.slice(3);
  }
  if (onlyNums.length <= 9) {
    return (
      onlyNums.slice(0, 3) +
      "." +
      onlyNums.slice(3, 6) +
      "." +
      onlyNums.slice(6)
    );
  }
  return `${onlyNums.slice(0, 3)}.${onlyNums.slice(3, 6)}.${onlyNums.slice(
    6,
    9,
  )}-${onlyNums.slice(9, 11)}`;
};

export default {
  CPF,
};
