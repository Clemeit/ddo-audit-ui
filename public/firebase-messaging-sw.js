// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
// safe to expose:
firebase.initializeApp({
    apiKey: "AIzaSyBPQk8DKDZvO88IL5War-0k-GLFmCvqeIg",
    authDomain: "hcnxsryjficudzazjxty.firebaseapp.com",
    projectId: "hcnxsryjficudzazjxty",
    storageBucket: "hcnxsryjficudzazjxty.firebasestorage.app",
    messagingSenderId: "808002047047",
    appId: "1:808002047047:web:251d7d87c213ffd1233562",
    measurementId: "G-L54PGXRRZV",
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Received message ', payload);
    
    // Check if any client (browser tab) is currently focused
    return self.clients.matchAll({ type: 'window' }).then(function(clientList) {
        let isAppInForeground = false;
        
        console.log('[firebase-messaging-sw.js] Found clients:', clientList.length);
        
        for (let i = 0; i < clientList.length; i++) {
            console.log('[firebase-messaging-sw.js] Client', i, 'focused:', clientList[i].focused, 'url:', clientList[i].url);
            if (clientList[i].focused) {
                isAppInForeground = true;
                break;
            }
        }
        
        console.log('[firebase-messaging-sw.js] App in foreground:', isAppInForeground);
        
        // Only show notification if app is NOT in foreground
        if (!isAppInForeground) {
            console.log('[firebase-messaging-sw.js] Showing background notification');
            
            const notificationTitle = payload.notification?.title || payload.data?.title || 'DDO Audit';
            const notificationBody = payload.notification?.body || payload.data?.body || 'New notification';
            
            const notificationOptions = {
                body: notificationBody,
                icon: '/icons/logo-192px.png',
                badge: '/icons/logo-192px.png',
                tag: 'ddo-notification',
                data: payload.data || {},
                requireInteraction: true,
                actions: [
                    {
                        action: 'open',
                        title: 'Open App'
                    },
                    {
                        action: 'dismiss',
                        title: 'Dismiss'
                    }
                ]
            };

            return self.registration.showNotification(notificationTitle, notificationOptions);
        } else {
            console.log('[firebase-messaging-sw.js] App is in foreground, not showing notification');
        }
    });
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
    console.log('[firebase-messaging-sw.js] Notification click received.');

    event.notification.close();

    if (event.action === 'open' || !event.action) {
        // Open the app
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
                // If the app is already open, focus it
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        return client.focus();
                    }
                }
                // If the app is not open, open it
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
        );
    }
    // Dismiss action just closes the notification (already done above)
});