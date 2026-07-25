import api from "./api";

export interface Product {
  id: string;
  codigo_produto: string;
  descricao_produto: string;
  status: "ATIVO" | "INATIVO";
  foto_produto?: string | null;
  criado_por?: string | null;
  alterado_por?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListProductsParams {
  search?: string;
  status?: string;
}

export const productService = {
  async getProducts(params?: ListProductsParams): Promise<Product[]> {
    const response = await api.get("/products", { params });
    return response.data;
  },

  async getProductById(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async createProduct(data: {
    codigo_produto: string;
    descricao_produto: string;
    status?: string;
  }): Promise<Product> {
    const response = await api.post("/products", data);
    return response.data;
  },

  async updateProduct(
    id: string,
    data: {
      codigo_produto?: string;
      descricao_produto?: string;
      status?: string;
    }
  ): Promise<Product> {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },

  async uploadFoto(id: string, file: File): Promise<Product> {
    const formData = new FormData();
    formData.append("foto_produto", file);

    const response = await api.patch(`/products/${id}/foto`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
