self.addEventListener("install", (event) => {
  console.log("FocusFlow Service Worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("FocusFlow Service Worker activated");
});