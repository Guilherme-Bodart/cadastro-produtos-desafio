import { Router } from 'express';
import multer from 'multer';
import uploadConfig from '../config/upload';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import {
  createProduct,
  listProducts,
  findProductById,
  updateProduct,
  deleteProduct,
  uploadFoto
} from '../controllers/product.controller';

const productsRoutes = Router();
const upload = multer(uploadConfig);

// Rotas públicas de consulta
productsRoutes.get('/', listProducts);
productsRoutes.get('/:id', findProductById);

// Rotas protegidas (exigem Token JWT e preenchem o req.userId)
productsRoutes.post('/', ensureAuthenticated, createProduct);
productsRoutes.put('/:id', ensureAuthenticated, updateProduct);
productsRoutes.delete('/:id', ensureAuthenticated, deleteProduct);
productsRoutes.patch('/:id/foto', ensureAuthenticated, upload.single('foto_produto'), uploadFoto);

export default productsRoutes;
