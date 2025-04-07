// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyBinDDBgN4YXtc0GqerYkqepmoyBrfJtEU",
    authDomain: "qna1-3394a.firebaseapp.com",
    projectId: "qna1-3394a",
    storageBucket: "qna1-3394a.firebasestorage.app",
    messagingSenderId: "933849971313",
    appId: "1:933849971313:web:7f3ef1d64e4b07b5dbb9d0"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// Firestore 인스턴스 생성
const db = firebase.firestore(); 