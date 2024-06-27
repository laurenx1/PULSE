import { hashPassword, checkPassword } from './middleware';

const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT || 3000;


app.use(express);
app.use(hashPassword);

app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.post('/users', hashPassword, async (req, res) => {
    const user = await prisma.user.create({ data: req.body });
    res.json(user);
  });


// POST request to server with login credentials in request body
app.post('/login', checkPassword);