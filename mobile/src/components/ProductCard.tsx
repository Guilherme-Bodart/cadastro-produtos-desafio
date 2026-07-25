import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Platform } from 'react-native';
import { Card } from 'react-native-paper';
import { Product } from '@/services/products.services';

interface ProductCardProps {
  product: Product;
  getImageUrl: (foto?: string | null) => string | null;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductCard({ product, getImageUrl, onEdit, onDelete }: ProductCardProps) {
  const imageUrl = getImageUrl(product.foto_produto);
  const isActive = product.status === 'ATIVO';

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
            <Image
              source={{ uri: imageUrl }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderIcon}>🖼️</Text>
            </View>
          )}
        </View>

        {/* Product Details */}
        <View style={styles.infoContainer}>
          <Text style={styles.codeValue}>{product.codigo_produto}</Text>
          <Text style={styles.descriptionText} numberOfLines={1}>
            {product.descricao_produto}
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
            onPress={() => onEdit(product)}
            activeOpacity={0.7}
          >
            <Text style={styles.squareIconText}>✏️</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.squareIconBtn, styles.squareDeleteBtn]}
            onPress={() => onDelete(product)}
            activeOpacity={0.7}
          >
            <Text style={styles.squareIconText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  productCard: { marginBottom: 10, backgroundColor: '#FFFFFF', borderRadius: 16, elevation: 1 },
  inactiveCard: { opacity: 0.75, backgroundColor: '#F8FAFC' },
  cardContent: { flexDirection: 'row', padding: 12, alignItems: 'center', gap: 12 },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
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
  codeValue: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: 'bold',
    color: '#0F172A',
    fontSize: 13,
  },
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
});
