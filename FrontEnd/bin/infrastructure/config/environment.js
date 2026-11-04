/**
 * Environment configuration - the only place that reads import.meta.env.
 * Switching data sources happens here + repository factories, never in UI.
 */
const rawSource = (import.meta.env.VITE_DATA_SOURCE || 'mock').toLowerCase();

export const environment = {
  dataSource: rawSource === 'api' ? 'api' : 'mock',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  appName: import.meta.env.VITE_APP_NAME || 'WebYBook',
  appDescription: import.meta.env.VITE_APP_DESCRIPTION || 'Nhà sách trực tuyến',
  isDevelopment: import.meta.env.DEV,
};

export const isMockDataSource = () => environment.dataSource === 'mock';
export const isApiDataSource = () => environment.dataSource === 'api';
