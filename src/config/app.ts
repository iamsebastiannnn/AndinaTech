import Constants from 'expo-constants';

export const APP_CONFIG = {
  companyName: 'Andina Tech & Hogar',
  shortName: 'Andina',
  tagline: 'Tecnología y hogar para todo el país',
  version: Constants.expoConfig?.version ?? '1.0.0',
  course: 'Aplicaciones para dispositivos móviles',
  team: [
    'Integrante 1 (pendiente)',
    'Integrante 2 (pendiente)',
    'Integrante 3 (pendiente)',
    'Integrante 4 (pendiente)',
    'Integrante 5 (pendiente)',
  ],
} as const;
