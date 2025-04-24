export const environment = {
  production: true,
  apiUrl: 'https://api.ra7ala.com', // Replace with your production API URL
  apiTimeout: 30000, // 30 seconds timeout for API calls
  useErrorInterceptor: true,
  useMockData: false,

  // مفاتيح API - ضع جميع مفاتيح API هنا
  apiKeys: {
    googleMaps: 'AIzaSyA4KWFc0F76RtQwNGZW9RrPb-zAqxsyDXU', // استبدل هذا بمفتاح Google Maps API الخاص بك للإنتاج
    // يمكنك إضافة مفاتيح API أخرى هنا في المستقبل
    // weather: 'your-weather-api-key',
    // payment: 'your-payment-api-key',
  },
};
