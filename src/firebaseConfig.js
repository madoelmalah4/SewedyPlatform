// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCwOLc3Pw5YAJGgB7-MQKCl2ACbbWUdFh8",
    authDomain: "sewedy-de7a1.firebaseapp.com",
    projectId: "sewedy-de7a1",
    storageBucket: "sewedy-de7a1.firebasestorage.app",
    messagingSenderId: "667533506189",
    appId: "1:667533506189:web:9dc98560b0bc686ec754c4",
    measurementId: "G-GJQF2S8E65"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export {db};