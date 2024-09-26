'use strict'

var isRuning = false
var startTime = 0
var timer = null
var elapsedTime = 0


function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
  }

/// ---- TIMER ---

function onTimer() {
    if (!isRuning) {
      startTime = Date.now()
      timer = setInterval(update, 31)
      isRuning = true
    }
  }
  
  function update() {

    var currentTime = Date.now()
    elapsedTime = currentTime - startTime

    var timePass = formatTime(elapsedTime)
  
    const elTimer = document.querySelector('.timer')
    elTimer.textContent = timePass
  }
  
  function stopTimer() {
    if (isRuning) {
      clearInterval(timer)

      var currentTime = Date.now()
      elapsedTime = currentTime - startTime

      var timePass = elapsedTime

      gGame.secsPassed = timePass

      isRuning = false
    }
  }
  
  function resetTimer() {
    clearInterval(timer)
    isRuning = false
    startTime = 0
    elapsedTime = 0

    const elTimer = document.querySelector('.timer')
    elTimer.textContent = '00:00:000'
  }

  function formatTime(ms) {
    var minutes = Math.floor(ms / 60000);
    var seconds = Math.floor((ms % 60000) / 1000);
    var milliSeconds = Math.floor(ms % 1000)

    minutes = String(minutes).padStart(2, '0')
    seconds = String(seconds).padStart(2, '0')
    milliSeconds = String(milliSeconds).padStart(3, '0')

    return `${minutes}:${seconds}:${milliSeconds}`
  }