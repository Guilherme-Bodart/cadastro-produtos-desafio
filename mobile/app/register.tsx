import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { register } from '@/services/auth.services';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await register(name, email, password);
      router.replace('/home');
    } catch (e: any) {
      setError(e.response?.data?.message || e.response?.data?.error || 'Erro ao realizar o cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>📝</Text>
          </View>
          <Text variant="headlineMedium" style={styles.brandTitle}>CadastroProdutos</Text>
          <Text variant="bodyMedium" style={styles.brandSubtitle}>
            Crie sua conta para gerenciar seu catálogo
          </Text>
        </View>

        {/* Register Card */}
        <Card style={styles.card} mode="elevated">
          <Card.Content style={styles.cardContent}>
            <Text variant="titleLarge" style={styles.cardTitle}>Criar Nova Conta</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            <TextInput
              label="Nome Completo"
              value={name}
              onChangeText={setName}
              mode="outlined"
              outlineColor="#E2E8F0"
              activeOutlineColor="#4F46E5"
              style={styles.input}
              left={<TextInput.Icon icon="account-outline" color="#64748B" />}
            />

            <TextInput
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              mode="outlined"
              outlineColor="#E2E8F0"
              activeOutlineColor="#4F46E5"
              style={styles.input}
              left={<TextInput.Icon icon="email-outline" color="#64748B" />}
            />

            <TextInput
              label="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              mode="outlined"
              outlineColor="#E2E8F0"
              activeOutlineColor="#4F46E5"
              style={styles.input}
              left={<TextInput.Icon icon="lock-outline" color="#64748B" />}
            />

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.submitBtn}
              contentStyle={styles.btnContent}
              labelStyle={styles.btnLabel}
            >
              {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
            </Button>

            <Button
              mode="text"
              onPress={() => router.replace('/login')}
              style={styles.loginLink}
              labelStyle={{ color: '#4F46E5', fontWeight: '600' }}
            >
              Já possui uma conta? Faça Login
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  brandContainer: { alignItems: 'center', marginBottom: 28 },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoIcon: { fontSize: 32 },
  brandTitle: { fontWeight: 'bold', color: '#0F172A', textAlign: 'center' },
  brandSubtitle: { color: '#64748B', marginTop: 4, textAlign: 'center' },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    elevation: 3,
  },
  cardContent: { padding: 24 },
  cardTitle: { fontWeight: 'bold', color: '#0F172A', marginBottom: 20, textAlign: 'center' },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: '#B91C1C', fontSize: 13, textAlign: 'center', fontWeight: '500' },
  input: { marginBottom: 16, backgroundColor: '#FFFFFF' },
  submitBtn: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    elevation: 2,
  },
  btnContent: { height: 48 },
  btnLabel: { fontSize: 16, fontWeight: 'bold' },
  loginLink: { marginTop: 16 },
});
