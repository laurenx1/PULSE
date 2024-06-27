import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import express from 'express';
const prisma = new PrismaClient();


export const hashPassword = async (req, res) => {

  if (req.body && req.body.password) {
    try {
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      req.body.password = hashedPassword;
  } catch (error) {
    console.error(`Error hashing password: ${error.message}`)
  }
    }
};


export const checkPassword = async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // find user by username 
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  
  // check if password matches
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  // if password matches, return user data
  return res.json(user);
}


