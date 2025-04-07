// 질문 데이터를 저장할 배열
let questions = [];

// DOM 요소
const questionForm = document.getElementById('questionForm');
const questionsList = document.getElementById('questionsList');

// 질문 폼 제출 이벤트 리스너
questionForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const subject = document.getElementById('subject').value;
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    
    // 새 질문 객체 생성
    const newQuestion = {
        id: Date.now(),
        subject,
        title,
        content,
        date: new Date().toLocaleString(),
        answers: []
    };
    
    // 질문 배열에 추가
    questions.unshift(newQuestion);
    
    // 질문 목록 업데이트
    updateQuestionsList();
    
    // 폼 초기화
    questionForm.reset();
});

// 질문 목록 업데이트 함수
function updateQuestionsList() {
    questionsList.innerHTML = '';
    
    questions.forEach(question => {
        const questionElement = document.createElement('div');
        questionElement.className = 'question-item';
        questionElement.innerHTML = `
            <h3>${question.title}</h3>
            <div class="question-meta">
                <span>교과목: ${question.subject}</span>
                <span> | </span>
                <span>작성일: ${question.date}</span>
            </div>
            <div class="question-content">${question.content}</div>
            <div class="answers-list">
                ${question.answers.map(answer => `
                    <div class="answer-item">
                        <p>${answer.content}</p>
                        <small>작성일: ${answer.date}</small>
                    </div>
                `).join('')}
            </div>
            <div class="answer-form">
                <textarea placeholder="답변을 작성하세요"></textarea>
                <button onclick="addAnswer(${question.id}, this.previousElementSibling.value)">답변 등록</button>
            </div>
        `;
        
        questionsList.appendChild(questionElement);
    });
}

// 답변 추가 함수
function addAnswer(questionId, content) {
    if (!content.trim()) return;
    
    const question = questions.find(q => q.id === questionId);
    if (question) {
        question.answers.push({
            content,
            date: new Date().toLocaleString()
        });
        updateQuestionsList();
    }
}

// 초기 질문 목록 업데이트
updateQuestionsList();
