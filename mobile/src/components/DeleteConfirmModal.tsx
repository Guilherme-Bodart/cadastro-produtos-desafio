import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Portal, Modal, Button } from 'react-native-paper';
import { Product } from '@/services/products.services';

interface DeleteConfirmModalProps {
  deletingProduct: Product | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({
  deletingProduct,
  deleting,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <Portal>
      <Modal
        visible={!!deletingProduct}
        onDismiss={onClose}
        contentContainerStyle={styles.deleteModalContainer}
      >
        <Text style={styles.deleteTitle}>🗑️ Confirmar Exclusão</Text>
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
            onPress={onClose}
            disabled={deleting}
            style={{ borderRadius: 10 }}
          >
            Cancelar
          </Button>
          <Button
            mode="contained"
            onPress={onConfirm}
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
  );
}

const styles = StyleSheet.create({
  deleteModalContainer: { backgroundColor: 'white', padding: 24, margin: 20, borderRadius: 20 },
  deleteTitle: { fontWeight: 'bold', color: '#E11D48', marginBottom: 12, fontSize: 18 },
  deleteText: { color: '#475569', fontSize: 14, marginBottom: 20, lineHeight: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 10 },
});
