let firstNumber = "";
let operator = "";
let secondNumber = "";

let memory = 0;

const display = document.getElementById("display");


// ================================
// ADD NUMBER
// ================================

function addNumber(number) {

    if (operator === "") {

        firstNumber = firstNumber + number;

        display.value = firstNumber;

    } else {

        secondNumber = secondNumber + number;

        display.value = secondNumber;
    }
}


// ================================
// CHOOSE OPERATOR
// ================================

function chooseOperator(selectedOperator) {

    if (firstNumber === "") {
        return;
    }

    operator = selectedOperator;
}


// ================================
// CALCULATE
// ================================

async function calculate() {

    if (
        firstNumber === "" ||
        operator === "" ||
        secondNumber === ""
    ) {
        return;
    }


    let data = {

        num1: Number(firstNumber),

        num2: Number(secondNumber),

        operator: operator
    };


    try {

        let response = await fetch(
           "https://calculator-python-pq1x.onrender.com",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            }
        );


        let result = await response.json();


        if (result.error) {

            display.value = result.error;

            return;
        }


        display.value = result.result;


        firstNumber = result.result.toString();

        secondNumber = "";

        operator = "";


        loadHistory();

    }
    catch (error) {

        display.value = "Backend Error";

        console.log(error);
    }
}


// ================================
// CLEAR CALCULATOR
// ================================

function clearDisplay() {

    firstNumber = "";

    secondNumber = "";

    operator = "";

    display.value = "0";
}


// ================================
// DELETE
// ================================

function deleteNumber() {

    if (operator === "") {

        firstNumber =
            firstNumber.slice(0, -1);

        display.value =
            firstNumber || "0";

    } else {

        secondNumber =
            secondNumber.slice(0, -1);

        display.value =
            secondNumber || "0";
    }
}


// ================================
// MEMORY - M+
// ================================

function memoryAdd() {

    let currentValue =
        Number(display.value);


    if (isNaN(currentValue)) {
        return;
    }


    memory = memory + currentValue;

    console.log(
        "Memory:",
        memory
    );
}


// ================================
// MEMORY - MR
// ================================

function memoryRecall() {

    display.value = memory;


    firstNumber =
        memory.toString();

    secondNumber = "";

    operator = "";
}


// ================================
// MEMORY - MC
// ================================

function memoryClear() {

    memory = 0;

    console.log(
        "Memory cleared"
    );
}


// ================================
// LOAD HISTORY
// ================================

async function loadHistory() {

    try {

        let response = await fetch(
            "http://127.0.0.1:8000/history"
        );


        let history = await response.json();


        let historyList =
            document.getElementById("history");


        historyList.innerHTML = "";


        if (history.length === 0) {

            historyList.innerHTML = `
                <div class="empty-history">

                    <div class="empty-icon">
                        ⌁
                    </div>

                    <p>
                        No calculations yet
                    </p>

                    <span>
                        Your calculations will appear here.
                    </span>

                </div>
            `;

            return;
        }


        history.forEach(function(item) {

            let row =
                document.createElement("div");


            row.className =
                "history-item";


            let expression =
                document.createElement("div");


            expression.className =
                "history-expression";


            expression.textContent =
                item.num1 +
                " " +
                item.operator +
                " " +
                item.num2;


            let result =
                document.createElement("div");


            result.className =
                "history-result";


            result.textContent =
                "= " + item.result;


            row.appendChild(expression);

            row.appendChild(result);


            historyList.appendChild(row);

        });

    }
    catch (error) {

        console.log(error);
    }
}


// ================================
// OPEN HISTORY
// ================================

function openHistory() {

    document
        .getElementById("historyPanel")
        .classList.add("active");
}


// ================================
// CLOSE HISTORY
// ================================

function closeHistory() {

    document
        .getElementById("historyPanel")
        .classList.remove("active");
}


// ================================
// CLEAR HISTORY
// ================================

async function clearHistory() {

    let confirmClear = confirm(
        "Are you sure you want to clear all history?"
    );


    if (!confirmClear) {

        return;
    }


    try {

        let response = await fetch(
            "http://127.0.0.1:8000/history",
            {
                method: "DELETE"
            }
        );


        let result = await response.json();


        console.log(result.message);


        loadHistory();

    }
    catch (error) {

        console.log(error);
    }
}


// ================================
// KEYBOARD SUPPORT
// ================================

document.addEventListener(
    "keydown",
    function(event) {

        const key = event.key;


        if (
            key >= "0" &&
            key <= "9"
        ) {

            addNumber(key);
        }


        else if (
            key === "+" ||
            key === "-" ||
            key === "*" ||
            key === "/" ||
            key === "%"
        ) {

            chooseOperator(key);
        }


        else if (
            key === "Enter"
        ) {

            calculate();
        }


        else if (
            key === "Backspace"
        ) {

            deleteNumber();
        }


        else if (
            key === "Escape"
        ) {

            clearDisplay();
        }

    }
);


// ================================
// START
// ================================

loadHistory();