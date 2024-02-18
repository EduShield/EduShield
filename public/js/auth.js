const googleSignInBtn = document.getElementById('google-signin-btn');

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithRedirect } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import firebaseConfig from "./firebaseConfig.json" assert {type: 'json'};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

auth.useDeviceLanguage();

const googleProvider = new GoogleAuthProvider();

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('User is signed in');
        console.log(user);
        window.location.href = '/dashboard.html';
    } else {
        console.log('User is signed out');
        googleSignInBtn.disabled = false;
        googleSignInBtn.style.cursor = 'pointer';
        googleSignInBtn.textContent = 'Continue With Google';
    }
});

googleSignInBtn.addEventListener('click', () => {
    googleSignInBtn.disabled = true;
    googleSignInBtn.style.cursor = 'not-allowed';
    googleSignInBtn.textContent = 'Signing In...';
    signInWithRedirect(auth, googleProvider);
});