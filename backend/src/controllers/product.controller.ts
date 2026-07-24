import { Request, Response } from "express";
import {
  CreateProductService,
  ListProductsService,
  FindProductByIdService,
  UpdateProductService,
  DeleteProductService,
  UpdateProductFotoService,
} from "../services/product.services";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { codigo_produto, descricao_produto, status } = req.body;

    if (!codigo_produto || !descricao_produto) {
      return res
        .status(400)
        .json({ error: "Código e descrição do produto são obrigatórios." });
    }

    const product = await CreateProductService({
      codigo_produto,
      descricao_produto,
      status,
      criado_por: req.userId,
    });

    return res.status(201).json(product);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: "Erro ao criar produto." });
  }
};

export const listProducts = async (req: Request, res: Response) => {
  try {
    const { search, status } = req.query;

    const products = await ListProductsService({
      search: search ? String(search) : undefined,
      status: status ? String(status) : undefined,
    });

    return res.json(products);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno ao listar produtos." });
  }
};

export const findProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await FindProductByIdService(id);

    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    return res.json(product);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno ao buscar produto." });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { codigo_produto, descricao_produto, status } = req.body;

    const existingProduct = await FindProductByIdService(id);

    if (!existingProduct) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    const updatedProduct = await UpdateProductService(id, {
      codigo_produto,
      descricao_produto,
      status,
      alterado_por: req.userId,
    });

    return res.json(updatedProduct);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: "Erro ao atualizar produto." });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await FindProductByIdService(id);

    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    await DeleteProductService(id);

    return res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno ao deletar produto." });
  }
};

export const uploadFoto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado." });
    }

    const product = await FindProductByIdService(id);

    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    const updatedProduct = await UpdateProductFotoService(
      id,
      req.file.filename,
    );

    return res.json(updatedProduct);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res
      .status(500)
      .json({ error: "Erro interno ao salvar foto do produto." });
  }
};
