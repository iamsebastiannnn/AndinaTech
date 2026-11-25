import Constants from 'expo-constants';

export const APP_CONFIG = {
  companyName: 'Andina Tech & Hogar',
  shortName: 'Andina',
  tagline: 'Tecnología y hogar para todo el país',
  version: Constants.expoConfig?.version ?? '1.0.0',
  course: 'Aplicaciones para dispositivos móviles',
  team: ['Jose Manuel Nazarit Hidalgo', 'Sebastian Gutierrez', 'Didier Dayan Ramos'],
} as const;
