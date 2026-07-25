import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import routes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.use(routes);

app.get('/health', (req, res) => {
  return res.json({ status: 'OK', message: 'Backend iniciado com sucesso!' });
});

app.listen(PORT, () => {
  console.log(`[SERVER] Backend rodando na porta ${PORT}`);
});
