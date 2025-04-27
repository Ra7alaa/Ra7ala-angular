export const environment = {
  production: false,
  apiUrl: 'https://localhost:7111', // Development API URL based on the Swagger UI
  apiTimeout: 30000, // 30 seconds timeout for API calls
  useErrorInterceptor: true,
  useMockData: false, // Set to true to use mock data during development

  // مفاتيح API - ضع جميع مفاتيح API هنا
  apiKeys: {
    googleMaps: 'AIzaSyCuTilAfnGfkZtIx0T3qf-eOmWZ_N2LpoY', // استبدل هذا بمفتاح Google Maps API الخاص بك
    // يمكنك إضافة مفاتيح API أخرى هنا في المستقبل
    // weather: 'your-weather-api-key',
    // payment: 'your-payment-api-key',
  },
};
