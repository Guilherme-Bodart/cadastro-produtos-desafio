"use client";

import { useState, useEffect } from "react";
import { productService, Product } from "@/services/product.services";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Image as ImageIcon, Upload, ShieldAlert, Loader2 } from "lucide-react";

interface ProductModalProps {
  isOpen: boolean;
  editingProduct: Product | null;
  onClose: () => void;
  onSaveSuccess: () => void;
}

export function ProductModal({
  isOpen,
  editingProduct,
  onClose,
  onSaveSuccess,
}: ProductModalProps) {
  // Estado local do Formulário
  const [codigoProduto, setCodigoProduto] = useState("");
  const [descricaoProduto, setDescricaoProduto] = useState("");
  const [status, setStatus] = useState<"ATIVO" | "INATIVO">("ATIVO");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Sincronizar estado local quando o modal abre ou altera o produto
  useEffect(() => {
    if (isOpen) {
      setFormError("");
      setSelectedFile(null);

      if (editingProduct) {
        setCodigoProduto(editingProduct.codigo_produto);
        setDescricaoProduto(editingProduct.descricao_produto);
        setStatus(editingProduct.status);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
        setPreviewUrl(
          editingProduct.foto_produto
            ? editingProduct.foto_produto.startsWith("http") || editingProduct.foto_produto.startsWith("data:")
              ? editingProduct.foto_produto
              : `${apiUrl}/uploads/${editingProduct.foto_produto}`
            : null
        );
      } else {
        setCodigoProduto("");
        setDescricaoProduto("");
        setStatus("ATIVO");
        setPreviewUrl(null);
      }
    }
  }, [isOpen, editingProduct]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setLoading(true);

    try {
      let savedProduct: Product;

      if (editingProduct) {
        savedProduct = await productService.updateProduct(editingProduct.id, {
          codigo_produto: codigoProduto,
          descricao_produto: descricaoProduto,
          status,
        });
      } else {
        savedProduct = await productService.createProduct({
          codigo_produto: codigoProduto,
          descricao_produto: descricaoProduto,
          status,
        });
      }

      // Se houver arquivo selecionado, realiza o upload da foto
      if (selectedFile && savedProduct.id) {
        await productService.uploadFoto(savedProduct.id, selectedFile);
      }

      onSaveSuccess();
      onClose();
    } catch (err: any) {
      setFormError(
        err.response?.data?.error || "Erro ao salvar produto. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <CardTitle className="text-xl">
              {editingProduct ? "Editar Produto" : "Cadastrar Novo Produto"}
            </CardTitle>
            <CardDescription>
              {editingProduct
                ? "Atualize as informações textuais ou foto do produto"
                : "Preencha os campos para inserir no inventário"}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {formError && (
              <div className="flex items-center gap-2 p-3 text-sm rounded-lg bg-red-50 text-red-700 border border-red-200">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="codigo">Código do Produto *</Label>
              <Input
                id="codigo"
                placeholder="Ex: PROD-001"
                required
                value={codigoProduto}
                onChange={(e) => setCodigoProduto(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição / Nome do Produto *</Label>
              <Input
                id="descricao"
                placeholder="Ex: Teclado Mecânico RGB"
                required
                value={descricaoProduto}
                onChange={(e) => setDescricaoProduto(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status do Produto</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as "ATIVO" | "INATIVO")}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ATIVO">ATIVO</option>
                <option value="INATIVO">INATIVO</option>
              </select>
            </div>

            {/* Upload de Foto com Preview */}
            <div className="space-y-2">
              <Label>Foto do Produto (Opcional)</Label>
              <div className="flex items-center gap-4 p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50/50">
                {previewUrl ? (
                  <div className="relative w-24 h-24 shrink-0">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-xl border border-slate-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={handleClearFile}
                      className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 shadow-md hover:bg-rose-700 transition-colors"
                      title="Remover Imagem"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-xl border border-slate-200 bg-white flex flex-col items-center justify-center text-slate-400 shrink-0 shadow-2xs">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}

                <div className="flex-1 space-y-1">
                  <input
                    id="foto-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="foto-upload"
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 shadow-xs cursor-pointer hover:bg-slate-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{selectedFile ? "Trocar Imagem" : "Selecionar Imagem"}</span>
                  </label>
                  <p className="text-xs text-slate-400">PNG, JPG ou WEBP de até 5MB</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : editingProduct ? (
                  "Atualizar Produto"
                ) : (
                  "Cadastrar Produto"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
