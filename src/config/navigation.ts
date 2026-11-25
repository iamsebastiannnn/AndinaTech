import type { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';

type IconName = keyof typeof Ionicons.glyphMap;

export interface NavItem {
  key: string;
  label: string;
  shortLabel: string;
  icon: IconName;
  activeIcon: IconName;
  href?: Href;
  action?: 'signOut';
}

const CATALOG: NavItem = {
  key: 'catalogo',
  label: 'Catálogo',
  shortLabel: 'Catálogo',
  icon: 'grid-outline',
  activeIcon: 'grid',
  href: '/',
};

const PUBLIC_ITEMS: NavItem[] = [
  CATALOG,
  {
    key: 'login',
    label: 'Iniciar sesión',
    shortLabel: 'Ingresar',
    icon: 'log-in-outline',
    activeIcon: 'log-in',
    href: '/login',
  },
  {
    key: 'registro',
    label: 'Registro',
    shortLabel: 'Registro',
    icon: 'person-add-outline',
    activeIcon: 'person-add',
    href: '/register',
  },
];

const PRIVATE_ITEMS: NavItem[] = [
  CATALOG,
  {
    key: 'usuarios',
    label: 'Usuarios registrados',
    shortLabel: 'Usuarios',
    icon: 'people-outline',
    activeIcon: 'people',
    href: '/users',
  },
  {
    key: 'salir',
    label: 'Cerrar sesión',
    shortLabel: 'Salir',
    icon: 'log-out-outline',
    activeIcon: 'log-out',
    action: 'signOut',
  },
];

export function getNavItems(isAuthenticated: boolean): NavItem[] {
  return isAuthenticated ? PRIVATE_ITEMS : PUBLIC_ITEMS;
}

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  return typeof item.href === 'string' && item.href === pathname;
}
