/*eslint-disable */
const CACHE_NAME = "social_media";
const filesToCache = [
    "/manifest.json",
    "/close-icon.svg",
    "/heart.svg",
    "/icon-arrow-down.svg",
    "/icon-create.svg",
    "/icon-home.svg",
    "/icon-sign-out.svg",
    "/icon-sign-out.gif",
    "/left-chevron.svg",
    "/liked-svg.gif",
    "/notification.gif",
    "/notification.svg",
    "/right-chevron.svg"
];

self.addEventListener("install", async e => {
    console.log("Service worker installed");
    e.waitUntil(
        caches.open("cache-v1")
        .then(cache => {
            return cache.addAll(filesToCache);
        })
    );
    self.skipWaiting();
});

self.addEventListener("push", async e => {
    const data = e.data.json();
    // console.log("Push received...", data);
    const options = {
        body: data.body || "Check it out",
        icon: data.icon,
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: data.primaryKey,
            url: data.url
        }
    };

    const allClients = await clients.matchAll({ includeUncontrolled: true });
    for (const client of allClients){
        const url = new URL(client.url);

        if (url.hostname === "secure-meadow-40264.herokuapp.com" && client.visibilityState === "visible") {
            client.postMessage(data);
            return;
        }
    }
    return self.registration.showNotification(data.title, options);
});

self.addEventListener('notificationclick', async e => {
    const notification = e.notification;
    const primaryKey = notification.data.primaryKey;
    const action = e.action;
    console.log(notification);

    if (action === "close") {
        console.log("clicked close");
        notification.close();
    } else {
        console.log("clicked");
        clients.openWindow(notification.data.url);

        const allClients = await clients.matchAll({ includeUncontrolled: true });
        for (const client of allClients){
            const url = new URL(client.url);

            if (url.hostname === "secure-meadow-40264.herokuapp.com") {
                console.log(primaryKey);
                client.postMessage({ reqtype: "GET_TOKEN", primaryKey });
                return;
            }
        };
        notification.close();
    }
  
    console.log('Closed notification: ' + primaryKey);
});

// function deleteNotif(e) {
//     fetch(`http://localhost:3500/api/users/notif/${e.data.primaryKey}`, {
//         method: "DELETE",
//         headers: {
//             "Authorization": `Bearer ${e.data.token}`
//         }
//     });
// }

self.addEventListener("message", e => {
    console.log(e.data);
    fetch(`https://secure-meadow-40264.herokuapp.com/api/user/notif/${e.data.primaryKey}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${e.data.token}`
        }
    });
});

self.addEventListener("activate", e => {
    console.log("activating new service worker");

    const cacheAllowList = ["cache-v1"];
    e.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheAllowList.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            )
        })
    )
})