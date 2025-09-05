import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

app.get('/hus', async (req, res) => {
  const hus = await prisma.hU.findMany();
  res.json(hus);
});

app.post('/hus', async (req, res) => {
  const hu = await prisma.hU.create({ data: req.body });
  res.json(hu);
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
