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
        googleSignInBtn.innerHTML = '<img src="./img/google_logo.png" alt="google" class="google-img"><p class="google-text">Continue with Google</p>';
    }
});

googleSignInBtn.addEventListener('click', () => {
    googleSignInBtn.disabled = true;
    googleSignInBtn.style.cursor = 'not-allowed';
    googleSignInBtn.innerHTML = '<img src="./svg/spinner.svg" alt="loading" class="loading-svg">';
    signInWithRedirect(auth, googleProvider);
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./js/sw.js')
        .then((reg) => console.log('service worker registered', reg))
        .catch((err) => console.log('service worker not registered', err));
}