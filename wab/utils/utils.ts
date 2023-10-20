function generateRandomLetters(length: number) {
  let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";

  for (let i = 0; i < length; i++) {
    let randomIndex = Math.floor(Math.random() * letters.length);
    result += letters.charAt(randomIndex);
  }

  return result;
}

export { generateRandomLetters };
