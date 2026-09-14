import axios from '../api/axios';
import type { Product } from '../types/product';

export interface CreateProductData {
  name: string;
  price: number;
  stock?: number;
}

export const getProducts = async (): Promise<Product[]> => {
  const response = await axios.get('/products');

  return response.data.data ?? response.data;
};

export const getProduct = async (
  id: number
): Promise<Product> => {
  const response = await axios.get(`/products/${id}`);

  return response.data.data ?? response.data;
};

export const createProduct = async (
  data: CreateProductData
): Promise<Product> => {
  const response = await axios.post('/products', data);

  return response.data.data ?? response.data;
};

export const updateProduct = async (
  id: number,
  data: CreateProductData
): Promise<Product> => {
  const response = await axios.put(
    `/products/${id}`,
    data
  );

  return response.data.data ?? response.data;
};

export const deleteProduct = async (
  id: number
): Promise<void> => {
  await axios.delete(`/products/${id}`);
};