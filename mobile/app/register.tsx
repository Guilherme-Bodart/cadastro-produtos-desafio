import React, { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
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
      setError('Preencha todos os campos');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await register(name, email, password);
      router.replace('/home');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erro ao realizar cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>Criar Conta</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TextInput
            label="Nome Completo"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <TextInput
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            label="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          <Button mode="contained" onPress={handleRegister} loading={loading} disabled={loading} style={styles.button}>
            Cadastrar
          </Button>
          <Button onPress={() => router.replace('/login')} style={styles.link}>
            Já possui uma conta? Faças login
          </Button>
        </Card.Content>
      </Card>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: '#F1F5F9' },
  card: { width: '100%', maxWidth: 400 },
  title: { marginBottom: 16, textAlign: 'center', fontWeight: 'bold' },
  input: { marginBottom: 12 },
  button: { marginTop: 8, backgroundColor: '#4F46E5' },
  link: { marginTop: 8 },
  error: { color: '#B91C1C', marginBottom: 8, textAlign: 'center' },
});
