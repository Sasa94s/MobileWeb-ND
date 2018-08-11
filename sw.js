self.addEventListener('install', (event) => {
    console.log("[Service worker] Installing Service Worker...", event);
    event.waitUntil(
        // Open 'staatic' cache or create it if it doesn't exist
        caches.open('static')
            .then((cache) => {
                console.log('[Service Worker] Precaching App Shell...');
                // Static Precaching main assets
                cache.addAll([
                    '/',
                    './index.html',
                    '/js/dbhelper.js',
                    '/js/index.js',
                    '/js/main.js',
                    '/css/styles.css'
                ]);
            })
    );
});

self.addEventListener('fetch', (event) => {
    console.log("[Service worker] Fetching something...", event);
    event.respondWith(
        caches.match(event.request)
            .then((localResponse) => {
                // If the response exists in the cache
                if(localResponse) {
                    // Returning cached assets
                    return localResponse;
                } else {
                // If the response doesn't exist in the cache
                    // Dynamic Caching
                    return fetch(event.request)
                        .then((serverResponse) => {
                            // Intercepts network request and returns it to original HTML when using `return` keyword
                            // Open 'dynamic' cache or create it if it doesn't exist
                            return caches.open('dynamic')
                                .then((cache) => {
                                    // Storing a clone of network request in cache
                                    cache.put(event.request.url, serverResponse.clone());
                                    return serverResponse;
                                })
                        })
                }
            })
    );
});