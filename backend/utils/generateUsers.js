const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

const NUM_USERS = 100; // Number of fake users to create
const NUM_ARTICLES = 5000; // Number of articles in the database
const MAX_LIKES = 10; // Maximum number of likes per user
const MAX_SAVES = 10; // Maximum number of saves per user
const TOPIC_LIST = ['Technology', 'Health', 'Science', 'Sports', 'Entertainment', 'Artificial Intelligence', 'Soccer', 'Music', 'Finance', 'China', 'Fitness', 'Innovation', 'Fashion', 'US Politics', 'Relationships and Dating', 'Cryptocurrency', 'Mental Health']; // List of topics

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateRandomArray = (array, maxLength) => {
    const length = getRandomInt(1, maxLength);
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, length);
};

const generateRandomString = (length) => {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
};

const createFakeUser = async () => {
    const user = {
        email: `${generateRandomString(8)}@example.com`,
        username: `user${getRandomInt(1000, 9999)}`,
        password: generateRandomString(12),
        picture: `https://randomuser.me/api/portraits/men/${getRandomInt(1, 99)}.jpg`,
        lastAsked: `Question ${getRandomInt(1, 100)}`,
        lastAskedKeywords: generateRandomArray(['politics', 'technology', 'health', 'sports', 'science'], 5),
        liked: generateRandomArray(Array.from({ length: NUM_ARTICLES }, (_, i) => i + 1), MAX_LIKES),
        saved: generateRandomArray(Array.from({ length: NUM_ARTICLES }, (_, i) => i + 1), MAX_SAVES),
        preferredTopics: generateRandomArray(TOPIC_LIST, 3),
    };

    await prisma.user.create({ data: user });
};

const generateUsers = async () => {
    console.log(`Generating ${NUM_USERS} fake users...`);
    for (let i = 0; i < NUM_USERS; i++) {
        await createFakeUser();
    }
    console.log('Fake users created successfully.');
};

generateUsers()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
