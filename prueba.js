function rangeOfNumbers(startNum, endNum) {
  if (startNum > endNum) {
    return [];
  } else {
    const result = rangeOfNumbers(startNum + 1, endNum);
    result.unshift(startNum);

    return result;
  }
}

console.log(rangeOfNumbers(9, 9));
