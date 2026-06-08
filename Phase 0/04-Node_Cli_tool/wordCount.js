const fs = require('fs');
const path = require('path');

const filePath  = path.join(__dirname, process.argv[2]);

if (!filePath) {
    console.error('Please provide a file path as an argument.');
    process.exit(1);
}

const text = fs.readFileSync(path.resolve(filePath), 'utf-8');
const words = text.toLowerCase().split(/[^a-z]+/).filter(Boolean);

const wordCount = {};

words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
});

console.log(wordCount);

Object.entries(wordCount).sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([word, count]) => {
    console.log(`${word}: ${count}`);
});

