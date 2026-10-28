export const API_URL = __DEV__
  ? process.env.EXPO_PUBLIC_API_LOCAL!
  : process.env.EXPO_PUBLIC_API_PRODUCAO!;