// Version 1.8

/*----- CONSTANTS -----*/

const playerLookup = {
    "-1": ["O", "red"],
    "0": [" ", "transparent"],
    "1": ["X", "blue"]
}

const winCombos = [
    [0, 1, 2],  // Horizontal
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],  // Vertical
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],  // Down diagonal
    [2, 4, 6]   // Up diagonal
];

const cornerTrap = [
    [0, 1, 3],
    [2, 1, 5],
    [6, 3, 7],
    [8, 5, 7]
];

const firstChance = 2;  // 1/firstChance odds of computer going first


/*----- STATE -----*/

let board;  // Array of column arrays of -1, 0, or 1
let turn;   // -1 or 1
let winner; // -1, 0 (none), 1, or 2 (tie)
let pc;     // 0 or 1
let start;  // 0 or 1


/*----- CACHE -----*/

const spaces = document.getElementById("spaces");
const spaceEls = [...document.querySelectorAll("#spaces > div")];
const msgEl = document.getElementById("msg");
const reset = document.getElementById("reset");
const buttonEls = [...document.querySelectorAll("#buttons > button")];
const buttons = document.getElementById("buttons");
const gameBlock = document.getElementById("game");


/*----- LISTENERS -----*/

spaces.addEventListener("click", playerClick);
reset.addEventListener("click", init);
buttons.addEventListener("click", startClick);
spaces.addEventListener("mouseover", showHint);
spaces.addEventListener("mouseout", eraseHint);


/*----- FUNCTIONS -----*/

function init() {
    board = [
        0, 0, 0,  // Column 1
        0, 0, 0,  // Column 2
        0, 0, 0   // Column 3
    ];
    turn = 1;
    winner = 0;
    start = 0;
    pc = 0;
    render();
}

// Player choose mode
function startClick(evt) {
    const id = buttonEls.indexOf(evt.target);
    start = 1;

    // Set computer difficulty
    pc = id;

    // Check who goes first
    if (!Math.floor(Math.random() * firstChance)) {
        if (pc > 1) {
            pcTurn();
        } else pcTurn();
    }

    render();
}

// Player choose spot
function playerClick(evt) {
    const id = spaceEls.indexOf(evt.target);

    // Check if valid move
    if (winner || board[id] !== 0) return;

    board[id] = turn;
    checkWin();
    turn *= -1;
    if (!winner) pcTurn();
    render();
}

// Caller for computer logic
function pcTurn() {
    if (!pc) return;
    semiRandSpot();
    checkWin();
    turn *= -1;
}

// Fill random spot
function randSpot() {
    const id = Math.floor(Math.random() * 9);
    if (board[id]) randSpot();
    else board[id] = turn;
}

// Fill random corner
function randCorner() {
    const id = Math.floor(Math.random() * 5) * 2;
    if (board[id]) randCorner();
    else board[id] = turn;
}

// Computer logic
function semiRandSpot() {
    // Hard: baseline logic
    if (pc > 1) {
        if (checkLine(turn * 2)) return;    // Go for win
        if (checkLine(turn * -2)) return;   // Go for block
    }

    // Medium: take center
    if (pc > 1)
        if (!board[4]) {
            board[4] = turn;
            return;
        }

    // Impossible
    if (pc > 3) {
        // Take opposite corner
        for (let i = 0; i < 9; i += 2) {
            if (!board[i] && board[8 - i]) {
                board[i] = turn;
                return;
            }
        }

        // Go for trap
        if (board[4] === turn) {
            for (let i = 0; i < cornerTrap.length; i++) {
                if (board[cornerTrap[i][0]] === turn) {
                    for (let j = 1; j < 3; j++) {
                        if (!board[cornerTrap[i][j]]) {
                            board[cornerTrap[i][j]] = turn;
                            return;
                        }
                    }
                }
            }
        }

        // Take corner
        if (!board[0] || !board[2] || !board[6] || !board[8]) {
            randCorner();
            return;
        }
    }

    // Otherwise
    randSpot();
}

// Check line for completion
function checkLine(check) {
    for (let i = 0; i < winCombos.length; i++) {
        if (board[winCombos[i][0]] + board[winCombos[i][1]] + board[winCombos[i][2]] === check) {
            for (let j = 0; j < 3; j++) {
                if (!board[winCombos[i][j]]) {
                    board[winCombos[i][j]] = turn;
                    return true;
                }
            }
        }
    }
    return false;
}

function checkWin() {
    // Check for win
    for (let i = 0; i < winCombos.length; i++) {
        if (Math.abs(board[winCombos[i][0]] + board[winCombos[i][1]] + board[winCombos[i][2]]) === 3) {
            winner = turn;
            return;
        }
    }

    // Check for tie
    if (!board.includes(0)) winner = 2;
}

function render() {
    if (start) {
        // Hide start buttons
        buttons.style.display = "none";

        // Display game
        game.style.display = "block";

        // Display board
        spaces.style.display = "grid";

        // Display player turn or winner
        if (winner) {
            if (winner === 2) msgEl.innerHTML = `Tie Game!`;
            else msgEl.innerHTML = `<span style="color: ${playerLookup[winner][1]}">${playerLookup[winner][0]} Wins!`;
        } else msgEl.innerHTML = `<span style="color: ${playerLookup[turn][1]}">${playerLookup[turn][0]}'s</span>&nbsp;Turn`;

        // Fill board
        spaceEls.forEach((e, i) => {
            e.textContent = playerLookup[board[i]][0];
            e.style.color = playerLookup[board[i]][1];
        });

        // Display reset button
        if (winner) reset.style.display = "block";
    } else {
        buttons.style.display = "block";
        game.style.display = "none";
        spaces.style.display = "none";
        reset.style.display = "none";
    }
}

function showHint(evt) {
    const id = spaceEls.indexOf(evt.target);

    // Check if existing
    if (winner || board[id] !== 0) return;

    spaceEls[id].textContent = playerLookup[turn][0];
    spaceEls[id].style.color = "lightgrey";
}

function eraseHint(evt) {
    const id = spaceEls.indexOf(evt.target);

    // Check if existing
    if (winner || board[id] !== 0) return;

    spaceEls[id].textContent = playerLookup[0][0];
    spaceEls[id].style.color = "transparent";
}

init();