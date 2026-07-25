import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Card, ActivityIndicator } from 'react-native-paper';
import { login } from '@/services/auth.services';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Preencha e-mail e senha para continuar.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(email, password);
      router.replace('/home');
    } catch (e: any) {
      setError(e.response?.data?.message || e.response?.data?.error || 'E-mail ou senha inválidos.');
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
        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>📦</Text>
          </View>
          <Text variant="headlineMedium" style={styles.brandTitle}>CadastroProdutos</Text>
          <Text variant="bodyMedium" style={styles.brandSubtitle}>
            Acesse seu painel móvel de gerenciamento
          </Text>
        </View>

        {/* Login Card */}
        <Card style={styles.card} mode="elevated">
          <Card.Content style={styles.cardContent}>
            <Text variant="titleLarge" style={styles.cardTitle}>Entrar na sua conta</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

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
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.submitBtn}
              contentStyle={styles.btnContent}
              labelStyle={styles.btnLabel}
            >
              {loading ? 'Entrando...' : 'Acessar Conta'}
            </Button>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OU</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              mode="outlined"
              onPress={() => router.push('/register')}
              style={styles.registerBtn}
              labelStyle={{ color: '#4F46E5', fontWeight: '600' }}
            >
              Criar uma nova conta
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { marginHorizontal: 12, color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  registerBtn: { borderRadius: 12, borderColor: '#4F46E5', borderWidth: 1.5 },
});
