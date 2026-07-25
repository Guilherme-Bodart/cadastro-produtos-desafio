import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Text } from 'react-native';
import { Searchbar, FAB, Card, SegmentedButtons, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { logout, getCurrentUser } from '@/services/auth.services';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductPhoto,
  Product,
} from '@/services/products.services';
import { useDebounce } from '@/hooks/useDebounce';

import { Header } from '@/components/Header';
import { StatsCards } from '@/components/StatsCards';
import { ProductCard } from '@/components/ProductCard';
import { ProductFormModal } from '@/components/ProductFormModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';

export default function HomeScreen() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal create/edit states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState<'ATIVO' | 'INATIVO'>('ATIVO');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Delete modal state
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch {}
    }
    loadUser();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const filterStatus = statusFilter === 'ALL' ? undefined : statusFilter;
      const data = await getProducts(debouncedSearch, filterStatus);
      setProducts(data);
    } catch (e) {
      console.warn('Erro ao carregar produtos:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [debouncedSearch, statusFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {}
    router.replace('/login');
  };

  // Helper for product image URL
  const getImageUrl = (foto?: string | null) => {
    if (!foto) return null;
    if (foto.startsWith('http')) return foto;
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://cadastro-produtos-desafio.onrender.com';
    return `${baseUrl}/uploads/${foto}`;
  };

  // Open modal for new product
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setCodigo('');
    setDescricao('');
    setStatus('ATIVO');
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMsg('');
    setModalVisible(true);
  };

  // Open modal for editing product
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setCodigo(product.codigo_produto);
    setDescricao(product.descricao_produto);
    setStatus(product.status);
    setSelectedFile(null);
    setPreviewUrl(getImageUrl(product.foto_produto));
    setErrorMsg('');
    setModalVisible(true);
  };

  // Submit create or edit
  const handleSaveProduct = async () => {
    if (!codigo.trim() || !descricao.trim()) {
      setErrorMsg('Preencha o código e a descrição do produto.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      let savedProduct: Product;
      if (editingProduct) {
        savedProduct = await updateProduct(editingProduct.id, {
          codigo_produto: codigo,
          descricao_produto: descricao,
          status,
        });
      } else {
        savedProduct = await createProduct({
          codigo_produto: codigo,
          descricao_produto: descricao,
          status,
        });
      }

      if (selectedFile && savedProduct?.id) {
        await uploadProductPhoto(savedProduct.id, selectedFile);
      }

      setModalVisible(false);
      loadProducts();
    } catch (e: any) {
      setErrorMsg(e.response?.data?.message || e.response?.data?.error || 'Erro ao salvar produto.');
    } finally {
      setSaving(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    setDeleting(true);
    try {
      await deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
      loadProducts();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Erro ao excluir produto.');
    } finally {
      setDeleting(false);
    }
  };

  // Dashboard Stats Calculations
  const totalCount = products.length;
  const ativosCount = products.filter((p) => p.status === 'ATIVO').length;
  const inativosCount = products.filter((p) => p.status === 'INATIVO').length;

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <Header currentUser={currentUser} onLogout={handleLogout} />

      {/* Dashboard Metrics Header */}
      <StatsCards
        totalCount={totalCount}
        ativosCount={ativosCount}
        inativosCount={inativosCount}
      />

      {/* Search Bar & Filter Card Container */}
      <View style={styles.filterSection}>
        <Card style={styles.filterCard} mode="elevated">
          <Card.Content style={styles.filterCardContent}>
            <Searchbar
              placeholder="Buscar por código ou descrição..."
              onChangeText={setSearch}
              value={search}
              style={styles.searchbar}
              inputStyle={styles.searchInput}
              elevation={0}
              icon="magnify"
              clearIcon="close"
            />

            <SegmentedButtons
              value={statusFilter}
              onValueChange={setStatusFilter}
              buttons={[
                { value: 'ALL', label: 'Todos' },
                { value: 'ATIVO', label: 'Ativos' },
                { value: 'INATIVO', label: 'Inativos' },
              ]}
              style={styles.segmentedBtn}
            />
          </Card.Content>
        </Card>
      </View>

      {/* Catalog Header Card */}
      <View style={styles.catalogHeaderCard}>
        <View>
          <Text style={styles.catalogTitle}>Lista de Produtos</Text>
          <Text style={styles.catalogSubtitle}>
            Exibindo {products.length} registro(s) no catálogo
          </Text>
        </View>
        <TouchableOpacity
          style={styles.webAddBtn}
          onPress={handleOpenCreateModal}
          activeOpacity={0.8}
        >
          <Text style={styles.webAddBtnText}>+ Adicionar</Text>
        </TouchableOpacity>
      </View>

      {/* Product List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Buscando produtos...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              getImageUrl={getImageUrl}
              onEdit={handleOpenEditModal}
              onDelete={setDeletingProduct}
            />
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#4F46E5']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>Nenhum produto encontrado</Text>
              <Text style={styles.emptySubtitle}>
                Tente ajustar os termos da busca ou os filtros aplicados.
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button (FAB) */}
      <FAB
        icon="plus"
        label="Novo Produto"
        style={styles.fab}
        color="#FFFFFF"
        onPress={handleOpenCreateModal}
      />

      {/* Form Modal for Creating/Editing Product */}
      <ProductFormModal
        visible={modalVisible}
        editingProduct={editingProduct}
        codigo={codigo}
        setCodigo={setCodigo}
        descricao={descricao}
        setDescricao={setDescricao}
        status={status}
        setStatus={setStatus}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        previewUrl={previewUrl}
        setPreviewUrl={setPreviewUrl}
        saving={saving}
        errorMsg={errorMsg}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveProduct}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        deletingProduct={deletingProduct}
        deleting={deleting}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteProduct}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  filterSection: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  filterCard: { backgroundColor: '#FFFFFF', borderRadius: 16, borderColor: '#E2E8F0', borderWidth: 1, elevation: 1 },
  filterCardContent: { padding: 12, gap: 10 },
  searchbar: { backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { fontSize: 13 },
  segmentedBtn: { marginTop: 0 },
  catalogHeaderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
  },
  catalogTitle: { fontWeight: 'bold', fontSize: 16, color: '#0F172A' },
  catalogSubtitle: { fontSize: 12, color: '#64748B' },
  webAddBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    elevation: 2,
  },
  webAddBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  listContainer: { paddingHorizontal: 16, paddingBottom: 90 },
  loadingContainer: { padding: 40, alignItems: 'center', gap: 12 },
  loadingText: { color: '#64748B', fontSize: 14, fontWeight: '500' },
  emptyContainer: { padding: 40, alignItems: 'center', gap: 8 },
  emptyIcon: { fontSize: 36, marginBottom: 4 },
  emptyTitle: { fontWeight: 'bold', color: '#334155', fontSize: 16 },
  emptySubtitle: { color: '#94A3B8', textAlign: 'center', fontSize: 12 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#4F46E5', borderRadius: 28 },
});
