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

}, 1000)