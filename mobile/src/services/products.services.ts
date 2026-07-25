import api from '@/services/api';

export interface Product {
  id: string;
  codigo_produto: string;
  descricao_produto: string;
  status: 'ATIVO' | 'INATIVO';
  foto_produto?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export async function getProducts(search?: string, status?: string): Promise<Product[]> {
  const params: Record<string, string> = {};
  if (search) params.search = search;
  if (status) params.status = status;
  const response = await api.get('/products', { params });
  return response.data;
}

export async function getProductById(id: string): Promise<Product> {
  const response = await api.get(`/products/${id}`);
  return response.data;
}

export async function createProduct(data: {
  codigo_produto: string;
  descricao_produto: string;
  status?: string;
}): Promise<Product> {
  const response = await api.post('/products', data);
  return response.data;
}

export async function updateProduct(
  id: string,
  data: {
    codigo_produto?: string;
    descricao_produto?: string;
    status?: string;
  }
): Promise<Product> {
  const response = await api.put(`/products/${id}`, data);
  return response.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}

export async function uploadProductPhoto(id: string, file: any): Promise<Product> {
  const formData = new FormData();
  formData.append('foto_produto', file);

  const response = await api.patch(`/products/${id}/foto`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}
