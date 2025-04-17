const camelToSnake = (obj) => {
  const result = {};
  for (const key in obj) {
    const snakeKey = key.replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`
    );
    result[snakeKey] = obj[key];
  }
  return result;
};

module.exports = camelToSnake;
