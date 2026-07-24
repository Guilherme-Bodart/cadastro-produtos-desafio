import prisma from "../config/database";

interface ProductData {
  codigo_produto: string;
  descricao_produto: string;
  status?: string;
  criado_por?: string;
  alterado_por?: string;
}

interface ListProductsParams {
  search?: string;
  status?: string;
}

export const CreateProductService = async (data: ProductData) => {
  const existingProduct = await prisma.product.findFirst({
    where: {
      codigo_produto: data.codigo_produto,
    },
  });

  if (existingProduct) {
    throw new Error("Já existe um produto cadastrado com este código.");
  }

  return prisma.product.create({
    data: {
      codigo_produto: data.codigo_produto,
      descricao_produto: data.descricao_produto,
      status: data.status || "ATIVO",
      criado_por: data.criado_por,
    },
  });
};

export const ListProductsService = async (params?: ListProductsParams) => {
  const where: any = {};

  if (
    params?.status &&
    (params.status === "ATIVO" || params.status === "INATIVO")
  ) {
    where.status = params.status;
  }

  if (params?.search) {
    where.OR = [
      { codigo_produto: { contains: params.search } },
      { descricao_produto: { contains: params.search } },
    ];
  }

  return prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
};

export const FindProductByIdService = async (id: string) => {
  return prisma.product.findUnique({ where: { id } });
};

export const UpdateProductService = async (id: string, data: ProductData) => {
  if (data.codigo_produto) {
    const codeCheck = await prisma.product.findFirst({
      where: {
        codigo_produto: data.codigo_produto,
        NOT: { id },
      },
    });

    if (codeCheck) {
      throw new Error("Já existe outro produto cadastrado com este código.");
    }
  }

  return prisma.product.update({
    where: { id },
    data: {
      ...(data.codigo_produto && { codigo_produto: data.codigo_produto }),
      ...(data.descricao_produto && {
        descricao_produto: data.descricao_produto,
      }),
      ...(data.status && { status: data.status }),
      alterado_por: data.alterado_por,
    },
  });
};

export const UpdateProductFotoService = async (
  id: string,
  foto_produto: string,
) => {
  return prisma.product.update({
    where: { id },
    data: { foto_produto },
  });
};

export const DeleteProductService = async (id: string) => {
  return prisma.product.delete({ where: { id } });
};
