const axios = require('axios');
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

jest.mock('../scraper', () => ({
  scrapeArticle: jest.fn(),
}));

jest.mock('../recommendUtils', () => ({
  getAllPreferredTopics: jest.fn(),
  generateFrequencyDictionary: jest.fn(),
  findSimilarUsers: jest.fn(),
  recommendArticles: jest.fn(),
}));

const { scrapeArticle } = require('../scraper');
const {
  getAllPreferredTopics,
  generateFrequencyDictionary,
  findSimilarUsers,
  recommendArticles
} = require('../recommendUtils');

const { fetchAndStoreArticles, fetchAndCacheArticlesByTopics } = require('../index');

jest.mock('axios');
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => {
      return {
        article: {
          upsert: jest.fn(),
        },
      };
    }),
  };
});

describe('fetchAndCacheArticlesByTopics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch articles, scrape content, and upsert articles', async () => {
    const mockArticles = [
      {
        title: 'Test Article 1',
        description: 'Description 1',
        creator: ['Author 1'],
        link: 'http://example.com/1',
        keywords: ['test'],
        pubDate: '2024-07-25',
      },
    ];

    axios.get.mockResolvedValue({
      data: {
        results: mockArticles,
      },
    });

    scrapeArticle.mockResolvedValue('Scraped content');
    getAllPreferredTopics.mockResolvedValue(['test']);
    generateFrequencyDictionary.mockReturnValue({ test: 1 });
    findSimilarUsers.mockResolvedValue([]);
    recommendArticles.mockResolvedValue([]);

    await fetchAndCacheArticlesByTopics(['test']);

    expect(axios.get).toHaveBeenCalledWith('https://newsdata.io/api/1/latest?', {
      params: {
        apikey: process.env.NEWS_API_KEY,
        q: 'test',
        country: 'us',
      },
    });

    expect(scrapeArticle).toHaveBeenCalledWith('http://example.com/1');

    expect(prisma.article.upsert).toHaveBeenCalledWith({
      where: { title: 'Test Article 1' },
      update: {},
      create: {
        title: 'Test Article 1',
        description: 'Description 1',
        author: ['Author 1'],
        url: 'http://example.com/1',
        keywords: ['test'],
        publishedAt: new Date('2024-07-25'),
        content: 'Scraped content',
      },
    });
  });

  it('should handle errors gracefully', async () => {
    axios.get.mockRejectedValue(new Error('API error'));

    await expect(fetchAndCacheArticlesByTopics(['test'])).resolves.not.toThrow();

    expect(prisma.article.upsert).not.toHaveBeenCalled();
  });
});
