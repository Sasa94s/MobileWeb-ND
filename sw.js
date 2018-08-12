const CACHE_STATIC_VERSION = 'v1';
const CACHE_DYNAMIC_VERSION = 'v1';

const CACHE_STATIC_NAME = `static_${CACHE_STATIC_VERSION}`;
const CACHE_DYNAMIC_NAME = `dynamic_${CACHE_DYNAMIC_VERSION}`;

self.addEventListener('install', (event) => {
    console.log("[Service worker] Installing Service Worker...", event);
    event.waitUntil(
        // Open 'staatic' cache or create it if it doesn't exist
        caches.open(CACHE_STATIC_NAME)
            .then((cache) => {
                console.log('[Service Worker] Precaching App Shell...');
                // Static Precaching main assets
                cache.addAll([
                    '/',
                    '/index.html',
                    '/offline.html',
                    '/img/sad.svg',
                    '/img/refresh.svg',
                    '/js/dbhelper.js',
                    '/js/index.js',
                    '/js/main.js',
                    '/css/styles.css'
                ]);
            })
    );
});

self.addEventListener('activate', (event) => {
    console.log("[Service worker] Activating Service Worker...", event);
    event.waitUntil(
        caches.keys()
            .then((keyList) => {
                return Promise.all(keyList.map((key) => {
                    if(key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
                        console.log('[Service Worker] Removing old cache...', key);
                        return caches.delete(key);
                    }
                }));
            })
    );
    return self.clients.claim();
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
                            return caches.open(CACHE_DYNAMIC_NAME)
                                .then((cache) => {
                                    // Storing a clone of network request in cache
                                    cache.put(event.request.url, serverResponse.clone());
                                    return serverResponse;
                                })
                        })
                        .catch((err) => {
                            console.log("Can't connect!")
                            // Returning offline fallback page
                            return caches.open(CACHE_STATIC_NAME)
                                .then((cache) => {
                                    return cache.match('/offline.html');
                                })
                        })
                }
            })
    );
});