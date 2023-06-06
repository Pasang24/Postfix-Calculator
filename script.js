const lowerScreen = document.querySelector(".lower-screen");
const upperScreen = document.querySelector(".upper-screen");
const values = document.querySelectorAll(".value");
const clearBtn = document.querySelector(".clear");
const delBtn = document.querySelector(".del");
const equalBtn = document.querySelector(".equal");
const openParanthesis = document.querySelector(".open-paranthesis");
const closeParanthesis = document.querySelector(".close-paranthesis");
const dotBtn = document.querySelector(".dot");
const operator1 = document.querySelectorAll(".op");
const operator2 = document.querySelectorAll(".op1");
const allBtn = document.querySelectorAll("button");
const historyBtn = document.querySelector(".history-btn");
const clearHistoryBtn = document.querySelector(".clearHistory-btn");
const historyEl = document.querySelector(".history-container");
let showHistory = false;
let history = JSON.parse(localStorage.getItem("calculatorHistory"));
if (!history) history = [];
let infix = "";
let paranthesisCount = 0;
let operatorBefore = true;
for (let i = 0; i < values.length; i++) {
  values[i].addEventListener("click", () => {
    if (
      (infix.length === 0 || !isClosing(infix[infix.length - 1])) &&
      infix[0] != "I"
    ) {
      upperScreen.innerText = "";
      infix += values[i].innerText;
      lowerScreen.innerText = infix;
    }
  });
}
for (let i = 0; i < operator1.length; i++) {
  operator1[i].addEventListener("click", () => {
    if (
      infix.length !== 0 &&
      ((isOperand(infix[infix.length - 1]) &&
        infix[infix.length - 1] !== ".") ||
        isClosing(infix[infix.length - 1]))
    ) {
      upperScreen.innerText = "";
      infix += operator1[i].innerText;
      lowerScreen.innerText = infix;
      operatorBefore = true;
    }
  });
}
for (let i = 0; i < operator2.length; i++) {
  operator2[i].addEventListener("click", () => {
    if (
      infix.length == 0 ||
      (isOperand(infix[infix.length - 1]) && infix[infix.length - 1] !== ".") ||
      isOpening(infix[infix.length - 1]) ||
      isClosing(infix[infix.length - 1])
    ) {
      upperScreen.innerText = "";
      infix += operator2[i].innerText;
      lowerScreen.innerText = infix;
      operatorBefore = true;
    }
  });
}
dotBtn.addEventListener("click", () => {
  if (
    infix.length !== 0 &&
    operatorBefore &&
    isOperand(infix[infix.length - 1])
  ) {
    upperScreen.innerText = "";
    infix += ".";
    lowerScreen.innerText = infix;
    operatorBefore = false;
  }
});
openParanthesis.addEventListener("click", () => {
  if (
    infix.length === 0 ||
    isOperator(infix[infix.length - 1]) ||
    isOpening(infix[infix.length - 1])
  ) {
    upperScreen.innerText = "";
    infix += "(";
    lowerScreen.innerText = infix;
    paranthesisCount++;
  }
});
closeParanthesis.addEventListener("click", () => {
  if (
    (!isNaN(+infix[infix.length - 1]) || isClosing(infix[infix.length - 1])) &&
    paranthesisCount - 1 >= 0
  ) {
    upperScreen.innerText = "";
    infix += ")";
    lowerScreen.innerText = infix;
    paranthesisCount--;
  }
});
clearBtn.addEventListener("click", () => {
  infix = "";
  lowerScreen.innerText = "";
  upperScreen.innerText = "";
  paranthesisCount = 0;
  operatorBefore = true;
});
delBtn.addEventListener("click", () => {
  if (infix[0] === "I") return;
  if (infix[infix.length - 1] === ")") paranthesisCount++;
  else if (infix[infix.length - 1] === "(") paranthesisCount--;
  else if (infix[infix.length - 1] === ".") operatorBefore = true;
  else if (isOperator(infix[infix.length - 1])) operatorBefore = false;
  infix = infix.slice(0, -1);
  upperScreen.innerText = "";
  lowerScreen.innerText = infix;
});
equalBtn.addEventListener("click", () => {
  if (infix === "") return;
  else if (checkParanthesis(infix)) {
    let ans = calculate(convert(infix));
    if (isNaN(ans)) return;
    else {
      upperScreen.innerText = infix;
      lowerScreen.innerText = ans;
      //storing values of input and output in two variables to store in history array
      const input = infix;
      const output = ans;
      infix = lowerScreen.innerText;
      paranthesisCount = 0;
      operatorBefore = !infix.includes(".");
      if (history.length === 0 || history[history.length - 1].input !== input) {
        history.push({ input, output });
        localStorage.setItem("calculatorHistory", JSON.stringify(history));
        setHistory();
      }
    }
  }
});
//This section is for the conversion of infix to postfix and it's calculation
function isOperand(char) {
  return parseInt(char, 10) <= 9 || char === ".";
}
function isOperator(char) {
  return char === "+" || char === "-" || char === "×" || char === "÷";
}
function isOpening(char) {
  return char === "(";
}
function isClosing(char) {
  return char === ")";
}
function priority(char) {
  if (char === "(") return 3;
  else if (char === "÷" || char === "×") return 2;
  else if (char === "+" || char === "-") return 1;
}
function checkParanthesis(infix) {
  let stack = [];
  let isBalanced = true;
  for (let i = 0; i < infix.length; i++) {
    if (infix[i] === "(") stack.push(infix[i]);
    else if (infix[i] === ")") {
      if (stack.length !== 0) stack.pop();
      else {
        isBalanced = false;
        break;
      }
    }
  }
  if (isBalanced && stack.length !== 0) isBalanced = false;

  return isBalanced;
}
function convert(infix) {
  let stack = [];
  let postfix = "";
  for (let i = 0; i < infix.length; i++) {
    if (isOperand(infix[i])) {
      postfix += infix[i];
      if (
        isOperator(infix[i + 1]) ||
        isClosing(infix[i + 1]) ||
        i === infix.length - 1
      )
        postfix += " ";
    } else if (isOperator(infix[i]) || isOpening(infix[i])) {
      if (
        (infix[i] === "-" || infix[i] === "+") &&
        (postfix.length === 0 || infix[i - 1] === "(")
      )
        postfix += infix[i];
      else {
        while (
          stack.length !== 0 &&
          priority(stack[stack.length - 1]) >= priority(infix[i]) &&
          !isOpening(stack[stack.length - 1])
        )
          postfix = postfix + stack.pop() + " ";
        stack.push(infix[i]);
      }
    } else if (isClosing(infix[i])) {
      while (stack[stack.length - 1] !== "(")
        postfix = postfix + stack.pop() + " ";
      stack.pop();
    }
  }
  while (stack.length !== 0) postfix = postfix + stack.pop() + " ";

  return postfix.split(" ").slice(0, -1);
}
function operation(operand1, operand2, operator) {
  if (operator === "+") return operand1 + operand2;
  else if (operator === "-") return operand1 - operand2;
  else if (operator === "×") return operand1 * operand2;
  else if (operator === "÷") return operand1 / operand2;
}
function calculate(postfix) {
  let stack = [];
  let operand1;
  let operand2;
  let newOperand;
  for (let i = 0; i < postfix.length; i++) {
    if (!isNaN(parseFloat(postfix[i]))) stack.push(parseFloat(postfix[i]));
    else if (isOperator(postfix[i])) {
      operand2 = stack.pop();
      operand1 = stack.pop();
      newOperand = operation(operand1, operand2, postfix[i]);
      stack.push(newOperand);
    }
  }
  return stack.pop();
}

//This section is for storing and showing history on user interaction

historyBtn.addEventListener("click", () => {
  if (!showHistory) {
    showHistory = true;
    historyBtn.innerText = "Keypad";
    historyEl.classList.add("slide-historyBar");
    clearHistoryBtn.classList.add("toggle-btn-display");
    historyEl.scrollTop = historyEl.scrollHeight;
  } else {
    showHistory = false;
    historyBtn.innerText = "History";
    historyEl.classList.remove("slide-historyBar");
    clearHistoryBtn.classList.remove("toggle-btn-display");
  }
});

clearHistoryBtn.addEventListener("click", () => {
  history = [];
  localStorage.setItem("calculatorHistory", JSON.stringify(history));
  setHistory();
});

function setHistory() {
  let historyHTML = "";
  for (let i = 0; i < history.length; i++) {
    historyHTML += `
    <li class="history-item">
      <h4 class="history-input">${history[i].input}</h3>
      <h3 class="history-output">=${history[i].output}</h2>
      <hr>
    </li>`;
  }
  if (history.length === 0) historyHTML = `<h2>No History</h2>`;
  historyEl.innerHTML = historyHTML;
}

setHistory();

document.addEventListener("contextmenu", (event) => event.preventDefault());

allBtn.forEach((btn) => {
  btn.addEventListener("touchstart", () => btn.classList.add("changeColor"));
  btn.addEventListener("touchend", () => btn.classList.remove("changeColor"));
});
