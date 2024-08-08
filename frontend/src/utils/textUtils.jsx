/* textUtils.jsx */
/* text processing functions */

// Function to tokenize an array of strings into single-word elements
export const tokenizeArray = array => {
  return array
    .map(str => str.split(/\s+/)) // Split each string into words
    .flat(); // Flatten the array of arrays into a single array
};

// Function to truncate text to wordLimit number of words.
export const truncateText = (text, wordLimit) => {
  if (!text) return 'No text available';
  const words = text.split(' ');
  if (words.length <= wordLimit) return text;

  // 30 means that the text is most likely a description to be truncated, should include the ... at the end for styling
  // 10 means text is most likely title to be truncated, should also include ... at the end for styling
  if (wordLimit === 30 || wordLimit === 15) {
    return `${words.slice(0, wordLimit).join(' ')}...`;
  }
  return words.slice(0, wordLimit).join(' ');
};

// Function to remove stopwords from array, also tokenizes string array into single-word elemetns
export const removeStopwordsFromArray = wordArray => {
  const stopwords = [
    'a',
    'an',
    'and',
    'are',
    'as',
    'at',
    'be',
    'by',
    'for',
    'from',
    'has',
    'he',
    'in',
    'is',
    'it',
    'its',
    'of',
    'on',
    'that',
    'the',
    'to',
    'was',
    'were',
    'will',
    'with',
    'change',
  ];

  const removeStopwordsFromPhrase = text => {
    return text
      .split(' ')
      .filter(word => !stopwords.includes(word.toLowerCase()))
      .join(' ');
  };

  const slightlyProcessedWordArray = wordArray.map(phrase =>
    removeStopwordsFromPhrase(phrase),
  );

  const processedWordArray = tokenizeArray(slightlyProcessedWordArray);

  return processedWordArray;
};


// function to render prediction colors by parsing text
export const renderPrediction = (prediction) => {
  const colors = {
    'left-leaning': 'text-[#1E90FF]',
    'right-leaning': 'text-red-500',
    'neutral': 'text-purple-500'
  };

  return prediction.map(([label, score]) => {
    const colorClass = colors[label] || '';
    return (
      <div key={label} className={`${colorClass} mb-1`}>
        {label.replace(/-/g, ' ')}: {score.toFixed(4)}%
      </div>
    );
  });
};

