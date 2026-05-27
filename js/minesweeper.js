/*----- classes -----*/
class  Cell {
    constructor(row, col, board) {
        this.row = row;
        this.col = col;
        this.bomb = false;
        this.board = board;
        this.revealed = false;
        this.flagged = false;
    }

    getAdjCells() {
        var adj = [];
        var lastRow = this.board.length - 1;
        var lastCol = this.board[0].length - 1;
        if (this.row > 0 && this.col > 0) adj.push(this.board[this.row - 1][this.col - 1]);
        if (this.row > 0) adj.push(this.board[this.row - 1][this.col]);
        if (this.row > 0 && this.col < lastCol) adj.push(this.board[this.row - 1][this.col + 1]);
        if (this.col < lastCol) adj.push(this.board[this.row][this.col + 1]);
        if (this.row < lastRow && this.col < lastCol) adj.push(this.board[this.row + 1][this.col + 1]);
        if (this.row < lastRow) adj.push(this.board[this.row + 1][this.col]);
        if (this.row < lastRow && this.col > 0) adj.push(this.board[this.row + 1][this.col - 1]);
        if (this.col > 0) adj.push(this.board[this.row][this.col - 1]);       
        return adj;
    }

    calcAdjBombs() {
        var adjCells = this.getAdjCells();
        var adjBombs = adjCells.reduce(function(acc, cell) {
            return acc + (cell.bomb ? 1 : 0);
        }, 0);
        this.adjBombs = adjBombs;
    }

    flag() {
        if (!this.revealed) {
            this.flagged = !this.flagged;
            return this.flagged;
        }
    }

    reveal() {
        if (this.revealed && !hitBomb) return;
        this.revealed = true;

        if (firstClick) {
          placeMines(this.row, this.col);
          firstClick = false;
        }

        if (this.bomb) return true;


        if (this.adjBombs === 0) {
            var adj = this.getAdjCells();
            adj.forEach(function(cell){
                if (!cell.revealed) cell.reveal();
            });
        }
        return false;
    }

        chord() {
        if (!this.revealed || this.adjBombs === 0) return false;

        const adj = this.getAdjCells();
        const flaggedCount = adj.filter(c => c.flagged).length;

        if (flaggedCount === this.adjBombs) {
            for (let c of adj) {
                if (!c.flagged && !c.revealed) {
                    if (c.reveal()) return true; // hit bomb unexpectedly
                }
            }
        }
        return false;
    }
}

/*----- constants -----*/
var bombImage = '<img src="images/Minesweeper/bomb.png">';
var flagImage = '<img src="images/Minesweeper/flag.png">';
var wrongBombImage = '<img src="images/Minesweeper/flag.png">'
/*
var sizeLookup = {
  '9': {totalBombs: 10, tableWidth: '245px'},
  '16': {totalBombs: 40, tableWidth: '420px'},
  '30': {totalBombs: 99, tableWidth: '794px'}
};
*/

var sizeLookup = {
  '9':  { rows: 9,  cols: 9,  totalBombs: 10, tableWidth: '245px' },
  '16': { rows: 16, cols: 16, totalBombs: 40, tableWidth: '420px' },
  '30': { rows: 16, cols: 30, totalBombs: 99, tableWidth: '794px' }
};

var currentMode = '9';

var colors = [
  '',
  '#0000FA',
  '#4B802D',
  '#DB1300',
  '#202081',
  '#690400',
  '#457A7A',
  '#1B1B1B',
  '#7A7A7A',
];

/*----- app's state (variables) -----*/
//var size = 16;
var rows = 9;
var cols = 9;
var board;
var bombCount;
var timeElapsed;
var adjBombs;
var hitBomb;
var elapsedTime;
var timerId;
var winner;
let firstClick = true;
let mouseIsDown = false;
let heldCell = null;


/*----- cached element references -----*/
var boardEl = document.getElementById('board');

/*----- event listeners -----*/
document.getElementById('size-btns').addEventListener('click', function(e) {
  //size = parseInt(e.target.id.replace('size-', ''));
  var key = e.target.id.replace('size-', '');
  currentMode = key;
  rows = sizeLookup[key].rows;
  cols = sizeLookup[key].cols;
  init();
  render();
});


boardEl.addEventListener("mousedown", (e) => {
  if (e.button !== 0) return;
  if (hitBomb || winner) return;

  const td = e.target.closest("td");
  if (!td || !td.classList.contains("game-cell")) return;

  mouseIsDown = true;
  clearHolding();

  const row = parseInt(td.dataset.row);
  const col = parseInt(td.dataset.col);
  const cell = board[row][col];

  if (!cell.revealed && !cell.flagged) {
    
    td.classList.add("holding");
  }

  if (cell.revealed && cell.adjBombs > 0 && e.button === 0) {
    heldCell = cell;
    highlightNeighbors(cell, true);
  }
});


boardEl.addEventListener("mouseover", (e) => {
  if (!mouseIsDown) return;
  

  const td = e.target.closest("td");
  if (!td || !td.classList.contains("game-cell")) return;

  const row = parseInt(td.dataset.row);
  const col = parseInt(td.dataset.col);
  const cell = board[row][col];

  clearHolding();

  if (!cell.revealed && !cell.flagged) {
     heldCell = cell;
    td.classList.add("holding");
  }

    if (cell.revealed && !cell.flagged) {
    highlightNeighbors(cell, true);

  }
});

boardEl.addEventListener("mouseup", (e) => {
  if (!mouseIsDown) return;

  mouseIsDown = false;
  clearHolding();

  const td = e.target.closest("td");
  if (!td || !td.classList.contains("game-cell")) return;

  const row = parseInt(td.dataset.row);
  const col = parseInt(td.dataset.col);
  const cell = board[row][col];

  if (hitBomb || winner) return;

  // 🔹 Normal reveal
  if (!cell.revealed && !cell.flagged && e.button === 0) {
    if (!timerId) setTimer();

    hitBomb = cell.reveal();

    if (hitBomb) {
      revealAll();
      clearInterval(timerId);

      // Directly color the bomb clicked
      td.style.backgroundColor = "#ff000075";
    }

    winner = getWinner();
    if (winner) {
    handleWin();
}
    render();
  }

  // 🔹 Chord reveal
  else if (cell.revealed && cell.adjBombs > 0 && e.button === 0) {
    highlightNeighbors(cell, false);
    hitBomb = cell.chord();

    if (hitBomb) {
      revealAll();
      clearInterval(timerId);

      // Find the bomb that caused the hit
      const adj = cell.getAdjCells();
      const bombCell = adj.find(c => c.revealed && c.bomb);
      if (bombCell) {
        const bombTd = document.querySelector(
          `[data-row="${bombCell.row}"][data-col="${bombCell.col}"]`
        );
        if (bombTd) bombTd.style.backgroundColor = "#ff000075";
      }
    }

    winner = getWinner();
    render();
  }
});

// Remove all highlights
function clearHolding() {
  document.querySelectorAll(".holding, .highlighted").forEach(td => {
    td.classList.remove("holding");
    td.classList.remove("highlighted");
  });
}


boardEl.addEventListener("mouseleave", () => {
  document.querySelectorAll(".holding")
    .forEach(td => td.classList.remove("holding"));
});



boardEl.addEventListener('click', function(e) {
  if (winner || hitBomb) return;
  var clickedEl;
  clickedEl = e.target.tagName.toLowerCase() === 'img' ? e.target.parentElement : e.target;
  if (!clickedEl.classList.contains('game-cell')) return;
    if (!timerId) setTimer();
    var row = parseInt(clickedEl.dataset.row);
    var col = parseInt(clickedEl.dataset.col);
    var cell = board[row][col];
    
    hitBomb = cell.reveal();
    if (hitBomb) {
      revealAll();
      clearInterval(timerId);
      clickedEl.style.backgroundColor = '#ff000075';
      //e.target.style.backgroundColor = 'red';
    }
    winner = getWinner();
    render();
});

boardEl.addEventListener('contextmenu', function(e) {
  e.preventDefault();
  if (winner || hitBomb) return;
  var clickedEl = e.target.tagName.toLowerCase() === 'img' ? e.target.parentElement : e.target;
  if (!clickedEl.classList.contains('game-cell')) return;
  
  var row = parseInt(clickedEl.dataset.row);
  var col = parseInt(clickedEl.dataset.col);
  var cell = board[row][col];
  
  if (!cell.revealed && bombCount > 0) {
    bombCount += cell.flag() ? -1 : 1;
  }
  render();
});


function createResetListener() { 
  document.getElementById('reset').addEventListener('click', function() {
    init();
    render();
  });
}

/*----- functions -----*/
/*function setTimer () {
  timerId = setInterval(function(){
    elapsedTime += 1;
    document.getElementById('timer').innerText = elapsedTime.toString().padStart(3, '0');
  }, 1000);
}
*/

function setTimer () {
  timerId = setInterval(function() {

    if (elapsedTime >= 999) {
      elapsedTime = 999;              // lock at 999
      document.getElementById('timer').innerText = '999';
      clearInterval(timerId);         // stop timer
      return;
    }

    elapsedTime += 1;

    document.getElementById('timer').innerText =
      elapsedTime.toString().padStart(3, '0');

  }, 1000);
}


function revealAll() {
  board.forEach(function(rowArr) {
    rowArr.forEach(function(cell) {
      cell.reveal();
    });
  });
}

function placeMines(firstRow, firstCol) {
    var totalBombs = sizeLookup[currentMode].totalBombs;

    while (totalBombs > 0) {
        let row = Math.floor(Math.random() * rows);
        let col = Math.floor(Math.random() * cols);
        let cell = board[row][col];

        // Skip the first clicked cell and its neighbors
        let firstCell = board[firstRow][firstCol];
        let forbidden = [firstCell];

        if (!cell.bomb && !forbidden.includes(cell)) {
            cell.bomb = true;
            totalBombs--;
        }
    }

    // Recalculate adjBombs for all cells
    runCodeForAllCells(function(c) {
        c.calcAdjBombs();
    });
}
function highlightNeighbors(cell, highlight) {
    cell.getAdjCells().forEach(c => {
        if (!c.revealed && !c.flagged) {
            const td = document.querySelector(`[data-row="${c.row}"][data-col="${c.col}"]`);
            if (td) {
                if (highlight) td.classList.add('highlighted');
                else td.classList.remove('highlighted');
            }
        }
    });
}

function buildTable() {
  var topRow = `
    </tr>
      <tr>
        <td class="menu" colspan="${cols}">
            <section id="status-bar">
              <div id="bomb-counter">000</div>
              <div id="reset"><img src="images/Minesweeper/smile.png"></div>
              <div id="timer">000</div>
            </section>
        </td>
      </tr>
    `;
  boardEl.innerHTML = topRow + `<tr>${'<td class="game-cell"></td>'.repeat(cols)}</tr>`.repeat(rows);
  boardEl.style.width = sizeLookup[currentMode].tableWidth;
  createResetListener();
  var cells = Array.from(document.querySelectorAll('td:not(.menu)'));
  cells.forEach(function(cell, idx) {
    cell.setAttribute('data-row', Math.floor(idx / cols));
    cell.setAttribute('data-col', idx % cols);
  });
}

function buildArrays() {
  var arr = Array(rows).fill(null);
  arr = arr.map(function() {
    return new Array(cols).fill(null);
  });
  return arr;
}

function buildCells(){
  board.forEach(function(rowArr, rowIdx) {
    rowArr.forEach(function(slot, colIdx) {
      board[rowIdx][colIdx] = new Cell(rowIdx, colIdx, board);
    });
  });
  //addBombs();
  runCodeForAllCells(function(cell){
    cell.calcAdjBombs();
  });
}

function init() {
  buildTable();
  board = buildArrays();
  buildCells();
  bombCount = sizeLookup[currentMode].totalBombs;
  elapsedTime = 0;
  clearInterval(timerId);
  timerId = null;
  hitBomb = false;
  firstClick = true;
  winner = false;
};

function getBombCount() {
  var count = 0;
  board.forEach(function(row){
    count += row.filter(function(cell) {
      return cell.bomb;
    }).length
  });
  return count;
}

/*
function addBombs() {
  var currentTotalBombs = sizeLookup[`${currentMode}`].totalBombs;
  while (currentTotalBombs !== 0) {
    var row = Math.floor(Math.random() * rows);
    var col = Math.floor(Math.random() * cols);
    var currentCell = board[row][col]
    if (!currentCell.bomb){
      currentCell.bomb = true
      currentTotalBombs -= 1
    }
  }
}
*/

function handleWin() {
    // Mark all remaining bombs as flagged
    board.forEach(row => {
        row.forEach(cell => {
            if (!cell.revealed && cell.bomb) {
                cell.flagged = true;
            }
        });
    });

    winner = true;        // sets winner state
    clearInterval(timerId); // stop timer
    render();             // render board with flags
}


function getWinner() {
  for (var row = 0; row<board.length; row++) {
    for (var col = 0; col<board[0].length; col++) {
      var cell = board[row][col];
      if (!cell.revealed && !cell.bomb) return false;
    }
  } 
  return true;
}

function render() {
  document.getElementById('bomb-counter').innerText = bombCount.toString().padStart(3, '0');

  const tdList = Array.from(document.querySelectorAll('[data-row]'));
  tdList.forEach(td => {
    const rowIdx = parseInt(td.getAttribute('data-row'));
    const colIdx = parseInt(td.getAttribute('data-col'));
    const cell = board[rowIdx][colIdx];

    td.className = 'game-cell';

    // Highlights cells
    if (td.classList.contains('highlighted')) td.classList.add('highlighted');

    // Revealed cells
    if (cell.revealed) {
      td.classList.add('revealed');
      td.style.color = cell.adjBombs > 0 ? colors[cell.adjBombs] : '';
      if (cell.bomb) {
        td.innerHTML = bombImage;
      } else if (cell.adjBombs > 0) {
        td.textContent = cell.adjBombs;
      } else {
        td.textContent = '';
      }
    }
    // Flagged but not revealed
    else if (cell.flagged) {
      td.innerHTML = flagImage;
    }
    // Unrevealed and unflagged
    else {
      td.innerHTML = '';
      td.textContent = '';
    }
  });

  if (hitBomb) {
    document.getElementById('reset').innerHTML = '<img src="images/Minesweeper/sad.png">';
    runCodeForAllCells(cell => {
      if (!cell.bomb && cell.flagged) {
        const td = document.querySelector(`[data-row="${cell.row}"][data-col="${cell.col}"]`);
        td.innerHTML = wrongBombImage;
        td.style.backgroundColor = '#ff000075';
      }
    });
  } else if (winner) {
    document.getElementById('reset').innerHTML = '<img src="images/Minesweeper/excited.png">';
    clearInterval(timerId);
  }
}


function runCodeForAllCells(cb) {
  board.forEach(function(rowArr) {
    rowArr.forEach(function(cell) {
      cb(cell);
    });
  });
}


const zoomSelect = document.getElementById('zoom-select');
const gameBoard = document.querySelector('.game-board');

zoomSelect.addEventListener('change', (e) => {
    const scale = parseFloat(e.target.value);
    gameBoard.style.zoom = scale;
});


init();
render();

const buttons = document.querySelectorAll(".level_button");

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    
    // remove selected from all
    buttons.forEach(b => b.classList.remove("selected"));
    
    // add selected to clicked one
    btn.classList.add("selected");
    
  });
});