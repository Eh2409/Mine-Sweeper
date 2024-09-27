'use strict'

const SET_MINE_MODE = '🤫' 

var gSetMineMode = false
var gIsMinesAreSetOn = false


function onSetMineMode() {

    onInit()
    gSetMineMode = true
    gGame.isOn = false
    gLevel.MINES = 0
    displayMine()

    renderBoardSetMineMode()
    updateRestartBtnSmiley('set mine mode') 
}

function renderBoardSetMineMode() {
    // A function whose purpose is to update the design of the board according to the game mode

    if (!gIsMinesAreSetOn) {
        for (let i = 0; i < gBoard.length; i++) {
            for (let j = 0; j < gBoard[0].length; j++) {
                const currElCell = document.querySelector(`.cell-${i}-${j}`)  
                currElCell.classList.remove('covered')
                currElCell.classList.add('set-mine')
            } 
        }
    } else if (gIsMinesAreSetOn){
        for (let i = 0; i < gBoard.length; i++) {
            for (let j = 0; j < gBoard[0].length; j++) {
                const currElCell = document.querySelector(`.cell-${i}-${j}`)  
                currElCell.classList.remove('set-mine')
                currElCell.classList.add('covered')
                currElCell.innerText = ''
            } 
        }
    }
   
}

function onCellClickedSetMine(elCell,i,j){
    // A function that allows the player to set the location of the mines on the board
    if (!gSetMineMode) return


    if (!gBoard[i][j].isMine) {

        gBoard[i][j].isMine = true
        gLevel.MINES++
        displayMine()

        elCell.innerText = MINE_NOT_ON

    }else if(gBoard[i][j].isMine) {

        gBoard[i][j].isMine = false
        gLevel.MINES--
        displayMine()

        elCell.innerText = ''
    }


    // As soon as one mine is placed on the board, the Play button opens allowing the player to start playing in the current mode

    const elPlaySetMineBtn = document.querySelector('.play-set-main')
    if (gLevel.MINES > 0) {
        gIsMinesAreSetOn = true
        elPlaySetMineBtn.classList.remove('hide')
    } else if (gLevel.MINES === 0){
        gIsMinesAreSetOn = false
        elPlaySetMineBtn.classList.add('hide')
    }
    
}

function onPlaySetMineMode(elPlaySetMineBtn) {
    // The function starts the game

    elPlaySetMineBtn.classList.add('hide')

    setMinesNegsCount()
    renderBoardSetMineMode()
    updateRestartBtnSmiley() 

    gSetMineMode = false
    gIsMinesAreSetOn = false

    gGame.isOn = true
    gIsMineOnBoard = true

    displayTools()
    onTimer()
}