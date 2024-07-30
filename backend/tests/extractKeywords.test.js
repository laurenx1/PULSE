const {extractKeywords} = require('../keywordExtract');
const natural = require('natural');
const stopword = require('stopword');

describe('extractKeywords', () => {
  test('should return the top 5 keywords from the title', () => {
    const title = 'The quick brown fox jumps over the lazy dog';
    const keywords = extractKeywords(title);
    expect(keywords).toEqual(['quick', 'brown', 'fox', 'jumps', 'lazy']);
  });

  test('should handle an empty title', () => {
    const title = '';
    const keywords = extractKeywords(title);
    expect(keywords).toEqual([]);
  });

  test('should handle titles with stop words only', () => {
    const title = 'and the or but so';
    const keywords = extractKeywords(title);
    expect(keywords).toEqual(['so']);
  });

  test('should handle titles with punctuation', () => {
    const title = 'Hello, world! Welcome to the test.';
    const keywords = extractKeywords(title);
    expect(keywords).toEqual(['hello', 'world', 'welcome', 'test']);
  });

  test('should return fewer than numKeywords if there are not enough unique words', () => {
    const title = 'one two three';
    const keywords = extractKeywords(title, 5);
    expect(keywords).toEqual(['one', 'two', 'three']);
  });

  test('should return exactly numKeywords if there are enough unique words', () => {
    const title = 'apple banana orange grape lemon';
    const keywords = extractKeywords(title, 3);
    expect(keywords).toEqual(['apple', 'banana', 'orange']);
  });

  test('should ignore case when tokenizing words', () => {
    const title = 'Apple apple BANANA banana';
    const keywords = extractKeywords(title, 2);
    expect(keywords).toEqual(['apple', 'banana']);
  });
});
