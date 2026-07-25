import { Product } from "@/services/product.services";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Package, Plus, Image as ImageIcon, Edit2, Trash2, Loader2 } from "lucide-react";

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  isAuthenticated: boolean;
  onOpenCreateModal: () => void;
  onOpenEditModal: (product: Product) => void;
  onConfirmDelete: (id: string) => void;
}

export function ProductTable({
  products,
  loading,
  isAuthenticated,
  onOpenCreateModal,
  onOpenEditModal,
  onConfirmDelete,
}: ProductTableProps) {
  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-200/80 px-6 py-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Lista de Produtos</CardTitle>
          <CardDescription>
            Exibindo {products.length} registro(s) no catálogo
          </CardDescription>
        </div>
        {isAuthenticated && (
          <Button size="sm" onClick={onOpenCreateModal} className="gap-2">
            <Plus className="w-4 h-4" />
            <span>Adicionar</span>
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm">Carregando produtos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
            <Package className="w-12 h-12 stroke-[1.5]" />
            <p className="text-base font-semibold text-slate-700">
              Nenhum produto encontrado
            </p>
            <p className="text-sm text-slate-500">
              Tente ajustar a busca ou adicionar um novo produto.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200/80 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3.5">Foto</th>
                  <th className="px-6 py-3.5">Código</th>
                  <th className="px-6 py-3.5">Descrição</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {products.map((product) => {
                  const isActive = product.status === "ATIVO";

                  return (
                    <tr
                      key={product.id}
                      className={`transition-all duration-150 ${
                        isActive
                          ? "bg-white hover:bg-slate-50/80 border-l-4 border-l-emerald-500"
                          : "bg-slate-100/60 opacity-65 hover:opacity-100 border-l-4 border-l-slate-300"
                      }`}
                    >
                      {/* Foto Maior (w-16 h-16) */}
                      <td className="px-6 py-3.5">
                        {product.foto_produto ? (
                          <img
                            src={
                              product.foto_produto.startsWith("http") || product.foto_produto.startsWith("data:")
                                ? product.foto_produto
                                : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"}/uploads/${product.foto_produto}`
                            }
                            alt={product.descricao_produto}
                            className="w-16 h-16 object-cover rounded-xl border border-slate-200/90 shadow-xs"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                            <ImageIcon className="w-7 h-7" />
                          </div>
                        )}
                      </td>

                      {/* Código */}
                      <td
                        className={`px-6 py-3.5 font-mono ${
                          isActive
                            ? "font-bold text-slate-900"
                            : "font-medium text-slate-500"
                        }`}
                      >
                        {product.codigo_produto}
                      </td>

                      {/* Descrição */}
                      <td
                        className={`px-6 py-3.5 max-w-xs truncate ${
                          isActive
                            ? "font-semibold text-slate-900 text-base"
                            : "font-medium text-slate-500 text-sm"
                        }`}
                      >
                        {product.descricao_produto}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-3.5">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300/80 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            ATIVO
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-200/70 text-slate-600 border border-slate-300/60">
                            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                            INATIVO
                          </span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenEditModal(product)}
                            className="h-9 w-9 p-0 bg-white"
                            title={
                              isAuthenticated
                                ? "Editar Produto"
                                : "Login necessário para editar"
                            }
                          >
                            <Edit2 className="w-4 h-4 text-slate-600" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onConfirmDelete(product.id)}
                            className="h-9 w-9 p-0 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600"
                            title={
                              isAuthenticated
                                ? "Excluir Produto"
                                : "Login necessário para excluir"
                            }
                          >
                            <Trash2 className="w-4 h-4 text-slate-600 hover:text-rose-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
