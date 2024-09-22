'use strict'

const HINT = '💡' 
const HINT_ON = '⚡' 

var gHintMode = false
var gHintsAarry =[]

function hintCount(diff = 0) {
    gHintMode = false
    gGame.isOn = true

    // Updates the amount of lives
    gGame.hints-=diff

    // Updates the DOM
     var strHTML = ''

     for (let i = 0; i < gGame.hints; i++) {
        strHTML += `<span onclick="onClickHint(this)">${HINT}</span>`
     }
     
     var elHints = document.querySelector('.hints span')
     elHints.innerHTML = strHTML
}

function onClickHint(elHint) {
    if (!isMineOnBoard) return
    if (!gGame.isOn) return
    if (gHintMode) return
    gHintMode = true
    elHint.innerHTML = HINT_ON
}

function onCellClickedHintMode (elCell,i,j){
    // Note to myself: check how you can prevent clicking on a few more cells in hint mode
    gGame.isOn = false
    if (!gBoard[i][j].isShown && !gBoard[i][j].isMarked) {
        // Checks that the cell does not contain a mine
        if (!gBoard[i][j].isMine) {
            if (gBoard[i][j].minesAroundCount === 0) {
                expandShown(gBoard, elCell,i, j)
                setTimeout(() => {
                    hideCells(gHintsAarry)
                }, 1000);
            } else {
                console.log('kaka');
                
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
    /// Function under construction

    console.log(cellsArray);
    for (let i = 0; i < cellsArray.length; i++) {
        var currElCell = cellsArray[i]
        currElCell.classList.add('covered')
        currElCell.innerText = ''
    }
    hintCount(1)
}