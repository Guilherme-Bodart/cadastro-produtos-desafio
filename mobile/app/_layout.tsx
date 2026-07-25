import { Slot } from 'expo-router';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4F46E5',
    background: '#F1F5F9',
    surface: '#FFFFFF',
    accent: '#6366F1',
    text: '#1E293B',
    disabled: '#94A3B8',
    placeholder: '#94A3B8',
    backdrop: 'rgba(0,0,0,0.5)',
  },
};

export default function Layout() {
  return (
    <PaperProvider theme={theme}>
      <Slot />
    </PaperProvider>
  );
}
