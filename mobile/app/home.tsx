import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Image, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Text, Searchbar, FAB, Card, Badge, Button, Portal, Modal, TextInput, SegmentedButtons, IconButton, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { logout, getCurrentUser } from '@/services/auth.services';
import { getProducts, createProduct, updateProduct, deleteProduct, uploadProductPhoto, Product } from '@/services/products.services';
import { useDebounce } from '@/hooks/useDebounce';

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

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch {}
    }
    loadUser();
  }, []);

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
    await logout();
    router.replace('/login');
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

  // Helper for product image URL
  const getImageUrl = (foto?: string | null) => {
    if (!foto) return null;
    if (foto.startsWith('http')) return foto;
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3333';
    return `${baseUrl}/uploads/${foto}`;
  };

  // Dashboard Stats Calculations
  const totalCount = products.length;
  const ativosCount = products.filter((p) => p.status === 'ATIVO').length;
  const inativosCount = products.filter((p) => p.status === 'INATIVO').length;

  const renderProductItem = ({ item }: { item: Product }) => {
    const imageUrl = getImageUrl(item.foto_produto);
    const isActive = item.status === 'ATIVO';

    return (
      <Card
        style={[
          styles.productCard,
          { borderLeftWidth: 5, borderLeftColor: isActive ? '#10B981' : '#CBD5E1' },
          !isActive && styles.inactiveCard,
        ]}
        mode="elevated"
      >
        <Card.Content style={styles.cardContent}>
          {/* Product Image */}
          <View style={styles.imageContainer}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.productImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderIcon}>🖼️</Text>
              </View>
            )}
          </View>

          {/* Product Details */}
          <View style={styles.infoContainer}>
            <Text style={styles.codeValue}>{item.codigo_produto}</Text>
            <Text style={styles.descriptionText} numberOfLines={1}>
              {item.descricao_produto}
            </Text>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isActive ? '#DCFCE7' : '#F1F5F9' },
              ]}
            >
              <Text style={{ color: isActive ? '#15803D' : '#64748B', fontWeight: 'bold', fontSize: 10 }}>
                {isActive ? '● ATIVO' : '● INATIVO'}
              </Text>
            </View>
          </View>

          {/* Square Action Icon Buttons (Matching Web) */}
          <View style={styles.actionSquareGroup}>
            <TouchableOpacity
              style={styles.squareIconBtn}
              onPress={() => handleOpenEditModal(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.squareIconText}>✏️</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.squareIconBtn, styles.squareDeleteBtn]}
              onPress={() => setDeletingProduct(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.squareIconText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header matching Web Navbar 1:1 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerIcon}>📦</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Catálogo de Produtos</Text>
            <Text style={styles.headerSubtitle}>Gerenciador de Inventário</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {currentUser?.name ? (
            <View style={styles.userBadge}>
              <View style={styles.userDot} />
              <Text style={styles.userText} numberOfLines={1}>
                Olá, <Text style={styles.userName}>{currentUser.name}</Text>
              </Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
            <Text style={styles.logoutIcon}>↳</Text>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dashboard Metrics Header */}
      <View style={styles.statsContainer}>
        <Card style={[styles.statCard, { borderLeftColor: '#4F46E5' }]}>
          <Card.Content style={styles.statContent}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statValue}>{totalCount}</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { borderLeftColor: '#22C55E' }]}>
          <Card.Content style={styles.statContent}>
            <Text style={styles.statLabel}>Ativos</Text>
            <Text style={[styles.statValue, { color: '#15803D' }]}>{ativosCount}</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { borderLeftColor: '#EF4444' }]}>
          <Card.Content style={styles.statContent}>
            <Text style={styles.statLabel}>Inativos</Text>
            <Text style={[styles.statValue, { color: '#B91C1C' }]}>{inativosCount}</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Search Bar & Filter Card Container (Matching Web) */}
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

      {/* Catalog Table Header Card (Matching Web 1:1) */}
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
          renderItem={renderProductItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#4F46E5']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text variant="titleMedium" style={styles.emptyTitle}>Nenhum produto encontrado</Text>
              <Text variant="bodySmall" style={styles.emptySubtitle}>
                Tente ajustar os termos da busca ou os filtros aplicados.
              </Text>
            </View>
          }
        />
      )}

      {/* FAB for new product */}
      <FAB
        icon="plus"
        label="Novo Produto"
        style={styles.fab}
        color="#FFFFFF"
        onPress={handleOpenCreateModal}
      />

      {/* Modal for Creating / Editing Product */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </Text>
            <IconButton icon="close" size={20} onPress={() => setModalVisible(false)} />
          </View>

          {errorMsg ? (
            <View style={styles.modalErrorBox}>
              <Text style={styles.modalErrorText}>⚠️ {errorMsg}</Text>
            </View>
          ) : null}

          <TextInput
            label="Código do Produto *"
            value={codigo}
            onChangeText={setCodigo}
            mode="outlined"
            outlineColor="#E2E8F0"
            activeOutlineColor="#4F46E5"
            style={styles.modalInput}
          />

          <TextInput
            label="Descrição do Produto *"
            value={descricao}
            onChangeText={setDescricao}
            multiline
            numberOfLines={3}
            mode="outlined"
            outlineColor="#E2E8F0"
            activeOutlineColor="#4F46E5"
            style={styles.modalInput}
          />

          {/* Upload de Foto no Modal */}
          <Text style={styles.modalLabel}>Foto do Produto (Opcional):</Text>
          <View style={styles.photoUploadBox}>
            {previewUrl ? (
              <View style={styles.previewWrapper}>
                <Image source={{ uri: previewUrl }} style={styles.previewImg} />
                <TouchableOpacity
                  style={styles.removePhotoBadge}
                  onPress={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                >
                  <Text style={styles.removePhotoText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.placeholderBox}>
                <Text style={{ fontSize: 24 }}>🖼️</Text>
              </View>
            )}

            <View style={styles.uploadControls}>
              {Platform.OS === 'web' ? (
                <input
                  type="file"
                  accept="image/*"
                  id="mobile-photo-picker"
                  style={{ display: 'none' }}
                  onChange={(e: any) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                      setPreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                />
              ) : null}

              <TouchableOpacity
                style={styles.selectPhotoBtn}
                onPress={() => {
                  if (Platform.OS === 'web' && typeof document !== 'undefined') {
                    const el = document.getElementById('mobile-photo-picker');
                    if (el) el.click();
                  }
                }}
              >
                <Text style={styles.selectPhotoText}>
                  {selectedFile ? '📷 Trocar Imagem' : '📷 Selecionar Imagem'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.photoHintText}>PNG, JPG ou WEBP de até 5MB</Text>
            </View>
          </View>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setModalVisible(false)}
              disabled={saving}
              style={{ borderRadius: 10, borderColor: '#CBD5E1' }}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleSaveProduct}
              loading={saving}
              disabled={saving}
              style={{ backgroundColor: '#4F46E5', borderRadius: 10 }}
            >
              {editingProduct ? 'Atualizar' : 'Salvar'}
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Delete Confirmation Modal */}
      <Portal>
        <Modal
          visible={!!deletingProduct}
          onDismiss={() => setDeletingProduct(null)}
          contentContainerStyle={styles.deleteModalContainer}
        >
          <Text variant="titleMedium" style={styles.deleteTitle}>🗑️ Confirmar Exclusão</Text>
          <Text style={styles.deleteText}>
            Tem certeza que deseja excluir o produto{' '}
            <Text style={{ fontWeight: 'bold', color: '#0F172A' }}>
              "{deletingProduct?.descricao_produto}"
            </Text>
            ? Esta ação não pode ser desfeita.
          </Text>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setDeletingProduct(null)}
              disabled={deleting}
              style={{ borderRadius: 10 }}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleDeleteProduct}
              loading={deleting}
              disabled={deleting}
              buttonColor="#EF4444"
              style={{ borderRadius: 10 }}
            >
              Excluir
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  headerIcon: { fontSize: 20 },
  headerTitle: { fontWeight: 'bold', color: '#0F172A', fontSize: 16, lineHeight: 20 },
  headerSubtitle: { color: '#64748B', fontSize: 12 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  userDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  userText: { fontSize: 12, color: '#475569' },
  userName: { fontWeight: 'bold', color: '#0F172A' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutIcon: { fontSize: 13, color: '#475569' },
  logoutText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 2,
  },
  statContent: { paddingVertical: 12, paddingHorizontal: 10 },
  statLabel: { fontSize: 11, color: '#64748B', fontWeight: '600', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginTop: 2 },
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
  productCard: { marginBottom: 10, backgroundColor: '#FFFFFF', borderRadius: 16, elevation: 1 },
  inactiveCard: { opacity: 0.75, backgroundColor: '#F8FAFC' },
  cardContent: { flexDirection: 'row', padding: 12, alignItems: 'center', gap: 12 },
  imageContainer: { width: 60, height: 60, borderRadius: 12, overflow: 'hidden', backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  productImage: { width: '100%', height: '100%' },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: { fontSize: 22 },
  infoContainer: { flex: 1, justifyContent: 'center', gap: 2 },
  codeValue: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontWeight: 'bold', color: '#0F172A', fontSize: 13 },
  descriptionText: { color: '#1E293B', fontWeight: 'bold', fontSize: 14 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, alignSelf: 'flex-start', marginTop: 4 },
  actionSquareGroup: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  squareIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  squareDeleteBtn: { borderColor: '#FECDD3', backgroundColor: '#FFF5F5' },
  squareIconText: { fontSize: 14 },
  loadingContainer: { padding: 40, alignItems: 'center', gap: 12 },
  loadingText: { color: '#64748B', fontSize: 14, fontWeight: '500' },
  emptyContainer: { padding: 40, alignItems: 'center', gap: 8 },
  emptyIcon: { fontSize: 36, marginBottom: 4 },
  emptyTitle: { fontWeight: 'bold', color: '#334155' },
  emptySubtitle: { color: '#94A3B8', textAlign: 'center' },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#4F46E5', borderRadius: 28 },
  modalContainer: { backgroundColor: 'white', padding: 24, margin: 20, borderRadius: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontWeight: 'bold', color: '#0F172A' },
  modalInput: { marginBottom: 14, backgroundColor: '#FFFFFF' },
  modalLabel: { marginBottom: 8, color: '#475569', fontWeight: '600', fontSize: 13 },
  modalSegmented: { marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 10 },
  modalErrorBox: { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5', borderWidth: 1, padding: 10, borderRadius: 10, marginBottom: 12 },
  modalErrorText: { color: '#B91C1C', fontSize: 12 },
  deleteModalContainer: { backgroundColor: 'white', padding: 24, margin: 20, borderRadius: 20 },
  deleteTitle: { fontWeight: 'bold', color: '#E11D48', marginBottom: 12 },
  deleteText: { color: '#475569', fontSize: 14, marginBottom: 20, lineHeight: 20 },
  photoUploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    marginBottom: 16,
    gap: 12,
  },
  previewWrapper: { width: 72, height: 72, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  previewImg: { width: '100%', height: '100%' },
  removePhotoBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#E11D48',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },
  placeholderBox: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  uploadControls: { flex: 1, gap: 4 },
  selectPhotoBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  selectPhotoText: { fontSize: 12, fontWeight: '600', color: '#334155' },
  photoHintText: { fontSize: 11, color: '#94A3B8' },
});
