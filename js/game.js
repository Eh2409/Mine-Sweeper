'use strict'

const MINE = '💥'
const MARK = '🚩'  
const EMPTY = ' '
const LIFE = '❤️'

const SMILEY = '😃'
const SMILEY_MINE = '🥵' 
const SMILEY_WIN = '🥳' 
const SMILEY_LOSE = '☠️' 

const MINE_NOT_ON = '💣'
const NOT_A_MINE = '❌'

var gBoard 
var gLevel 
var gGame 
var isMineOnBoard
var lestSize

// Preparation for the UNDO button
// var gHistory

function onInit(baordSize = lestSize) {
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
       }
    
    // The board size is passed to the function that determines the level properties
    gLevel = updateLevelProperties(baordSize)

    gBoard = buildBoard(gLevel.SIZE)
    console.table(gBoard)
    renderBoard(gBoard)

    isMineOnBoard = false
    updateRestartButtonSmiley()
    lifeCount()
    hintCount()
    resetTimer()
    safeClickCount()

    // If the player clicked the restart button the game will always remember what board level he was on
    lestSize = baordSize
    
    // If the player has reset the game or selected a different difficulty level after entering SetMineMode, these settings will take them out of this mode
    if (gSetMineMode || isMinesAreSet) {
    const elPlaySetMineBtn = document.querySelector('.play-set-main')
    elPlaySetMineBtn.classList.add('hide')
    gSetMineMode = false
    isMinesAreSet = false
    }
    
}

function updateLevelProperties(baordSize) {
    var res = []
    switch (baordSize) {
        case 4:
            res = {
                SIZE: 4,
                MINES: 2,
                LIVES:1,
                HINTS:1,
                SAFE_CLICK:1,
            }
            break;
    
        case 8:
            res = {
                SIZE: 8,
                MINES: 14,
                LIVES:2,
                HINTS:2,
                SAFE_CLICK:2,
            }
            break;

        case 12:
            res = {
                SIZE: 12,
                MINES: 32,
                LIVES:3,
                HINTS:3,
                SAFE_CLICK:3,
            }
            break;

    }

    return res
}

function buildBoard(size) {
    const board = []

    for (var i = 0; i < size; i++) {
        board.push([])
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0 ,
                isShown: false,
                isMine: false,
                isMarked: false }
        }
    }

    return board
}

function setMines(firstClickPos) {
    // A loop adds the mines according to their number
    for (var i = 0; i < gLevel.MINES; i++) {
        var emptyCells = findEmptyCells(firstClickPos)
        var randomCell = getRandomInt(0, emptyCells.length)
        var theChosenCell = emptyCells[randomCell]

        // Checks if the randomly selected cell is the cell that the player clicked on first and if so does not allow to select it
        // if (theChosenCell.i === firstClickPos.i && 
        //     theChosenCell.j === firstClickPos.j) continue

        //  Updates the mine on the board cell
        gBoard[theChosenCell.i][theChosenCell.j].isMine = true

    } 

    // board[1][1].isMine = true 
    // board[3][1].isMine = true 

    setMinesNegsCount()
    console.table(gBoard)
    return
}

function findEmptyCells(firstClickPos) {
    // Checks where there are empty cells, adds to the array of the location of empty cells so that later the game will be able to randomly choose which cells to place mines in
    var res = []
    for (var i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
          var currCell = gBoard [i][j]
          if (currCell.isMine) continue
          if (firstClickPos.i === i && firstClickPos.j === j ) continue
          res.push({i:i,j:j})
        }
    }
    return res
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]  /// Note to myself: check if this is useful later
            const className = `cell cell-${i}-${j}`

            strHTML += `<td class="${className} covered" 
            onclick=" onCellClicked(this,${i},${j})
            onCellClickedSetMine(this,${i},${j})" 
            onmousedown= "onCellMarked(this,${i},${j})"
            title="${className}">
            </td>`

        }
        strHTML += '</tr>'
    }
    const elContainer = document.querySelector('.board')
    elContainer.innerHTML = strHTML 
}

function updateRestartButtonSmiley(emotion = 'smiley') {  
    const elRestart = document.querySelector('.restart button')

    // Checks what the emotion is and updates the DOM

    switch (emotion) {
        case 'smiley':
            elRestart.innerText = SMILEY
            break;
    
        case 'mine':
            elRestart.innerText = SMILEY_MINE
            break;

        case 'lose':
            elRestart.innerText = SMILEY_LOSE
            break;

        case 'win':
            elRestart.innerText = SMILEY_WIN
            break;

        case 'set mine mode':
            elRestart.innerText = SET_MINE_MODE
            break;

        default:
            break;
    }
    
}

function setMinesNegsCount() {

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {

            if (gBoard[i][j].isMine) continue

            // Checks in a function how many neighboring mines the cell has and updates the information in the cell
            var mineNum = neighborMinesCount(i,j)
            gBoard[i][j].minesAroundCount = mineNum
        }  
    } 
}

function neighborMinesCount(rowIdx,colIdx) {
    // Checks how many neighboring mines the cell has
    var minesAroundCount = 0

    for (let i = rowIdx-1; i <= rowIdx +1 ; i++) {

        if (i < 0 || i >= gBoard.length) continue

        for (let j = colIdx -1; j <= colIdx +1; j++) {

            if (j < 0 || j >= gBoard[i].length) continue
            if (i === rowIdx && j === colIdx ) continue
            if (gBoard[i][j].isMine) minesAroundCount++
        }
    }

    return minesAroundCount
}

function onCellClicked(elCell,i,j) { 
    // Checks after clicking on a cell if the game is on and that the cell is not marked 
    if (!gGame.isOn) return
    if (elCell.isMarked) return
    if (gHintMode) {
        onCellClickedHintMode (elCell,i,j) 
        return
    }

    // Checks if this is the player's first click on a cell on the board so that the first cell does not contain mines and in order to scatter the mines on the board
    if (!isMineOnBoard && !gBoard[i][j].isMarked) {
        // Passes the location of the first clicked cell to the mine scatter function
        var firstClickPos = {i: i ,j: j }
        setMines(firstClickPos) 
        isMineOnBoard = true
        onTimer()

        if (gBoard[i][j].minesAroundCount === 0) {
            expandShown(gBoard, elCell,i, j)
            
        } else {
            // Updates the amount of neighboring mines on the cell
             elCell.innerText = gBoard[i][j].minesAroundCount

             // Updates that the cell is shown
             gGame.shownCount++
             gBoard[i][j].isShown = true

              // Removes the cover from the cell
              elCell.classList.remove('covered')
        }
    }

    // Checks that the cell is not shown yet
    if (!gBoard[i][j].isShown && !gBoard[i][j].isMarked &&!gHintMode) {
        // Checks that the cell does not contain a mine
        if (!gBoard[i][j].isMine) {
            if (gBoard[i][j].minesAroundCount === 0) {
                expandShown(gBoard, elCell,i, j)
            } else {
                // Updates that the cell is shown
                gBoard[i][j].isShown = true
                gGame.shownCount++

                //Updates the DOM of the cell
                elCell.classList.remove('covered')
                elCell.innerText = gBoard[i][j].minesAroundCount 
            }

            updateRestartButtonSmiley()

        } else {
            // Updates that the cell is shown
            gBoard[i][j].isShown = true
            gGame.shownCount++

            //Updates the DOM of the cell
            elCell.classList.remove('covered')
            elCell.classList.add('mine')
            elCell.innerText = MINE

            // Removes the mine from the number of mines to calculate the victory later
            gLevel.MINES -= 1

            // Updates life due to clicking on a mine
            lifeCount(1)

            updateRestartButtonSmiley('mine')
        } 
    }
    
    // Checks with each cell click if the game is over
    checkGameOver()
}

function expandShown(board, elCell,rowIdx, colIdx) {
    // When the player clicks on a cell with 0 neighboring mines, all the cells surrounding it will open until we reach a cell with neighboring mines

    for (let i = rowIdx-1; i <= rowIdx +1 ; i++) {

        if (i < 0 || i >= board.length) continue

         for (let j = colIdx -1; j <= colIdx +1; j++) {
            const elCurrCell =  document.querySelector(`.cell-${i}-${j}`)

            if (j < 0 || j >= board[i].length) continue
            if (i === rowIdx && j === colIdx && gBoard[i][j].minesAroundCount === 0 && !board[i][j].isShown){
                // Updates that the cell is shown
                gBoard[i][j].isShown = true
                gGame.shownCount++

                //Updates the DOM of the cell
                elCell.classList.remove('covered')
                elCell.innerText = ''

                if (gHintMode) {
                    gElCellAarry.push({elCell: elCell, i: i, j: j})
                }

            } else if  (!board[i][j].isMine && !board[i][j].isShown && gBoard[i][j].minesAroundCount === 0 && !board[i][j].isMarked ) {
                expandShown(board, elCurrCell,i, j)

            } else if (!board[i][j].isMine && !board[i][j].isShown && gBoard[i][j].minesAroundCount > 0 && !board[i][j].isMarked){
                // Updates that the cell is shown
                gBoard[i][j].isShown = true
                gGame.shownCount++

                //Updates the DOM of the cell
                elCurrCell.classList.remove('covered')
                elCurrCell.innerText = gBoard[i][j].minesAroundCount

                if (gHintMode) {
                    gElCellAarry.push({elCell: elCurrCell, i: i, j: j})
                }
            }
        }
    }
}

function onCellMarked(elCell,i,j){
    // Note to myself: check why there is a white bar on the event


    //Removes the menu when the right mouse button is pressed
    elCell.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    })

    if (!gGame.isOn) return


    if (!gBoard[i][j].isShown && !gBoard[i][j].isMarked && event.button === 2) {
        // Checks that the selected cell is not marked and updates the board and the DOM
        event.preventDefault()

        gBoard[i][j].isMarked = true
        gGame.markedCount++

        elCell.innerText = MARK

    
        checkGameOver()
    }  else if (!gBoard[i][j].isShown && gBoard[i][j].isMarked && event.button === 2){
        // If the selected cell is marked, removes the mark and updates the board and the DOM
        event.preventDefault()

        gBoard[i][j].isMarked = false
        gGame.markedCount--

        elCell.innerText = '' 

        checkGameOver()
    }

    if (gGame.isOn) {
        updateRestartButtonSmiley()
    }
}

function lifeCount(diff = 0) {
    // Updates the amount of lives
    gLevel.LIVES-=diff

    // Updates the DOM
     var strHTML = ''

     for (let i = 0; i < gLevel.LIVES; i++) {
        strHTML += LIFE
     }
     console.log(strHTML);
     
     var elLives = document.querySelector('.lives span')
     elLives.innerText = strHTML
}

function checkGameOver()  {
    
    // A function that checks for a win or loss

     const boardSize = Math.pow (gLevel.SIZE,2)

     //Checks if the player has lost
     if (gLevel.LIVES === 0) {
        gGame.isOn = false
        console.log('game end');

        UpdateLoseDOM()
        updateRestartButtonSmiley('lose')
        stopTimer()
     }

     console.log(gLevel.MINES);
     console.log(gGame.shownCount);
     console.log(gGame.markedCount);
     console.log(boardSize);
     

     // Checks if the player has won
    if ( gGame.markedCount === gLevel.MINES &&
        gGame.shownCount + gGame.markedCount === boardSize){
        gGame.isOn = false
        console.log('game end');
        updateRestartButtonSmiley('win')
        stopTimer()
    }

}

function UpdateLoseDOM() {
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            const elCurrCell =  document.querySelector(`.cell-${i}-${j}`)

            // Locates and displays all hidden mines
            if (gBoard[i][j].isMine && !gBoard[i][j].isShown) {
                elCurrCell.classList.remove('covered')
                elCurrCell.innerText = MINE_NOT_ON
            }

            if (gBoard[i][j].isMine && gBoard[i][j].isMarked) {
                elCurrCell.classList.remove('covered')
                elCurrCell.classList.add('correct-mark')
                elCurrCell.innerText = MINE_NOT_ON
            }
            
            // Checks and shows whether marked cells do not have a mine under them
            if (!gBoard[i][j].isMine && gBoard[i][j].isMarked) {
                elCurrCell.classList.remove('covered')
                elCurrCell.innerText = NOT_A_MINE
            }

        }  
    }
} 

