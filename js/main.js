/*----- CONSTANTS -----*/

const playerLookup = {
    "-1": ["O", "red"],
    "0": [" ", "white"],
    "1": ["X", "blue"]
}

const firstChance = 2;


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

function startClick(evt) {
    const id = buttonEls.indexOf(evt.target);
    start = 1;

    pc = id;
    if (!Math.floor(Math.random() * firstChance)) {
        if (pc > 1) {
            pcTurn();
        } else pcTurn();
    }

    render();
}

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

function pcTurn() {
    if (!pc) return;
    semiRandSpot();
    checkWin();
    turn *= -1;
}

function randSpot() {
    const id = Math.floor(Math.random() * 9);
    if (board[id]) randSpot();
    else board[id] = turn;
}

function semiRandSpot() {
    const win = turn * 2;
    const block = turn * -2;

    // Medium: baseline logic
    if (pc > 1) {
        // Check down horizontal for win
        if (board[0] + board[4] + board[8] === win) {
            fillSpot(0, 4);
            return;
        }

        // Check up horizontal for win
        if (board[2] + board[4] + board[6] === win) {
            fillSpot(2, 2);
            return;
        }

        // Check horizontal for win
        for (let i = 0; i < 7; i += 3) {
            if (board[i] + board[i + 1] + board[i + 2] === win) {
                fillSpot(i, 1);
                return;
            }
        }

        // Check vertical for win
        for (let i = 0; i < 3; i++) {
            if (board[i] + board[i + 3] + board[i + 6] === win) {
                fillSpot(i, 3);
                return;
            }
        }

        // Check down horizontal for block
        if (board[0] + board[4] + board[8] === block) {
            fillSpot(0, 4);
            return;
        }

        // Check up horizontal for block
        if (board[2] + board[4] + board[6] === block) {
            fillSpot(2, 2);
            return;
        }

        // Check horizontal for block
        for (let i = 0; i < 7; i += 3) {
            if (board[i] + board[i + 1] + board[i + 2] === block) {
                fillSpot(i, 1);
                return;
            }
        }

        // Check vertical for block
        for (let i = 0; i < 3; i++) {
            if (board[i] + board[i + 3] + board[i + 6] === block) {
                fillSpot(i, 3);
                return;
            }
        }
    }

    // Hard: take center
    if (pc > 2)
        if (!board[4]) {
            board[4] = turn;
            return;
        }

    // Impossible
    if (pc > 3) {
        // Go for opposite corner
        if (!board[0] && board[8]) {
            board[0] = turn;
            return;
        }
        if (!board[2] && board[6]) {
            board[2] = turn;
            return;
        }
        if (!board[6] && board[2]) {
            board[6] = turn;
            return;
        }
        if (!board[8] && board[0]) {
            board[8] = turn;
            return;
        }

        //Go for trap
        if (board[4] === turn) {
            if (board[0] === turn) {
                if (!board[1]) {
                    board[1] = turn;
                    return;
                }
                if (!board[3]) {
                    board[3] = turn;
                    return;
                }
            }
            if (board[2] === turn) {
                if (!board[1]) {
                    board[1] = turn;
                    return;
                }
                if (!board[5]) {
                    board[5] = turn;
                    return;
                }
            }
            if (board[6] === turn) {
                if (!board[4]) {
                    board[4] = turn;
                    return;
                }
                if (!board[7]) {
                    board[7] = turn;
                    return;
                }
            }
            if (board[8] === turn) {
                if (!board[5]) {
                    board[5] = turn;
                    return;
                }
                if (!board[7]) {
                    board[7] = turn;
                    return;
                }
            }
        }

        //Go for corner
        for (let i = 0; i < 9; i += 2) {
            if (!board[i]) {
                board[i] = turn;
                return;
            }
        }
    }

    // Otherwise
    randSpot();
}

function fillSpot(start, add) {
    for (let i = start; i <= start + add * 2; i += add) {
        if (!board[i]) {
            board[i] = turn;
            return;
        }
    }
}

function checkWin() {
    const win = turn * 3;

    // Check for win
    if (board[0] + board[1] + board[2] === win      // Horizontal
        || board[3] + board[4] + board[5] === win
        || board[6] + board[7] + board[8] === win

        || board[0] + board[3] + board[6] === win   // Vertical
        || board[1] + board[4] + board[7] === win
        || board[2] + board[5] + board[8] === win

        || board[0] + board[4] + board[8] === win   // Down diagonal
        || board[2] + board[4] + board[6] === win)  // Up diagonal
    {
        winner = turn;
        return;
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
        } else msgEl.innerHTML = `<span style="color: ${playerLookup[turn][1]}">${playerLookup[turn][0]}'S</span>&nbsp;Turn`;

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

init();