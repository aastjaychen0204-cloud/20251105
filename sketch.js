let table;
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let quizState = 'loading'; // 'loading', 'playing', 'finished', 'error'
let selectedQuestions = [];
let answerButtons = [];
let feedback = ''; // 用於顯示答案對錯
let feedbackColor = 0;
let feedbackTimer = 0;

// 在 preload() 中載入外部檔案，確保在 setup() 前完成
function preload() {
  // 確定您的 csv 檔案與 sketch.js 在同一個資料夾
  table = loadTable('quiz.csv', 'csv', 'header');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // 創建答案按鈕的結構
  for (let i = 0; i < 4; i++) {
    answerButtons.push({
      x: 0, // x, y, w, h 將在 drawQuestion 中動態計算
      y: 0,
      w: 0,
      h: 0,
      text: '',
      option: String.fromCharCode(65 + i) // 'A', 'B', 'C', 'D'
    });
  }
  
  if (table) {
    // 將表格資料轉換為物件陣列
    for (let row of table.getRows()) {
      questions.push(row.obj);
    }
    startQuiz();
  } else {
    quizState = 'error';
  }
}

// 當視窗大小改變時，自動調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function startQuiz() {
  score = 0;
  currentQuestionIndex = 0;
  feedback = '';
  // shuffle() 會隨機打亂陣列，我們取前三筆
  selectedQuestions = shuffle(questions).slice(0, 3);
  
  if (selectedQuestions.length < 3) {
      quizState = 'error'; // 如果題庫不足三題
      return;
  }
  
  loadQuestion();
  quizState = 'playing';
}

function loadQuestion() {
  if (currentQuestionIndex < selectedQuestions.length) {
    let q = selectedQuestions[currentQuestionIndex];
    answerButtons[0].text = q.optionA;
    answerButtons[1].text = q.optionB;
    answerButtons[2].text = q.optionC;
    answerButtons[3].text = q.optionD;
  } else {
    // 所有題目都回答完畢
    quizState = 'finished';
  }
}

function draw() {
  background(240, 245, 255); // 柔和的藍色背景

  if (quizState === 'loading') {
    textAlign(CENTER, CENTER);
    textSize(24);
    fill(100);
    text('測驗載入中...', width / 2, height / 2);
  } else if (quizState === 'error') {
    textAlign(CENTER, CENTER);
    textSize(18);
    fill(255, 0, 0);
    text('錯誤：無法載入 quiz.csv\n或題庫題目少於3題。', width / 2, height / 2);
  } else if (quizState === 'playing') {
    drawQuestion();
  } else if (quizState === 'finished') {
    drawResult();
  }
  
  // 顯示短暫的答案回饋 (答對/答錯)
  if (feedbackTimer > 0) {
    let alpha = map(feedbackTimer, 60, 0, 255, 0);
    fill(red(feedbackColor), green(feedbackColor), blue(feedbackColor), alpha);
    textSize(48);
    textAlign(CENTER, CENTER);
    text(feedback, width / 2, height / 2);
    feedbackTimer--;
    // 當回饋動畫結束後，跳到下一題
    if (feedbackTimer === 0) {
        currentQuestionIndex++;
        loadQuestion();
    }
  }
}

function drawQuestion() {
  if (currentQuestionIndex >= selectedQuestions.length) return;

  let q = selectedQuestions[currentQuestionIndex];
  
  // 顯示題目
  textAlign(LEFT, TOP);
  textSize(20);
  textFont('sans-serif'); // 確保使用預設字體
  fill(0);
  // 讓題目位置和寬度相對於畫布大小
  text(`第 ${currentQuestionIndex + 1} 題：\n${q.question}`, width * 0.15, height * 0.1, width * 0.7);

  // 繪製答案按鈕
  let btnWidth = width * 0.7;
  let btnHeight = height * 0.1;
  let btnStartX = width / 2 - btnWidth / 2;
  let btnStartY = height * 0.35;
  let btnSpacing = height * 0.12;

  for (let i = 0; i < answerButtons.length; i++) {
    let btn = answerButtons[i];
    btn.w = btnWidth;
    btn.h = btnHeight;
    btn.x = btnStartX;
    btn.y = btnStartY + i * btnSpacing;

    stroke(150);
    strokeWeight(2);
    // 檢查滑鼠是否懸停在按鈕上，產生互動效果
    if (mouseX > btn.x && mouseX < btn.x + btn.w && mouseY > btn.y && mouseY < btn.y + btn.h) {
      fill(220, 220, 255); // 懸停時變色
    } else {
      fill(255);
    }
    rect(btn.x, btn.y, btn.w, btn.h, 10);
    
    fill(0);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(16);
    text(`${btn.option}: ${btn.text}`, btn.x + 20, btn.y + btn.h / 2);
  }
}

function drawResult() {
  textAlign(CENTER, CENTER);
  textSize(36);
  fill(50, 50, 150);
  text(`測驗結束！`, width / 2, height * 0.2);
  
  textSize(28);
  fill(0);
  text(`你的成績: ${score} / 3`, width / 2, height * 0.4);

  let feedbackText = '';
  let feedbackMsgColor;
  if (score === 3) {
    feedbackText = '太完美了，全部答對！';
    feedbackMsgColor = color(0, 180, 0);
  } else if (score >= 1) {
    feedbackText = '不錯喔，再接再厲！';
    feedbackMsgColor = color(0, 0, 180);
  } else {
    feedbackText = '別灰心，下次會更好！';
    feedbackMsgColor = color(180, 0, 0);
  }
  textSize(22);
  fill(feedbackMsgColor);
  text(feedbackText, width / 2, height * 0.6);
  
  // 再玩一次按鈕
  let btn = { x: width/2 - 100, y: height * 0.75, w: 200, h: 50 };
  stroke(100);
  strokeWeight(2);
  if (mouseX > btn.x && mouseX < btn.x + btn.w && mouseY > btn.y && mouseY < btn.y + btn.h) {
      fill(200, 255, 200);
  } else {
      fill(230);
  }
  rect(btn.x, btn.y, btn.w, btn.h, 15);
  fill(0);
  noStroke();
  textSize(24);
  text('再玩一次', width / 2, btn.y + btn.h / 2);
}

function mousePressed() {
  // 只有在 'playing' 狀態且沒有回饋動畫時，才能回答問題
  if (quizState === 'playing' && feedbackTimer === 0) {
    for (let btn of answerButtons) {
      if (mouseX > btn.x && mouseX < btn.x + btn.w && mouseY > btn.y && mouseY < btn.y + btn.h) {
        let q = selectedQuestions[currentQuestionIndex];
        if (btn.option === q.answer.toUpperCase()) {
          score++;
          feedback = '答對了！';
          feedbackColor = color(0, 200, 0);
        } else {
          feedback = '答錯了！';
          feedbackColor = color(255, 0, 0);
        }
        feedbackTimer = 60; // 顯示回饋 1 秒 (假設 60 FPS)
        return; // 點擊後立即返回，避免重複觸發
      }
    }
  } else if (quizState === 'finished') {
      let btn = { x: width/2 - 100, y: height * 0.75, w: 200, h: 50 };
      if (mouseX > btn.x && mouseX < btn.x + btn.w && mouseY > btn.y && mouseY < btn.y + btn.h) {
          startQuiz(); // 點擊按鈕重新開始測驗
      }
  }
}
