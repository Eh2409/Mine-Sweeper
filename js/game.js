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

// Model:
var gBoard 
var gLevel 
var gGame 
var gIsMineOnBoard
var lestSize

// Undo:
var gHistory = []
var gCellsOpenArry = []


function onInit(baordSize = lestSize) {

    //Resets game settings
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
       }
    
    // The board size is passed to the function that determines the level settings
    gLevel = updateLevelSettings (baordSize)

    // Builds and renders the board
    gBoard = buildBoard(gLevel.SIZE)
    renderBoard(gBoard)
    adjustCellSize (baordSize)
    
    displayMine()
    displayMarkNum()

    // Render the results of the players
    runderResults(gLevel.LEVEL)

    // Resets all game settings
    gIsMineOnBoard = false
    updateRestartBtnSmiley()
    lifeCount()
    hintCount()
    mineExterminatorCount()
    resetTimer()
    safeClickCount()

    // Resets game history
    gHistory = []

    // If the player clicked the restart button the game will always remember what board level he was on
    lestSize = baordSize
    
    // If the player has reset the game or selected a different difficulty level after entering SetMineMode, these settings will take them out of this mode
    if (gSetMineMode || gIsMinesAreSetOn) {
    const elPlaySetMineBtn = document.querySelector('.play-set-main')
    elPlaySetMineBtn.classList.add('hide')
    gSetMineMode = false
    gIsMinesAreSetOn = false
    }
    
    // If the player resets the game or switches to a different difficulty level in the middle of running the mega hint mod, this setting will reset the mod
    if (gIsMegaHintOn) {
        gIsMegaHintOn = false
        gClickCount = 0
        gMegaHintPose = []
    }
    
}

function updateLevelSettings (baordSize) {
    /// This function defines the level settings of the game

    var res = []
    switch (baordSize) {
        case 4:
            res = {
                LEVEL: 'Beginner',
                SIZE: 4,
                MINES: 2,
                LIVES:1,
                HINTS:1,
                SAFE_CLICK:1,
                MINE_EXTERMINATOR: 1,
                MEGA_HINT:1
            }
            break;
    
        case 8:
            res = {
                LEVEL: 'Medium',
                SIZE: 8,
                MINES: 14,
                LIVES:2,
                HINTS:2,
                SAFE_CLICK:2,
                MINE_EXTERMINATOR: 2,
                MEGA_HINT:1
            }
            break;

        case 12:
            res = {
                LEVEL: 'Expert',
                SIZE: 12,
                MINES: 32,
                LIVES:3,
                HINTS:3,
                SAFE_CLICK:3,
                MINE_EXTERMINATOR: 3,
                MEGA_HINT:1
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
            onclick=" onCellClicked(this,${i},${j}),
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

function adjustCellSize (baordSize) {
    const elCells = document.querySelectorAll('.cell')

    switch (baordSize) {
      case 4:
        var size = 50
        break;

      case 8:
        var size = 40
        break;

      case 12:
        var size = 35
        break;
    }

    for (let i = 0; i < elCells.length; i++) {
      var currElCell = elCells[i]
      currElCell.style.width = size +'px'
      currElCell.style.height = size +'px'
    }
}

function updateRestartBtnSmiley(emotion = 'smiley') {  
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

    //----- ON HINT MODE ----------
    // If hint mode is on, passes the location of the clicked cell to another function
    if (gIsHintModeOn) {
        onCellClickedHintMode (elCell,i,j) 
        return
    }


     //----- ON MEGA HINT MODE ----------
    // If mega hint mode is on, passes the location of the clicked cells to another function
    if (gIsMegaHintOn) {
        var pos = {i:i ,j:j}
        gMegaHintPose.push(pos)
        gClickCount++
        if (gClickCount === 2) SetPosDirection (gMegaHintPose)
        return
    }


    /// ---- The first cell the player opens ------

    // Checks if this is the player's first click on a cell on the board so that the first cell does not contain mines and in order to scatter the mines on the board
    if (!gIsMineOnBoard && !gBoard[i][j].isMarked) {

        // Passes the location of the first clicked cell to the mine scatter function
        var firstClickPos = {i: i ,j: j }
        setMines(firstClickPos) 
        gIsMineOnBoard = true

        // Starts the timer
        onTimer()

        // Opens the selected cell
        if (gBoard[i][j].minesAroundCount === 0) {
            // A function that opens all neighboring cells to a cell that has zero neighboring cells with a mine
            expandShown(gBoard, elCell,i, j)

            // Receives an array of all opened cells and saves it in the history array, in order to allow the undo button to go back
            gHistory.push(gCellsOpenArry)
            gCellsOpenArry = []

        } else {
            // Updates the MODAL
             gGame.shownCount++
             gBoard[i][j].isShown = true
             
             // update the DOM
             elCell.classList.remove('covered')
             elCell.innerText = gBoard[i][j].minesAroundCount

             // Updates the opened cell in the history array
             gHistory.push({elCell: elCell, i: i, j: j})
        }
    }


    /// -----  Opening process of normal cells ----

    // Checks that the cell is not shown yet
    if (!gBoard[i][j].isShown && !gBoard[i][j].isMarked &&!gIsHintModeOn) {
        // Checks that the cell does not contain a mine

        if (!gBoard[i][j].isMine) {
            if (gBoard[i][j].minesAroundCount === 0) {
                // A function that opens all neighboring cells to a cell that has zero neighboring cells with a mine
                expandShown(gBoard, elCell,i, j)

                // Passes the location of the first clicked cell to the mine scatter function
                gHistory.push(gCellsOpenArry)
                gCellsOpenArry = []

            } else {

                // Updates the MODAL
                gBoard[i][j].isShown = true
                gGame.shownCount++

                // update the DOM
                elCell.classList.remove('covered')
                elCell.innerText = gBoard[i][j].minesAroundCount 

                // Updates the opened cell in the history array
                gHistory.push({elCell: elCell, i: i, j: j})
            }

            // Updates the smiley emoji
            updateRestartBtnSmiley()

        } else {
            // Updates the MODAL
            gBoard[i][j].isShown = true
            gGame.shownCount++

            // update the DOM
            elCell.classList.remove('covered')
            elCell.classList.add('mine')
            elCell.innerText = MINE

            // Removes the mine from the number of mines to calculate the victory later
            gLevel.MINES --
            displayMine()

            // Updates life due to clicking on a mine
            lifeCount(1)

            // Updates the opened cell in the history array
            gHistory.push({elCell: elCell, i: i, j: j})

            // Updates the smiley emoji
            updateRestartBtnSmiley('mine')


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

                // Updates the MODAL
                gBoard[i][j].isShown = true
                gGame.shownCount++

                // update the DOM
                elCell.classList.remove('covered')
                elCell.innerText = ''

                // Builds an array of opened cells to update in the history array later
                gCellsOpenArry.push({elCell: elCell, i: i, j: j})

                // If hint mode is active, saves all the opened cells in the array in order to be able to open and close them through the onCellClickedHintMode function
                if (gIsHintModeOn) {
                    gCellsHintAarry.push({elCell: elCell, i: i, j: j})
                }

            } else if  (!board[i][j].isMine && !board[i][j].isShown && gBoard[i][j].minesAroundCount === 0 && !board[i][j].isMarked ) {

                // Puts the function into recursion mode to open all neighboring cells that have 0 neighboring mines
                expandShown(board, elCurrCell,i, j)

            } else if (!board[i][j].isMine && !board[i][j].isShown && gBoard[i][j].minesAroundCount > 0 && !board[i][j].isMarked){

                // Updates the MODAL
                gBoard[i][j].isShown = true
                gGame.shownCount++

                // update the DOM
                elCurrCell.classList.remove('covered')
                elCurrCell.innerText = gBoard[i][j].minesAroundCount

                // Builds an array of opened cells to update in the history array later
                gCellsOpenArry.push({elCell: elCurrCell, i: i, j: j})

                // If hint mode is active, saves all the opened cells in the array in order to be able to open and close them through the onCellClickedHintMode function
                if (gIsHintModeOn) {
                    gCellsHintAarry.push({elCell: elCurrCell, i: i, j: j})
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
        displayMarkNum()

        elCell.innerText = MARK

    
        checkGameOver()
    }  else if (!gBoard[i][j].isShown && gBoard[i][j].isMarked && event.button === 2){
        // If the selected cell is marked, removes the mark and updates the board and the DOM
        event.preventDefault()

        gBoard[i][j].isMarked = false
        gGame.markedCount--
        displayMarkNum()
        
        elCell.innerText = '' 

        checkGameOver()
    }

    if (gGame.isOn) {
        updateRestartBtnSmiley()
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
     
     var elLives = document.querySelector('.lives span')
     elLives.innerText = strHTML
}

function checkGameOver()  {
    // A function that checks for a win or loss
    

     const boardSize = Math.pow (gLevel.SIZE,2)

     //Checks if the player has lost or win
     if (gLevel.LIVES === 0) {
        gGame.isOn = false
        
        UpdateLoseDOM()
        updateRestartBtnSmiley('lose')
        stopTimer()

     }else if ( gGame.markedCount === gLevel.MINES &&
        gGame.shownCount + gGame.markedCount === boardSize){
         // Checks if the player has won

        gGame.isOn = false
      
        updateRestartBtnSmiley('win')
        stopTimer()

        // When the player wins saves his data to update his score
        makePlayerData()
    }

}

function UpdateLoseDOM() {
    //In a losing situation, the board will open and show all the mines left on the board, and all the places where the player marked there is a mine

    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            const elCurrCell =  document.querySelector(`.cell-${i}-${j}`)

            // Locates and displays all hidden mines
            if (gBoard[i][j].isMine && !gBoard[i][j].isShown) {
                elCurrCell.classList.remove('covered')
                elCurrCell.innerText = MINE_NOT_ON
            }

            // Shows all the cells in which the player marked that there is a mine and shows that he was right
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

function makePlayerData() {

    // Collects the player name
    const elPlayerNameInput = document.querySelector('.player-name')
    var playerName = (!elPlayerNameInput.value)? 'guest' : elPlayerNameInput.value

    // Updates the player data
    var playerData = {
        level: gLevel.LEVEL,
        playerName : playerName,
        score : gGame.secsPassed
    }

    //Sends the data information of the player to update the results
    updateScoreArry (playerData)
}