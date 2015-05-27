var fullScreen = require('./fullScreen')
fullScreen(document.getElementsByTagName('img'))

var SamplePlayer = require('openmusic-sample-player')
var loadSample = require('./loadSample')

var ac = new AudioContext()

var player = SamplePlayer(ac)
loadSample(ac, './audio/slack.ogg', player)

var panner = ac.createPanner()

player.connect(panner)
panner.connect(ac.destination)


function random(){
  return (Math.random() * 20) - 10
}

function slack(){
  panner.setPosition(random(),random(),random())
  player.start()
  window.setTimeout(function(){
    slack()

  }, 500 + Math.random() * 3000)
}

window.setTimeout(function(){
  slack()
}, 3000)

// ZZOMG CAROUSEL
var i = 1
window.setInterval(function(){
  document.querySelector('img:nth-child('+ i +')').style.opacity = 0
  if(++i > 5) i = 1
  document.querySelector('img:nth-child('+ i +')').style.opacity = 1
}, 5000)

window.setTimeout(function(){
  document.querySelector('h1').style.opacity = 0
}, 5000)
