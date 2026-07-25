"use client";

import { Navbar } from "@/components/Navbar";
import { ProductModal } from "@/components/ProductModal";
import { ProductTable } from "@/components/ProductTable";
import { PublicNotice } from "@/components/PublicNotice";
import { StatsCards } from "@/components/StatsCards";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/auth.services";
import { Product, productService } from "@/services/product.services";
import { Filter, Loader2, Package, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
  const router = useRouter();

  // Estados de Dados
  const [products, setProducts] = useState<Product[]>([]);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");

  // Estado de Autenticação
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Estados do Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Modal de confirmação de exclusão
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Carregar dados iniciais e checar autenticação antes de abrir a tela
  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      checkAuth();
      try {
        setLoading(true);
        const data = await productService.getProducts({
          search: debouncedSearch || undefined,
          status: statusFilter !== "TODOS" ? statusFilter : undefined,
        });
        if (isMounted) {
          setProducts(data);
        }
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitializing(false);
        }
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, statusFilter]);

  const checkAuth = () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("@CadastroProdutos:token");
      const userStr = localStorage.getItem("@CadastroProdutos:user");

      if (token) {
        setIsAuthenticated(true);
        if (userStr) {
          try {
            setCurrentUser(JSON.parse(userStr));
          } catch (e) {
            setCurrentUser(null);
          }
        }
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts({
        search: debouncedSearch || undefined,
        status: statusFilter !== "TODOS" ? statusFilter : undefined,
      });
      setProducts(data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  // Abrir modal para novo produto
  const handleOpenCreateModal = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setEditingProduct(null);
    setModalOpen(true);
  };

  // Abrir modal para editar produto
  const handleOpenEditModal = (product: Product) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setEditingProduct(product);
    setModalOpen(true);
  };

  // Confirmar exclusão de produto
  const handleDeleteProduct = async (id: string) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    try {
      await productService.deleteProduct(id);
      setDeletingId(null);
      loadProducts();
    } catch (err: any) {
      alert(err.response?.data?.error || "Erro ao excluir produto.");
    }
  };

  // Estatísticas
  const totalProdutos = products.length;
  const ativosCount = products.filter((p) => p.status === "ATIVO").length;
  const inativosCount = products.filter((p) => p.status === "INATIVO").length;

  if (initializing) {
    return (
      <div
        suppressHydrationWarning
        className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg animate-pulse">
            <Package className="w-7 h-7" />
          </div>
          <div className="flex items-center gap-2.5 text-slate-700 font-medium text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            <span>Carregando catálogo e autenticação...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-slate-50 flex flex-col"
    >
      <Navbar
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <PublicNotice isAuthenticated={isAuthenticated} />

        <StatsCards
          total={totalProdutos}
          ativos={ativosCount}
          inativos={inativosCount}
        />

        {/* Barra de Pesquisa e Filtro */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por código ou descrição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-2 text-sm text-slate-500 shrink-0">
                <Filter className="w-4 h-4" />
                <span>Status:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium text-slate-700"
              >
                <option value="TODOS">Todos os Status</option>
                <option value="ATIVO">Somente Ativos</option>
                <option value="INATIVO">Somente Inativos</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Produtos */}
        <ProductTable
          products={products}
          loading={loading}
          isAuthenticated={isAuthenticated}
          onOpenCreateModal={handleOpenCreateModal}
          onOpenEditModal={handleOpenEditModal}
          onConfirmDelete={(id) => {
            if (!isAuthenticated) {
              router.push("/login");
            } else {
              setDeletingId(id);
            }
          }}
        />
      </main>

      {/* Modal de Produto*/}
      <ProductModal
        isOpen={modalOpen}
        editingProduct={editingProduct}
        onClose={() => setModalOpen(false)}
        onSaveSuccess={loadProducts}
      />

      {/* Modal de Confirmação de Exclusão */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-sm shadow-2xl">
            <div className="p-6 pb-3">
              <h3 className="text-lg font-semibold text-rose-600 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Confirmar Exclusão
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Tem certeza que deseja excluir este produto? Esta ação não pode
                ser desfeita.
              </p>
            </div>
            <div className="p-6 pt-2 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingId(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteProduct(deletingId)}
              >
                Excluir
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
