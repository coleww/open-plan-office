(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function(ac, path, node){

  var request = new XMLHttpRequest();
  request.open('GET', path, true);
  request.responseType = 'arraybuffer';

  request.onload = function() {
    ac.decodeAudioData(request.response, onBufferLoaded, onBufferLoadError);
  };

  request.send();

  function onBufferLoaded(buffer) {
    node.buffer = buffer;
  }

  function onBufferLoadError(err) {
    console.error('oh no', err);
  }

}
},{}],2:[function(require,module,exports){
function SamplePlayer(context) {
  var node = context.createGain();
  var bufferSource;
  var bufferSourceProperties = {};

  ['buffer', 'loop', 'loopStart', 'loopEnd'].forEach(function(name) {
    Object.defineProperty(node, name, makeBufferSourceGetterSetter(name));
  });

  // TODO: playbackRate which needs to be an AudioParam

  node.start = function(when, offset, duration) {
    // console.log('start', 'when', when, 'offset', offset, 'duration', duration);

    var buffer = bufferSourceProperties['buffer'];
    if(!buffer) {
      console.info('no buffer to play so byeee');
      return;
    }

    when = when !== undefined ? when : 0;
    offset = offset !== undefined ? offset : 0;

    // TODO This is mega ugly but urgh what is going on urgh
    // if I just pass 'undefined' as duration Chrome doesn't play anything
    if(window.webkitAudioContext) {
      console.log('correcting for chrome aghh');
      var sampleLength = buffer.length;
      duration = duration !== undefined ? duration : sampleLength - offset;
    }

    // Disconnect if existing, remove events listeners
    if(bufferSource) {
      bufferSource.removeEventListener('ended', onEnded);
      bufferSource.disconnect(node);
      bufferSource = null;
    }

    initialiseBufferSource();

    bufferSource.start(when, offset, duration);

  };

  node.stop = function(when) {
    bufferSource.stop(when);
  };

  node.cancelScheduledEvents = function(when) {
    // TODO: when there is automation
  };

  function initialiseBufferSource() {

    bufferSource = context.createBufferSource();
    bufferSource.addEventListener('ended', onEnded);
    bufferSource.connect(node);

    Object.keys(bufferSourceProperties).forEach(function(name) {
      bufferSource[name] = bufferSourceProperties[name];
    });

  }

  function onEnded(e) {
    var t = e.target;
    t.disconnect(node);
    initialiseBufferSource();
  }

  function makeBufferSourceGetterSetter(property) {
    return {
      get: function() {
        return getBufferSourceProperty(property);
      },
      set: function(v) {
        setBufferSourceProperty(property, v);
      },
      enumerable: true
    };
  }

  function getBufferSourceProperty(name) {
    return bufferSourceProperties[name];
  }

  function setBufferSourceProperty(name, value) {

    bufferSourceProperties[name] = value;

    if(bufferSource) {
      bufferSource[name] = value;
    }

  }

  return node;
}

module.exports = SamplePlayer;

},{}],3:[function(require,module,exports){
var SamplePlayer = require('openmusic-sample-player')
var loadSample = require('./loadSample')




var ac = new AudioContext()

var player = SamplePlayer(ac)
loadSample(ac, './slack.ogg', player)

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


// browserify slack.js -o slacking.js
},{"./loadSample":1,"openmusic-sample-player":2}]},{},[3]);
