// Global Firebase configuration and initialization
// This file should be loaded once and used across all pages

console.log('?? Loading global Firebase config...');

// Check if Firebase is already loaded
if (typeof firebase === 'undefined') {
    console.error('? Firebase SDK not loaded! Please include Firebase scripts first.');
} else {
    console.log('? Firebase SDK is available');
}

// Single Firebase configuration
window.firebaseConfig = {
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
        return false;
    }
    
    try {
        // Only initialize if no app exists
        if (!firebase.apps || firebase.apps.length === 0) {
            firebase.initializeApp(window.firebaseConfig);
            console.log('? Firebase initialized successfully');
        } else {
            console.log('? Firebase already initialized, using existing app');
        }
        
        // Make auth and firestore globally available
        window.firebaseAuth = firebase.auth();
        window.firebaseDB = firebase.firestore ? firebase.firestore() : null;
        
        return true;
    } catch (error) {
        console.error('? Firebase initialization failed:', error);
        return false;
    }
};

// Global logout function
window.globalLogout = function() {
    console.log('?? Global logout called');
    
    if (!window.firebaseAuth) {
        console.log('? No Firebase auth available, redirecting anyway');
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
        console.log('? No user to sign out, redirecting');
        window.location.href = '/';
    }
};

// Initialize Firebase when this script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initializeGlobalFirebase);
} else {
    window.initializeGlobalFirebase();
}

console.log('?? Global Firebase script loaded');