import { Component, useEffect, useRef, type ComponentRef, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { StateMessage } from '@/components/ui/StateMessage';
import { isSupabaseConfigured, missingEnvVars } from '@/config/env';
import { colors, layout, spacing } from '@/theme';

interface WorkAreaProps {
  children: ReactNode;
  footer: ReactNode;
  pathname: string;
  horizontalInsets?: { left: number; right: number };
}

interface BoundaryProps {
  children: ReactNode;
  resetKey: string;
}

class ViewErrorBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidUpdate(previous: BoundaryProps) {
    if (previous.resetKey !== this.props.resetKey && this.state.failed) this.setState({ failed: false });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <StateMessage
        tone="error"
        icon="bug-outline"
        title="Algo salió mal en esta página"
        description="Ocurrió un problema inesperado al mostrar el contenido."
        actionLabel="Reintentar"
        actionIcon="refresh"
        onAction={() => this.setState({ failed: false })}
      />
    );
  }
}

function MissingConfiguration() {
  return (
    <StateMessage
      tone="error"
      icon="construct-outline"
      title="Falta conectar la base de datos"
      description={`La aplicación no encuentra la configuración de Supabase (${missingEnvVars.join(
        ' y ',
      )}). Crea el archivo .env a partir de .env.example, completa los valores y vuelve a iniciar la aplicación.`}
    />
  );
}

export function WorkArea({ children, footer, pathname, horizontalInsets }: WorkAreaProps) {
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [pathname]);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'web' ? undefined : 'padding'}>
      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingLeft: horizontalInsets?.left ?? 0, paddingRight: horizontalInsets?.right ?? 0 },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.page} accessibilityRole={Platform.OS === 'web' ? ('main' as never) : undefined}>
          {isSupabaseConfigured ? (
            <ViewErrorBoundary resetKey={pathname}>{children}</ViewErrorBoundary>
          ) : (
            <MissingConfiguration />
          )}
        </View>
        {footer}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1 },
  page: {
    flexGrow: 1,
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
});
