/* manualScraping.js */
/* This script processes articles with empty content fields by scraping and updating them. */

// Utility function to implement retry logic
const retry = async (fn, retries = 3, delay = 1000) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === retries - 1) {
        throw error; // Rethrow if the final attempt fails
      }
      console.error(`Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Function to fetch articles with empty content
const fetchArticlesWithEmptyContent = async (offset, limit) => {
  try {
    return await prisma.article.findMany({
      where: {
        content: {
          equals: [],
        },
      },
      skip: offset,
      take: limit,
    });
  } catch (error) {
    console.error('Error fetching articles with empty content:', error);
    throw error;
  }
};

// Function to update content for a single article
const updateArticleContent = async article => {
  try {
    const formattedContent = await scrapeArticle(article.url); // Scrape and clean content

    // Retry updating article content with up to 3 attempts
    await retry(
      () =>
        prisma.article.update({
          where: {id: article.id},
          data: {
            content: formattedContent, // Ensure content is an array of strings
          },
        }),
      3,
      2000,
    ); // 3 retries with 2-second delay between retries

    console.log(`Updated content for article ID ${article.id}`);
  } catch (error) {
    console.error(`Error updating content for article ID ${article.id}:`, error);
  }
};

const BATCH_SIZE = 100;

const updateAllArticlesContent = async () => {
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    try {
      const articles = await fetchArticlesWithEmptyContent(offset, BATCH_SIZE);

      if (articles.length === 0) {
        hasMore = false;
        console.log('No more articles to process.');
        break;
      }

      console.log(`Processing ${articles.length} articles with empty content.`);

      // Process articles concurrently
      await Promise.all(articles.map(article => updateArticleContent(article)));

      offset += BATCH_SIZE;
    } catch (error) {
      console.error('Error during batch processing:', error);
      hasMore = false; // Exit loop on error
    }
  }

  console.log('All articles processed successfully.');
};

updateAllArticlesContent();
