export const environment = {
  production: true,
  apiUrl: '/api', // Fixed API base path
  apiTimeout: 30000, // 30 seconds timeout for API calls
  useErrorInterceptor: true,
  useMockData: false, // Set to true to use mock data during development

  // مفاتيح API - ضع جميع مفاتيح API هنا
  apiKeys: {
    googleMaps: 'AIzaSyCuTilAfnGfkZtIx0T3qf-eOmWZ_N2LpoY',
    stripe: '', // سيتم جلبه تلقائياً من Backend عبر GET /api/Payments/config
  },
};
