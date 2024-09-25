'use strict'

const MINE_EXTERMINATOR = '🐕‍🦺'

const HINT = '💡' 
const HINT_ON = '⚡' 

// Hint mode
var gIsHintModeOn = false
var gCellsHintAarry =[]

// Mega hint mode
var gIsMegaHintOn = false
var gClickCount = 0
var gMegaHintPose = []

// localStorage
var gBeginnerLevelResults 
var gMediumLevelResults 
var gExpertLevelResults 

//------------HINT MODE--------------

function onClickHint(elHint) {
    if (gIsMegaHintOn) return
    if (!gIsMineOnBoard) return
    if (!gGame.isOn) return
    if (gIsHintModeOn) return
    gIsHintModeOn = true
    elHint.innerHTML = HINT_ON
}

function hintCount(diff = 0) {
    gIsHintModeOn = false
    gGame.isOn = true

    // Updates the amount of lives
    gLevel.HINTS-=diff

    // Updates the DOM
     var strHTML = ''

     for (let i = 0; i < gLevel.HINTS; i++) {
        strHTML += `<span onclick="onClickHint(this)">${HINT}</span>`
     }
     
     var elHints = document.querySelector('.hints span')
     elHints.innerHTML = strHTML
}

function onCellClickedHintMode (elCell,i,j){
    // Note to myself: check how you can prevent clicking on a few more cells in hint mode
    gGame.isOn = false
    if (!gBoard[i][j].isShown) {

        // Checks if the cell is marked, so that after opening and closing it, the marking on the cell will return
        var isCellMarked = (gBoard[i][j].isMarked) ? MARK : ''

        // Checks that the cell does not contain a mine
        if (!gBoard[i][j].isMine) {
            if (gBoard[i][j].minesAroundCount === 0) {
                // In the mode of Hint Mode the function creates an array of all opened cells
                expandShown(gBoard, elCell, i, j)

                // The array is sent to the next function and the function hides all the opened cells
                setTimeout(()=>{
                    hideCells(gCellsHintAarry)
                    gCellsHintAarry = []
                },1000)

            } else {
                
                // update the DOM
                elCell.classList.remove('covered')
                elCell.innerText = gBoard[i][j].minesAroundCount 

                setTimeout(() => {

                    // update the DOM
                    elCell.classList.add('covered')
                    elCell.innerText = isCellMarked

                    gIsHintModeOn = false
                    hintCount(1)
                }, 1000);
            }

        } else {
            // update the DOM
            elCell.classList.remove('covered')
            elCell.classList.add('mine')
            elCell.innerText = MINE

            setTimeout(() => {

            // update the DOM
            elCell.classList.remove('mine')
            elCell.classList.add('covered')
            elCell.innerText = isCellMarked

            hintCount(1)
            }, 1000);
        } 
    }
}

function hideCells(cellsArray) {
   // Goes through the array and hides all opened cells

    console.log(cellsArray);
    for (let i = 0; i < cellsArray.length; i++) {
        var currElCell = cellsArray[i]

        // Updates the MODAL
        gBoard[currElCell.i][currElCell.j].isShown = false
        gGame.shownCount--

        // Checks if the cell is marked, so that after opening and closing it, the marking on the cell will return
        var isCellMarked = (gBoard[currElCell.i][currElCell.j].isMarked) ? MARK : ''

        // update the DOM
        currElCell.elCell.classList.add('covered')
        currElCell.elCell.innerText = isCellMarked
    }

    // After using a hint reduces the amount of hints to use
    hintCount(1)
}

//------------SAFE-CLICK-------------

function onSafeClick() {
    if (!gGame.isOn) return
    if (gLevel.SAFE_CLICK === 0) return

    // Finds a safe cell to click that doesn't have a mine in it
    var safeCells = findSafeCell()
    if (!safeCells.length) return
    var randomCell = getRandomInt(0, safeCells.length)
    var theChosenCell = safeCells[randomCell]

   // update the DOM
    const elSafeCell = document.querySelector(`.cell-${theChosenCell.i}-${theChosenCell.j}`)
    elSafeCell.classList.add('safe-cell')

    // Updates the amount of safe clicks remaining
    safeClickCount(1)

    setTimeout(()=>{
        // update the DOM
        elSafeCell.classList.remove('safe-cell')
    },2000)
}

function safeClickCount(diff = 0) {
    // Updates the amount of safe click
    gLevel.SAFE_CLICK-=diff
    
    // Updates the DOM
     const elSafeClick = document.querySelector('.count-safe-click')
     elSafeClick.innerText = gLevel.SAFE_CLICK
}

function findSafeCell() {
    // Looking for safe cells

    var res = []
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine) continue 
            if (gBoard[i][j].isShown) continue
            res.push({i:i,j:j})
        }
    }
    return res
}

/// ----- MEGA HINT -----

function onMegaHint() {
    if (!gIsMineOnBoard) return
    if (gLevel.MEGA_HINT === 0) return
    gIsMegaHintOn = true
}

function SetPosDirection (Pose) {
    // Checks from which direction the player clicked the two cells and adjusts the The position they have accordingly so that Mega Hint will open the cells properly
    if (Pose[0].i <= Pose[1].i && Pose[0].j <= Pose[1].j) {
        var firstPos = Pose[0]
        var lastPos = Pose[1]    
    }  else if (Pose[0].i >= Pose[1].i && Pose[0].j >= Pose[1].j){
        var firstPos = Pose[1]
        var lastPos = Pose[0]
    } else if (Pose[0].i >= Pose[1].i && Pose[0].j <= Pose[1].j){
        var firstPos = {i:Pose[1].i ,j:Pose[0].j}
        var lastPos = {i:Pose[0].i ,j:Pose[1].j}
    }else if (Pose[0].i <= Pose[1].i && Pose[0].j >= Pose[1].j){
        var firstPos = {i:Pose[0].i ,j:Pose[1].j}
        var lastPos = {i:Pose[1].i ,j:Pose[0].j}
    }

    megaHintShow(firstPos, lastPos)
}

function megaHintShow(firstPos, lastPos) {
    // Opens all cells between the first and last cell that were clicked

    console.log(firstPos, lastPos);
    for (var i = firstPos.i; i <= lastPos.i; i++) { 
      for (var j = firstPos.j; j <= lastPos.j; j++) {

        const elCurrCell = document.querySelector(`.cell-${i}-${j}`)
        const currCell = gBoard[i][j]

        if (gBoard[i][j].isShown) continue
        elCurrCell.classList.remove('covered')
        if (gBoard[i][j].isMine) {
            elCurrCell.innerText = MINE_NOT_ON
        } else {
            var minesAroundCount = (!gBoard[i][j].minesAroundCount) ? '' :  gBoard[i][j].minesAroundCount
            elCurrCell.innerText = minesAroundCount
        }
        
        setTimeout(()=>{
            var isCellMarked = (currCell.isMarked) ? MARK : ''

            elCurrCell.classList.add('covered')
            elCurrCell.innerText = isCellMarked
        },1200)
      }  
    }
    
    gLevel.MEGA_HINT--
    gIsMegaHintOn = false
    gClickCount = 0
    gMegaHintPose = []
}

/// --- MINE EXTERMINATOR ----

function mineExterminatorCount(diff = 0) {
    // Updates the amount of mine exterminator
    gLevel.MINE_EXTERMINATOR-=diff

    // Updates the DOM
     var strHTML = ''

     for (let i = 0; i < gLevel.MINE_EXTERMINATOR; i++) {
        strHTML += `<span onclick="onMineExterminator()">${MINE_EXTERMINATOR}</span>`
     }
     
     var elMineExterminator = document.querySelector('.mine-exterminator span')
     elMineExterminator.innerHTML = strHTML
}

function onMineExterminator() {
    if (!gGame.isOn) return
    if (!gIsMineOnBoard) return
    if (gLevel.MINE_EXTERMINATOR === 0) return
    
    // Locates a random mine on the board and removes it
    var cellsWithMine = findAllMine()
    if (!cellsWithMine.length) return
    var randomCell = getRandomInt(0, cellsWithMine.length)
    var theChosenCell = cellsWithMine[randomCell]

    // Updates the MODAL
    gBoard[theChosenCell.i][theChosenCell.j].isMine= false
    gLevel.MINES--
    displayMine()

    // Calculates and updates all cells on the board the amount of neighboring cells they have with mines due to removing the mine from the board
    setMinesNegsCount()
    updateCellNegsCountDOM()
    mineExterminatorCount(1)
}

function findAllMine() {
    // Finds cells that contain a mine
    var res = []
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine && !gBoard[i][j].isShown) {
            res.push({i:i,j:j})
            }
        }
    }
    return res
}

function updateCellNegsCountDOM() {
    // Updates the number of neighboring cells that have a mine on all open cells

    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isShown && !gBoard[i][j].isMine) {
            const currElCell = document.querySelector(`.cell-${i}-${j}`)

            // update the DOM
            var minesAroundCount = (!gBoard[i][j].minesAroundCount) ? '' :  gBoard[i][j].minesAroundCount
            currElCell.innerText = minesAroundCount
            }
        }
    }
}

// ----------UNDO-----------

function onUndo() {
    // Each time the undo button is pressed, the last opened cell/cells are taken from the history array, the function goes through them and closes them.
    if (!gHistory.length) return
    if (!gIsMineOnBoard) return
    if (!gGame.isOn) return
    
    // Every time you click the undo button, the last opened cell is removed from the history array
    var lastMove = gHistory.pop()

    console.log(lastMove);
    
    if (!lastMove.length) {

        // Checks if the cell is a mine
        if ( gBoard[lastMove.i][lastMove.j].isMine) {
            lastMove.elCell.classList.remove('mine')
            gLevel.MINES ++
        }

        // Updates the MODAL
        gBoard[lastMove.i][lastMove.j].isShown = false
        gGame.shownCount--

        // update the DOM
        lastMove.elCell.classList.add('covered')
        lastMove.elCell.innerText = ''
    } else {
        for (let i = 0; i < lastMove.length; i++) {
            var currCell = lastMove[i]

            // Checks if the cell is a mine
            if ( gBoard[currCell.i][currCell.j].isMine) {
                currCell.elCell.classList.remove('mine')
                gLevel.MINES ++
            }
            
            // Updates the MODAL
            gBoard[currCell.i][currCell.j].isShown = false
            gGame.shownCount--

            // update the DOM
            currCell.elCell.classList.add('covered')
            currCell.elCell.innerText = ''
        }
    }
}

//------------localStorage--------------


function updateScoreArry (playerData) {
    // After a win, the function adds the player's results into the results array

    var currLevelArray 
    var currLevel 

    // A function whose purpose is to take the data out of the storage and update it back into the array
    updateLevelArray(playerData.level)

    // Finds the player's game level and updates the level array
    switch (playerData.level) {
        case 'Beginner':
            gBeginnerLevelResults.push(playerData)

            currLevelArray = gBeginnerLevelResults
            currLevel = 'Beginner'
            break;

        case 'Medium':
            gMediumLevelResults.push(playerData)

            currLevelArray = gMediumLevelResults
            currLevel = 'Medium'
            break;

        case 'Expert':
            gExpertLevelResults.push(playerData)

            currLevelArray = gExpertLevelResults
            currLevel = 'Expert'
            break;
    }

    /// Passes the array in functions in order to arrange, store and update the information about the results of the game.

    var sortLevelArray = sortScoreArray (currLevelArray)
    storScoreArray(sortLevelArray, currLevel)
    runderResults(currLevel)
}

function updateLevelArray(level) {
    // A function that returns the data saved in the storage back to the array, and checks whether there is data saved in the storage or not and updates the level array accordingly.
    var currLevelDataStorage = JSON.parse(localStorage.getItem(level))

    switch (level) {
        case 'Beginner':
            gBeginnerLevelResults = (currLevelDataStorage === null) ? []  : currLevelDataStorage
            return gBeginnerLevelResults

        case 'Medium':
            gMediumLevelResults = (currLevelDataStorage === null) ? []  : currLevelDataStorage
            return gMediumLevelResults

        case 'Expert':
            gExpertLevelResults = (currLevelDataStorage === null) ? []  : currLevelDataStorage
            return gExpertLevelResults
    }
}

function sortScoreArray (currLevelArray) {
    // A function that goes through an array and arranges it according to the order of the players' results, from the best result to the least
    currLevelArray.sort((a, b) => a.score - b.score);

    console.log(currLevelArray);
    
    // After sorting, if the size of the array exceeds the amount of results displayed on the site, the purpose of this operation is to remove information that will not be displayed to save data storage size.
    if (currLevelArray.length > 5) {
        
        currLevelArray.splice(5)
    }

    return currLevelArray
}

function storScoreArray(currLevelArray, currLevel) {
    // After the array has been updated and sorted with the latest result data, this function stores the array for future use

    if (typeof(Storage) !== "undefined") {
        var currLevelArrayData = JSON.stringify(currLevelArray)
        localStorage.setItem(currLevel, currLevelArrayData);
    }
    return
}

function runderResults(level = 'Beginner') {
    // A function that renders the scoreboard

    const elTopScore = document.querySelector('.top-scores span')
    elTopScore.innerText = level

    var currLevelArray = updateLevelArray(level)

    var strHTML = ''
    for (let i = 0; i < 5; i++) {
        var currPlayerData = currLevelArray[i]
        if (currPlayerData === undefined) break
        console.log(currPlayerData);
        
        strHTML+= `<div>
        ${i+1}. name: ${currPlayerData.playerName} ----------------------- score: ${formatTime(currPlayerData.score)}
        </div>`
    }
    const elResult = document.querySelector('.scoreboard')
    elResult.innerHTML=strHTML
}

//  -----  main & mark count DOM -----

function displayMine() {
    const elMineNum = document.querySelector('.mine-num')
    elMineNum.innerText = gLevel.MINES
}

function displayMarkNum() {
    const elMarkNum = document.querySelector('.mark-num')
    elMarkNum.innerText = gGame.markedCount
}