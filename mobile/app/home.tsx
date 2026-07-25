import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { Text, Searchbar, FAB, Card, Badge, Button, Portal, Modal, TextInput, SegmentedButtons, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { logout } from '@/services/auth.services';
import { getProducts, createProduct, Product } from '@/services/products.services';

export default function HomeScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // New product modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState<'ATIVO' | 'INATIVO'>('ATIVO');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadProducts = async () => {
    setLoading(true);
    try {
      const filterStatus = statusFilter === 'ALL' ? undefined : statusFilter;
      const data = await getProducts(search, filterStatus);
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
  }, [search, statusFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const handleCreateProduct = async () => {
    if (!codigo || !descricao) {
      setErrorMsg('Preencha o código e a descrição do produto');
      return;
    }
    setSaving(true);
    setErrorMsg('');
    try {
      await createProduct({
        codigo_produto: codigo,
        descricao_produto: descricao,
        status,
      });
      setModalVisible(false);
      setCodigo('');
      setDescricao('');
      setStatus('ATIVO');
      loadProducts();
    } catch (e: any) {
      setErrorMsg(e.response?.data?.message || 'Erro ao cadastrar produto');
    } finally {
      setSaving(false);
    }
  };

  const getImageUrl = (foto?: string | null) => {
    if (!foto) return null;
    if (foto.startsWith('http')) return foto;
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3333';
    return `${baseUrl}/uploads/${foto}`;
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const imageUrl = getImageUrl(item.foto_produto);

    return (
      <Card style={styles.productCard} mode="elevated">
        <Card.Content style={styles.cardContent}>
          <View style={styles.imageContainer}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.productImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>Sem Foto</Text>
              </View>
            )}
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.headerRow}>
              <Text variant="labelMedium" style={styles.codeText}>Cód: {item.codigo_produto}</Text>
              <Badge
                style={[
                  styles.badge,
                  { backgroundColor: item.status === 'ATIVO' ? '#22C55E' : '#EF4444' },
                ]}
              >
                {item.status}
              </Badge>
            </View>
            <Text variant="titleMedium" style={styles.descriptionText} numberOfLines={2}>
              {item.descricao_produto}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text variant="headlineSmall" style={styles.headerTitle}>Produtos</Text>
          <Text variant="bodySmall" style={styles.headerSubtitle}>Cadastro e Consulta</Text>
        </View>
        <IconButton icon="logout" iconColor="#4F46E5" size={24} onPress={handleLogout} />
      </View>

      {/* Search & Filters */}
      <View style={styles.filterSection}>
        <Searchbar
          placeholder="Buscar por código ou descrição..."
          onChangeText={setSearch}
          value={search}
          style={styles.searchbar}
          elevation={1}
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
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProductItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#4F46E5']} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text variant="bodyLarge" style={styles.emptyText}>Nenhum produto encontrado.</Text>
            </View>
          ) : null
        }
      />

      {/* FAB for new product */}
      <FAB
        icon="plus"
        label="Novo Produto"
        style={styles.fab}
        color="#FFFFFF"
        onPress={() => setModalVisible(true)}
      />

      {/* Modal for creating product */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>Novo Produto</Text>
          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <TextInput
            label="Código do Produto"
            value={codigo}
            onChangeText={setCodigo}
            style={styles.modalInput}
          />
          <TextInput
            label="Descrição do Produto"
            value={descricao}
            onChangeText={setDescricao}
            multiline
            numberOfLines={3}
            style={styles.modalInput}
          />

          <Text style={styles.label}>Status:</Text>
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
            <Button onPress={() => setModalVisible(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleCreateProduct}
              loading={saving}
              disabled={saving}
              style={{ backgroundColor: '#4F46E5' }}
            >
              Salvar
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
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontWeight: 'bold', color: '#0F172A' },
  headerSubtitle: { color: '#64748B' },
  filterSection: { padding: 16, backgroundColor: '#FFFFFF', gap: 12 },
  searchbar: { backgroundColor: '#F1F5F9' },
  segmentedBtn: { marginTop: 4 },
  listContainer: { padding: 16, paddingBottom: 80 },
  productCard: { marginBottom: 12, backgroundColor: '#FFFFFF', borderRadius: 12 },
  cardContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  imageContainer: { width: 64, height: 64, borderRadius: 8, overflow: 'hidden' },
  productImage: { width: '100%', height: '100%' },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { fontSize: 10, color: '#64748B' },
  infoContainer: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  codeText: { color: '#64748B', fontWeight: '600' },
  badge: { color: '#FFFFFF', fontWeight: 'bold' },
  descriptionText: { color: '#1E293B', fontWeight: '600' },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94A3B8' },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#4F46E5' },
  modalContainer: { backgroundColor: 'white', padding: 24, margin: 20, borderRadius: 16 },
  modalTitle: { fontWeight: 'bold', marginBottom: 16, color: '#0F172A' },
  modalInput: { marginBottom: 12 },
  label: { marginBottom: 8, color: '#475569', fontWeight: '600' },
  modalSegmented: { marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  errorText: { color: '#EF4444', marginBottom: 8 },
});
