// OneSignal Service Worker
self.addEventListener('message', function(event) {
  console.log('OneSignal SW received message:', event.data);
});

// Try to import OneSignal SW
try {
  importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
} catch (error) {
  console.error('Failed to load OneSignal SW:', error);
  // Fallback to legacy
  try {
    importScripts("https://cdn.onesignal.com/sdks/OneSignalSDK.sw.js");
  } catch (legacyError) {
    console.error('Failed to load OneSignal Legacy SW:', legacyError);
  }
}