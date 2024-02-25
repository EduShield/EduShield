const userPfp = document.querySelector('.user-pfp');
const userMenu = document.querySelector('.user-menu');
const userName = document.querySelector('.user-name');
const userSignoutBtn = document.querySelector('.app-signout-btn');
const appNavLinks = document.querySelectorAll('.app-nav-links');

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, listAll, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

import firebaseConfig from "./firebaseConfig.json" assert {type: 'json'};

let currentUser;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

auth.useDeviceLanguage();

onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log('User is signed in');
        console.log(user);
        currentUser = user;
        userPfp.src = user.photoURL;
        userPfp.title = user.displayName;
        userName.textContent = user.displayName;
    } else {
        console.log('User is signed out');
        window.location.href = '/auth.html';
    }
});

userSignoutBtn.addEventListener('click', () => {
    signOut(auth).then((a) => {
        console.log('User signed out');
        console.log(a);
    }).catch((error) => {
        console.log('Error signing out');
        console.log(error);
    });
});

userPfp.addEventListener('click', () => {
    userMenu.classList.toggle('user-menu-active');
});

document.addEventListener('click', (e) => {
    if (e.target != userPfp && e.target != userMenu) {
        userMenu.classList.remove('user-menu-active');
    }
});

appNavLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
        link.classList.add('app-nav-links-selected');
        appNavLinks.forEach((l) => {
            if (l != link) {
                l.classList.remove('app-nav-links-selected');
            }
        });
    });
});

window.addEventListener('load', () => {
    appNavLinks.forEach((link) => {
        if (window.location.href === link.href) {
            link.classList.add('app-nav-links-selected');
        }
    });
});

async function uploadFile(file) {
    const storageRef = await ref(storage, `${currentUser.uid}/data/${file.name}`);
    await uploadBytes(storageRef, file)
        .then((snapshot) => {
            console.log('Uploaded a blob or file!');
            console.log(snapshot);
        });
    return 0;
}

async function listUploadedFiles() {
    const listRef = await ref(storage, `${currentUser.uid}/data`);
    const userFiles = await listAll(listRef);
    return userFiles;
}

async function downloadFile(fileName) {
    const downloadRef = ref(storage, `${currentUser.uid}/data/${fileName}`);
    const url = await getDownloadURL(downloadRef);
    return url;
}

async function deleteFile(fileName) {
    const deleteRef = ref(storage, `${currentUser.uid}/data/${fileName}`);
    await deleteObject(deleteRef);
}

async function userIdToken() {
    const idToken = await currentUser.getIdToken(true);
    return idToken;
}

export { userIdToken, uploadFile, listUploadedFiles, downloadFile, deleteFile };

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./js/sw.js')
        .then((reg) => console.log('service worker registered', reg))
        .catch((err) => console.log('service worker not registered', err));
}

// navigation.addEventListener("navigate", (event) => {
//     if (event.navigationType === 'push') {
//         const href = event.destination.url;
//         const path = href.split('/').pop().split('.')[0];
//         console.log(path);
//         // const link = document.createElement('link');
//         // link.setAttribute('rel', 'stylesheet');
//         // link.setAttribute('href', `css/${path}.css`);
//         // document.head.appendChild(link);
//     }
//     // const link = document.createElement('link');link.setAttribute('rel', 'stylesheet');link.setAttribute('href', `css/${event.detail.pathInfo.requestPath.split('.')[0]}.css`);document.head.appendChild(link);
//     // document.head.appendChild(document.createElement('link').setAttribute('rel', 'stylesheet').setAttribute('href', `css/${event.detail.pathInfo.requestPath.split('.')[0]}.css`));
// });