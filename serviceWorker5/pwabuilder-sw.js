const CACHE = 'pwabuilder-cache';
const PRECACHE = 'pwabuilder-precache';

const precacheFiles = [
  '/images/lightside.jpg'
];

const networkFiles = [
  '/images/Dark-Side-FC-alt.jpg'
];


self.addEventListener('install', function(evt) {
  console.log('[PWA Builder] The service worker is being installed.');
  evt.waitUntil(createPrecache());
});

self.addEventListener('activate', function(event) {
  console.log('[ServiceWorker] Claiming clients for current page');
  return self.clients.claim();
});

self.addEventListener('fetch', function(evt) {
  console.log('[ServiceWorker] The service worker is serving the asset.'+ evt.request.url);

  evt.respondWith(useServer(evt.request).catch(usePreCache));

  evt.waitUntil(getCacheData(evt.request, PRECACHE).then(updatePreCache)
                                                   .catch(updateCache));

});

function useServer(request) {
  return new Promise((resolve, reject) => {
    var found = networkFiles.filter(x =>  request.url.includes(x));

    if (found.length > 0){
      getServerData(request).then(function(response){
        if(response.status !== 404) {
          resolve(response);
        } else {
          reject(request);
        }
      });
    }else {
      reject(request);
    }
  });
}

function getCacheData(request, cache) {
  return new Promise((resolve, reject) => {
    caches.open(cache).then(function (cache) {
      cache.match(request).then(function(match){
        if (match){
          resolve(request);
        } else {
          reject(request);
        }
      });
    });
  });
}

function createPrecache() {
  return caches.open(PRECACHE).then(function (cache) {
    return cache.addAll(precacheFiles);
  });
}

function usePreCache(request) {
  return getCacheData(request, PRECACHE);
}

function useCache(request) {
  return getCacheData(request, CACHE);
}

function getServerData(request) {
  return fetch(request);
}

function updateCache(request) {
  //Open the selected Cache
  return caches.open(CACHE).then(function (cache) {
    //Retrive data from server
    return getServerData(request).then(function (response) {
      //Insert into the opened cache
      return cache.put(request, response);
    });
  });
}

function updatePreCache(request) {
  //Open the selected Cache
  return caches.open(PRECACHE).then(function (cache) {
    //Retrive data from server
    return getServerData(request).then(function (response) {
      //Insert into the opened cache
      return cache.put(request, response);
    });
  });
}