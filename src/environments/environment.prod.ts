export const environment = {
  production: true,
  apiUrl: '/api', // Fixed API base path for same-host deployment
  apiTimeout: 30000, // 30 seconds timeout for API calls
  useErrorInterceptor: true,
  useMockData: false,

  // مفاتيح API - ضع جميع مفاتيح API هنا
  apiKeys: {
    googleMaps: 'AIzaSyA4KWFc0F76RtQwNGZW9RrPb-zAqxsyDXU',
    stripe: '', // سيتم جلبه تلقائياً من Backend عبر GET /api/Payments/config
  },
};
