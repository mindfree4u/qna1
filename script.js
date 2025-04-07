// Firebase 초기화 확인
if (typeof firebase === 'undefined') {
    console.error('Firebase SDK가 로드되지 않았습니다.');
} else if (!db) {
    console.error('Firebase가 초기화되지 않았습니다.');
} else {
    // DOM이 완전히 로드된 후 실행
    document.addEventListener('DOMContentLoaded', function() {
        // DOM 요소
        const questionForm = document.getElementById('questionForm');
        const questionsList = document.getElementById('questionsList');
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const loginModal = document.getElementById('loginModal');
        const signupModal = document.getElementById('signupModal');
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const subjectInput = document.getElementById('subject');
        const titleInput = document.getElementById('title');
        const contentInput = document.getElementById('content');

        // 모든 필수 DOM 요소가 존재하는지 확인
        if (!questionForm || !questionsList || !subjectInput || !titleInput || !contentInput) {
            console.error('필수 DOM 요소를 찾을 수 없습니다:', {
                questionForm: !!questionForm,
                questionsList: !!questionsList,
                subjectInput: !!subjectInput,
                titleInput: !!titleInput,
                contentInput: !!contentInput
            });
            return;
        }

        // 모달 닫기 버튼
        const closeButtons = document.querySelectorAll('.close');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                loginModal.style.display = 'none';
                signupModal.style.display = 'none';
            });
        });

        // 모달 외부 클릭 시 닫기
        window.addEventListener('click', (e) => {
            if (e.target === loginModal) loginModal.style.display = 'none';
            if (e.target === signupModal) signupModal.style.display = 'none';
        });

        // 로그인 버튼 클릭 이벤트
        loginBtn.addEventListener('click', () => {
            loginModal.style.display = 'block';
        });

        // 회원가입 버튼 클릭 이벤트
        signupBtn.addEventListener('click', () => {
            signupModal.style.display = 'block';
        });

        // 로그인 폼 제출 이벤트
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                await firebase.auth().signInWithEmailAndPassword(email, password);
                loginModal.style.display = 'none';
                updateUI();
            } catch (error) {
                alert('로그인 실패: ' + error.message);
            }
        });

        // 회원가입 폼 제출 이벤트
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const name = document.getElementById('signupName').value;

            try {
                const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
                await userCredential.user.updateProfile({
                    displayName: name
                });
                signupModal.style.display = 'none';
                updateUI();
            } catch (error) {
                alert('회원가입 실패: ' + error.message);
            }
        });

        // 인증 상태 변경 감지
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                document.body.classList.add('logged-in');
                updateUI();
            } else {
                document.body.classList.remove('logged-in');
                updateUI();
            }
        });

        // UI 업데이트 함수
        function updateUI() {
            const user = firebase.auth().currentUser;
            if (user) {
                // 로그인된 상태
                document.querySelector('.auth-buttons').innerHTML = `
                    <div class="user-info">
                        <span>${user.displayName}님</span>
                        <button onclick="logout()" class="auth-btn">로그아웃</button>
                    </div>
                `;
                questionForm.style.display = 'block';
            } else {
                // 로그아웃된 상태
                document.querySelector('.auth-buttons').innerHTML = `
                    <button id="loginBtn" class="auth-btn">로그인</button>
                    <button id="signupBtn" class="auth-btn">회원가입</button>
                `;
                questionForm.style.display = 'none';
            }
        }

        // 로그아웃 함수
        function logout() {
            firebase.auth().signOut();
        }

        // Firestore 컬렉션 참조
        const questionsRef = db.collection('questions');

        // 질문 폼 제출 이벤트 리스너
        questionForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const subject = subjectInput.value;
            const title = titleInput.value;
            const content = contentInput.value;
            
            if (!subject || !title || !content) {
                alert('모든 필드를 입력해주세요.');
                return;
            }
            
            try {
                await questionsRef.add({
                    subject,
                    title,
                    content,
                    date: firebase.firestore.FieldValue.serverTimestamp(),
                    userName: '익명 사용자',
                    answers: []
                });
                
                questionForm.reset();
            } catch (error) {
                console.error("Error adding question: ", error);
                alert("질문 등록 중 오류가 발생했습니다.");
            }
        });

        // 질문 목록 업데이트 함수
        function updateQuestionsList() {
            if (!questionsList) {
                console.error('questionsList element not found');
                return;
            }
            
            questionsList.innerHTML = '';
            
            questionsRef.orderBy('date', 'desc').onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const question = change.doc.data();
                        const questionId = change.doc.id;
                        
                        const questionElement = document.createElement('div');
                        questionElement.className = 'question-item';
                        questionElement.innerHTML = `
                            <h3>${question.title}</h3>
                            <div class="question-meta">
                                <span>교과목: ${question.subject}</span>
                                <span> | </span>
                                <span>작성자: ${question.userName}</span>
                                <span> | </span>
                                <span>작성일: ${question.date ? question.date.toDate().toLocaleString() : '방금'}</span>
                            </div>
                            <div class="question-content">${question.content}</div>
                            <div class="answers-list">
                                ${question.answers ? question.answers.map(answer => `
                                    <div class="answer-item">
                                        <p>${answer.content}</p>
                                        <small>작성자: ${answer.userName} | 작성일: ${answer.date ? answer.date.toDate().toLocaleString() : '방금'}</small>
                                    </div>
                                `).join('') : ''}
                            </div>
                            <div class="answer-form">
                                <textarea placeholder="답변을 작성하세요"></textarea>
                                <button onclick="addAnswer('${questionId}', this.previousElementSibling.value)">답변 등록</button>
                            </div>
                        `;
                        
                        questionsList.appendChild(questionElement);
                    }
                });
            }, (error) => {
                console.error("Error listening to questions: ", error);
                alert("질문 목록을 불러오는 중 오류가 발생했습니다.");
            });
        }

        // 답변 추가 함수
        window.addAnswer = async function(questionId, content) {
            if (!content || !content.trim()) {
                alert('답변 내용을 입력해주세요.');
                return;
            }
            
            try {
                const questionRef = questionsRef.doc(questionId);
                const questionDoc = await questionRef.get();
                
                if (!questionDoc.exists) {
                    alert('질문을 찾을 수 없습니다.');
                    return;
                }
                
                const question = questionDoc.data();
                const answers = question.answers || [];
                
                answers.push({
                    content,
                    date: firebase.firestore.FieldValue.serverTimestamp(),
                    userName: '익명 사용자'
                });
                
                await questionRef.update({
                    answers: answers
                });
            } catch (error) {
                console.error("Error adding answer: ", error);
                alert("답변 등록 중 오류가 발생했습니다.");
            }
        }

        // 초기 질문 목록 업데이트
        updateQuestionsList();
    });
}
