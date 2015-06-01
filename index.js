var fullScreen = require('./fullScreen')
fullScreen(document.getElementsByTagName('img'))

var SamplePlayer = require('openmusic-sample-player')
var loadSample2Buff = require('load-sample-2-buff')

var ac = new AudioContext()

var player = SamplePlayer(ac)
loadSample2Buff(ac, './audio/slack.ogg', function(buffer){
  player.buffer = buffer
})

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

// ZZOMG CAROUSEL
var i = 1
window.setInterval(function(){
  document.querySelector('img:nth-child('+ i +')').style.opacity = 0
  if(++i > 5) i = 1
  document.querySelector('img:nth-child('+ i +')').style.opacity = 1
}, 5000)

var loop = SamplePlayer(ac)
loadSample2Buff(ac, './audio/office.ogg', function(buffer){
  loop.buffer = buffer
  loop.start()
})
loop.loop = true

var gain = ac.createGain()
gain.gain.setValueAtTime(0, ac.currentTime)
gain.gain.linearRampToValueAtTime(0.1, ac.currentTime + 3)

loop.connect(gain)
gain.connect(ac.destination)

window.setTimeout(function(){
  document.querySelector('h1').style.opacity = 0
  slack()
}, 5000)
