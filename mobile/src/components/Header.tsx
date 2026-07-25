import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import { Menu } from 'react-native-paper';

interface HeaderProps {
  currentUser: { name?: string; email?: string } | null;
  onLogout: () => void;
}

export function Header({ currentUser, onLogout }: HeaderProps) {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.headerBadge}>
          <Text style={styles.headerIcon}>📦</Text>
        </View>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Catálogo de Produtos
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            Gerenciador de Inventário
          </Text>
        </View>
      </View>

      <View style={styles.headerRight}>
        {currentUser?.name ? (
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity
                style={styles.userBadge}
                onPress={() => setMenuVisible(true)}
                activeOpacity={0.7}
              >
                <View style={styles.userDot} />
                <Text style={styles.userText} numberOfLines={1}>
                  Olá, <Text style={styles.userName}>{currentUser.name}</Text>
                </Text>
                <Text style={styles.dropdownChevron}> ▾</Text>
              </TouchableOpacity>
            }
            contentStyle={styles.menuContent}
          >
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                onLogout();
              }}
              title="Sair da Conta"
              titleStyle={styles.menuLogoutTitle}
            />
          </Menu>
        ) : (
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.7}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 8 },
  headerBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  headerIcon: { fontSize: 20 },
  headerTitleGroup: { flex: 1 },
  headerTitle: { fontWeight: 'bold', color: '#0F172A', fontSize: 15, lineHeight: 18 },
  headerSubtitle: { color: '#64748B', fontSize: 11 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  userDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#10B981' },
  userText: { fontSize: 12, color: '#475569' },
  userName: { fontWeight: 'bold', color: '#0F172A' },
  dropdownChevron: { fontSize: 11, color: '#64748B', fontWeight: 'bold' },
  menuContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 44,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuLogoutTitle: { color: '#E11D48', fontWeight: 'bold', fontSize: 13 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECDD3',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutText: { fontSize: 12, fontWeight: 'bold', color: '#E11D48' },
});
