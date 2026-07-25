import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Image, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Text, Searchbar, FAB, Card, Badge, Button, Portal, Modal, TextInput, SegmentedButtons, IconButton, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { logout } from '@/services/auth.services';
import { getProducts, createProduct, updateProduct, deleteProduct, Product } from '@/services/products.services';
import { useDebounce } from '@/hooks/useDebounce';

export default function HomeScreen() {
  const router = useRouter();

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
    setErrorMsg('');
    setModalVisible(true);
  };

  // Open modal for editing product
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setCodigo(product.codigo_produto);
    setDescricao(product.descricao_produto);
    setStatus(product.status);
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
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          codigo_produto: codigo,
          descricao_produto: descricao,
          status,
        });
      } else {
        await createProduct({
          codigo_produto: codigo,
          descricao_produto: descricao,
          status,
        });
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
      <Card style={[styles.productCard, !isActive && styles.inactiveCard]} mode="elevated">
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
            <View style={styles.headerRow}>
              <Text variant="labelMedium" style={styles.codeText}>
                CÓD: <Text style={styles.codeValue}>{item.codigo_produto}</Text>
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: isActive ? '#DCFCE7' : '#F1F5F9' },
                ]}
              >
                <Text style={{ color: isActive ? '#15803D' : '#64748B', fontWeight: 'bold', fontSize: 10 }}>
                  {isActive ? '● ATIVO' : '○ INATIVO'}
                </Text>
              </View>
            </View>

            <Text variant="titleMedium" style={styles.descriptionText} numberOfLines={2}>
              {item.descricao_produto}
            </Text>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.editBtn]}
                onPress={() => handleOpenEditModal(item)}
              >
                <Text style={styles.editBtnText}>✏️ Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.deleteBtn]}
                onPress={() => setDeletingProduct(item)}
              >
                <Text style={styles.deleteBtnText}>🗑️ Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerBadge}>
            <Text style={{ fontSize: 18 }}>📦</Text>
          </View>
          <View>
            <Text variant="titleLarge" style={styles.headerTitle}>Catálogo de Produtos</Text>
            <Text variant="bodySmall" style={styles.headerSubtitle}>Painel Móvel de Gestão</Text>
          </View>
        </View>
        <IconButton icon="logout" iconColor="#EF4444" size={22} onPress={handleLogout} />
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

      {/* Search Bar & Filter Tabs */}
      <View style={styles.filterSection}>
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

          <Text style={styles.modalLabel}>Status:</Text>
          <SegmentedButtons
            value={status}
            onValueChange={(val) => setStatus(val as 'ATIVO' | 'INATIVO')}
            buttons={[
              { value: 'ATIVO', label: 'Ativo' },
              { value: 'INATIVO', label: 'Inativo' },
            ]}
            style={styles.modalSegmented}
          />

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
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontWeight: 'bold', color: '#0F172A', fontSize: 18 },
  headerSubtitle: { color: '#64748B', fontSize: 12 },
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
  filterSection: { padding: 16, gap: 12 },
  searchbar: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { fontSize: 14 },
  segmentedBtn: { marginTop: 0 },
  listContainer: { paddingHorizontal: 16, paddingBottom: 90 },
  productCard: { marginBottom: 12, backgroundColor: '#FFFFFF', borderRadius: 16, elevation: 2 },
  inactiveCard: { opacity: 0.75, backgroundColor: '#F8FAFC' },
  cardContent: { flexDirection: 'row', padding: 14, gap: 14 },
  imageContainer: { width: 68, height: 68, borderRadius: 14, overflow: 'hidden', backgroundColor: '#F1F5F9' },
  productImage: { width: '100%', height: '100%' },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: { fontSize: 24 },
  infoContainer: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  codeText: { color: '#64748B', fontSize: 12 },
  codeValue: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontWeight: 'bold', color: '#0F172A' },
  statusBadge: { paddingHorizontal: 8, height: 22, borderRadius: 12, justifyContent: 'center' },
  descriptionText: { color: '#1E293B', fontWeight: '600', fontSize: 14, marginBottom: 10 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  actionBtn: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1 },
  editBtn: { borderColor: '#CBD5E1', backgroundColor: '#F8FAFC' },
  editBtnText: { fontSize: 12, color: '#334155', fontWeight: '600' },
  deleteBtn: { borderColor: '#FECDD3', backgroundColor: '#FEF2F2' },
  deleteBtnText: { fontSize: 12, color: '#E11D48', fontWeight: '600' },
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
});
