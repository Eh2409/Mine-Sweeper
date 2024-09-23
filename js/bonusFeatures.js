'use strict'

const HINT = '💡' 
const HINT_ON = '⚡' 

var gHintMode = false
var gElCellAarry =[]


function onClickHint(elHint) {
    if (!isMineOnBoard) return
    if (!gGame.isOn) return
    if (gHintMode) return
    gHintMode = true
    elHint.innerHTML = HINT_ON
}

function hintCount(diff = 0) {
    gHintMode = false
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
    if (!gBoard[i][j].isShown && !gBoard[i][j].isMarked) {
        // Checks that the cell does not contain a mine
        if (!gBoard[i][j].isMine) {
            if (gBoard[i][j].minesAroundCount === 0) {
                // In the mode of gHintMode the function creates an array of all opened cells
                expandShown(gBoard, elCell, i, j)

                // The array is sent to the next function and the function hides all the opened cells
                setTimeout(()=>{
                    hideCells(gElCellAarry)
                    gElCellAarry = []
                },1000)

            } else {
                
                elCell.classList.remove('covered')
                elCell.innerText = gBoard[i][j].minesAroundCount 

                setTimeout(() => {
                    elCell.classList.add('covered')
                    elCell.innerText = ''

                    gHintMode = false
                    hintCount(1)
                }, 1000);
            }

        } else {
            //Updates the DOM of the cell
            elCell.classList.remove('covered')
            elCell.classList.add('mine')
            elCell.innerText = MINE

            setTimeout(() => {
                elCell.classList.remove('mine')
            elCell.classList.add('covered')
            elCell.innerText = ''

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

        // Updates that the cell is not shown
        gBoard[currElCell.i][currElCell.j].isShown = false
        gGame.shownCount--

        //Updates the DOM of the cell
        currElCell.elCell.classList.add('covered')
        currElCell.elCell.innerText = ''
    }

    hintCount(1)
}

//------------localStorage--------------


// function displayScore() {
//     console.log(gGame.secsPassed);
//     localStorage.setItem ('score', gGame.secsPassed)
//     const elScore = document.querySelector('.score')
//     elScore.innerHTML = localStorage.getItem('score')
// }


//------------Safe-Click--------------

function onSafeClick() {
    if (!gGame.isOn) return
    if (gLevel.SAFE_CLICK === 0) return
    var safeCells = findSafeCell()
    if (!safeCells.length) return
    var randomCell = getRandomInt(0, safeCells.length)
    var theChosenCell = safeCells[randomCell]

   
    const elSafeCell = document.querySelector(`.cell-${theChosenCell.i}-${theChosenCell.j}`)
    elSafeCell.classList.add('safe-cell')
    safeClickCount(1)

    setTimeout(()=>{
        elSafeCell.classList.remove('safe-cell')
    },2000)
}

function safeClickCount(diff = 0) {
    // Updates the amount of lives
    gLevel.SAFE_CLICK-=diff
    
    // Updates the DOM
     const elSafeClick = document.querySelector('.count-safe-click')
     elSafeClick.innerText = gLevel.SAFE_CLICK
}

function findSafeCell() {
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

/// ----- mega hint -----

/// --- MINE EXTERMINATOR ----

function onMineExterminator() {
    if (!gGame.isOn) return
    if (!isMineOnBoard) return
    console.log('kaka');
    
    var cellsWithMine = findAllMine()
    if (!cellsWithMine.length) return
    var randomCell = getRandomInt(0, cellsWithMine.length)
    var theChosenCell = cellsWithMine[randomCell]

    console.log(theChosenCell);

    gBoard[theChosenCell.i][theChosenCell.j].isMine= false
    gLevel.MINES--

    setMinesNegsCount()
    updateCellNegsCountDOM()
}

function findAllMine() {
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
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isShown && !gBoard[i][j].isMine) {
            const currElCell = document.querySelector(`.cell-${i}-${j}`)
            currElCell.innerText = gBoard[i][j].minesAroundCount
            }
        }
    }
}

