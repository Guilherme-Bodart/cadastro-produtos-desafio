import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Platform } from 'react-native';
import { Portal, Modal, TextInput, SegmentedButtons, IconButton, Button } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Product } from '@/services/products.services';

interface ProductFormModalProps {
  visible: boolean;
  editingProduct: Product | null;
  codigo: string;
  setCodigo: (val: string) => void;
  descricao: string;
  setDescricao: (val: string) => void;
  status: 'ATIVO' | 'INATIVO';
  setStatus: (val: 'ATIVO' | 'INATIVO') => void;
  selectedFile: any;
  setSelectedFile: (file: any) => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  saving: boolean;
  errorMsg: string;
  onClose: () => void;
  onSave: () => void;
}

export function ProductFormModal({
  visible,
  editingProduct,
  codigo,
  setCodigo,
  descricao,
  setDescricao,
  status,
  setStatus,
  selectedFile,
  setSelectedFile,
  previewUrl,
  setPreviewUrl,
  saving,
  errorMsg,
  onClose,
  onSave,
}: ProductFormModalProps) {

  const handlePickImage = async () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const el = document.getElementById('mobile-photo-picker');
      if (el) el.click();
      return;
    }

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        alert('É necessária permissão de acesso à galeria para enviar fotos do produto.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        setPreviewUrl(asset.uri);

        const filename = asset.uri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        setSelectedFile({
          uri: asset.uri,
          name: filename,
          type: type,
        });
      }
    } catch (e) {
      console.warn('Erro ao selecionar foto:', e);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {editingProduct ? 'Editar Produto' : 'Novo Produto'}
          </Text>
          <IconButton icon="close" size={20} onPress={onClose} />
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

        {/* Photo Upload Container */}
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
              onPress={handlePickImage}
              activeOpacity={0.7}
            >
              <Text style={styles.selectPhotoText}>
                {selectedFile ? '📷 Trocar Imagem' : '📷 Selecionar Imagem'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.photoHintText}>PNG, JPG ou WEBP de até 5MB</Text>
          </View>
        </View>

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
            onPress={onClose}
            disabled={saving}
            style={{ borderRadius: 10, borderColor: '#CBD5E1' }}
          >
            Cancelar
          </Button>
          <Button
            mode="contained"
            onPress={onSave}
            loading={saving}
            disabled={saving}
            style={{ backgroundColor: '#4F46E5', borderRadius: 10 }}
          >
            {editingProduct ? 'Atualizar' : 'Salvar'}
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { backgroundColor: 'white', padding: 24, margin: 20, borderRadius: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontWeight: 'bold', color: '#0F172A', fontSize: 18 },
  modalInput: { marginBottom: 14, backgroundColor: '#FFFFFF' },
  modalLabel: { marginBottom: 8, color: '#475569', fontWeight: '600', fontSize: 13 },
  modalSegmented: { marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 10 },
  modalErrorBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  modalErrorText: { color: '#B91C1C', fontSize: 12 },
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
