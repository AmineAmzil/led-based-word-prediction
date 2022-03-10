const fs = require("fs");
const join = require("path").join;

const file = join(__dirname, "phrases.txt");

const data = fs.readFileSync((path = file), "utf-8");

const notUniqueWords = data
  .split(/\s+/)
  .filter((e) => e !== "")
  .map((e) => e.toLowerCase());

const uniqueWords = [...new Set(notUniqueWords)];

const PHRASES = data
  .split(/(\r\n|\r|\n)/g)
  .map((phrase) => phrase.toLocaleLowerCase().trim())
  .filter((p) => p && p.length > 0);

// console.log("Number of phrases: " + PHRASES.length);
// console.log("Number of unique words: " + uniqueWords.length);
// console.log("Number of not unique words: " + notUniqueWords.length);

const DICTIONARY = uniqueWords.map((word) => `${word} ${data.split(word).length - 1}`).join(" ");

module.exports = { DICTIONARY, PHRASES };
