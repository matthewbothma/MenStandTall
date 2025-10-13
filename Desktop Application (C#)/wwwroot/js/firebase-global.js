// Global Firebase configuration and initialization
// This file should be loaded once and used across all pages

console.log('?? Loading global Firebase config...');

// Check if Firebase is already loaded
if (typeof firebase === 'undefined') {
    console.error('? Firebase SDK not loaded! Please include Firebase scripts first.');
} else {
    console.log('? Firebase SDK is available');
}

// Global Firebase configuration (will be loaded from server)
window.firebaseConfig = null;

// Direct configuration for immediate initialization
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCCCWM8JMsxsY28DrhxWje0MGsGYc9XLQo",
    authDomain: "menstandtall-6779a.firebaseapp.com",
    projectId: "menstandtall-6779a",
    storageBucket: "menstandtall-6779a.firebasestorage.app",
    messagingSenderId: "610463601364",
    appId: "1:610463601364:web:396e8e0c8aacafe2716141",
    measurementId: "G-XQCF3W12MX"
};

// Global Firebase initialization function
window.initializeGlobalFirebase = function() {
    if (typeof firebase === 'undefined') {
        console.error('? Firebase SDK not available');
        return Promise.resolve(false);
    }
    
    // First try to initialize with direct config for reliability
    return initializeWithDirectConfig()
        .then(success => {
            if (success) {
                return true;
            }
            // If direct config fails, try server config
            return initializeWithServerConfig();
        })
        .catch(error => {
            console.error('? Firebase initialization completely failed:', error);
            return false;
        });
};

// Initialize with direct configuration for immediate availability
function initializeWithDirectConfig() {
    try {
        console.log('?? Initializing Firebase with direct config...');
        
        // Only initialize if no app exists
        if (!firebase.apps || firebase.apps.length === 0) {
            firebase.initializeApp(FIREBASE_CONFIG);
            console.log('? Firebase initialized successfully with direct config');
        } else {
            console.log('?? Firebase already initialized, using existing app');
        }
        
        // Make auth and firestore globally available
        window.firebaseAuth = firebase.auth();
        window.firebaseDB = firebase.firestore ? firebase.firestore() : null;
        
        if (!window.firebaseDB) {
            console.error('? Firestore not available');
            return Promise.resolve(false);
        }
        
        console.log('? Firebase services initialized successfully');
        return Promise.resolve(true);
        
    } catch (error) {
        console.error('? Direct Firebase initialization failed:', error);
        return Promise.resolve(false);
    }
}

// Fetch configuration from server (fallback method)
function initializeWithServerConfig() {
    console.log('?? Attempting server configuration fallback...');
    
    return fetch('/api/config/firebase')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server config failed: ${response.status}`);
            }
            return response.json();
        })
        .then(config => {
            console.log('? Firebase configuration loaded from server');
            window.firebaseConfig = config;
            
            try {
                // Only initialize if no app exists
                if (!firebase.apps || firebase.apps.length === 0) {
                    firebase.initializeApp(config);
                    console.log('? Firebase initialized with server config');
                } else {
                    console.log('?? Firebase already initialized');
                }
                
                // Make auth and firestore globally available
                window.firebaseAuth = firebase.auth();
                window.firebaseDB = firebase.firestore ? firebase.firestore() : null;
                
                return true;
            } catch (error) {
                console.error('? Firebase initialization with server config failed:', error);
                return false;
            }
        })
        .catch(error => {
            console.error('? Failed to load Firebase configuration from server:', error);
            return false;
        });
}

// Global logout function
window.globalLogout = function() {
    console.log('?? Global logout called');
    
    if (!window.firebaseAuth) {
        console.log('?? No Firebase auth available, redirecting anyway');
        window.location.href = '/';
        return;
    }
    
    var currentUser = window.firebaseAuth.currentUser;
    console.log('Current user:', currentUser ? currentUser.email : 'None');
    
    if (currentUser) {
        console.log('?? Signing out user:', currentUser.email);
        window.firebaseAuth.signOut().then(function() {
            console.log('? User signed out successfully');
            window.location.href = '/';
        }).catch(function(error) {
            console.error('? Logout error:', error);
            // Force redirect even on error
            window.location.href = '/';
        });
    } else {
        console.log('?? No user to sign out, redirecting');
        window.location.href = '/';
    }
};

// Wait for Firebase to be ready
window.waitForFirebase = function(callback, maxAttempts = 50) {
    let attempts = 0;
    
    function checkFirebase() {
        attempts++;
        
        if (window.firebaseAuth && window.firebaseDB) {
            console.log('? Firebase is ready');
            callback();
            return;
        }
        
        if (attempts >= maxAttempts) {
            console.error('? Firebase failed to initialize after maximum attempts');
            callback(); // Call anyway to prevent hanging
            return;
        }
        
        setTimeout(checkFirebase, 100);
    }
    
    checkFirebase();
};

// Initialize Firebase when this script loads
function initializeFirebaseOnLoad() {
    console.log('?? Starting Firebase initialization...');
    
    window.initializeGlobalFirebase().then(function(success) {
        if (success) {
            console.log('? Global Firebase initialization complete');
            // Trigger a custom event to notify other scripts
            window.dispatchEvent(new CustomEvent('firebaseReady'));
        } else {
            console.error('? Global Firebase initialization failed');
            // Still trigger the event so pages don't hang
            window.dispatchEvent(new CustomEvent('firebaseReady'));
        }
    });
}

// Initialize based on document ready state
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFirebaseOnLoad);
} else {
    initializeFirebaseOnLoad();
}

console.log('? Global Firebase script loaded');