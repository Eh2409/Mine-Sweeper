'use strict'

var isRuning = false
var startTime = 0
var timer = null
var elapsedTime = 0

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

      var timePass = formatTime(elapsedTime)

      gGame.secsPassed = timePass
      console.log(gGame.secsPassed);

      isRuning = false
    }
  }
  
  function resetTimer() {
    clearInterval(timer)
    isRuning = false
    startTime = 0
    elapsedTime = 0

    const elTimer = document.querySelector('.timer')
    elTimer.textContent = '00:00'
  }

  function formatTime(ms) {
    var minutes = Math.floor(ms / 60000);
    var seconds = Math.floor((ms % 60000) / 1000);

    minutes = String(minutes).padStart(2, '0')
    seconds = String(seconds).padStart(2, '0')

    return `${minutes}:${seconds}`
}
