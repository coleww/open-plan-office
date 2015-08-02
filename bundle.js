(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var typey = require('get-object-type')

module.exports = function (el) {
  function resize () {
    switch (typey(el)) {
      case 'HTMLCollection':
        for (var i = 0; i < el.length; i++) {
          el[i].style.height = window.innerHeight + 'px'
          el[i].style.width = window.innerWidth + 'px'
        }
        break
      case 'HTMLCanvasElement':
        el.height = window.innerHeight + 'px'
        el.width = window.innerWidth + 'px'
        break
      default:
        el.style.height = window.innerHeight + 'px'
        el.style.width = window.innerWidth + 'px'
        break
    }
  }

  window.addEventListener('resize', resize, false)

  resize()
}

},{"get-object-type":2}],2:[function(require,module,exports){
'use strict';

module.exports = exports = function (obj) {
	return ({}).toString.call(obj).slice(8, -1);
};

},{}],3:[function(require,module,exports){
module.exports = function(ac, path, cb){

  var request = new XMLHttpRequest();
  request.open('GET', path, true);
  request.responseType = 'arraybuffer';

  request.onload = function() {
    ac.decodeAudioData(request.response, cb, onBufferLoadError);
  };

  request.send();

  function onBufferLoadError(err) {
    console.error(err);
  }

}
},{}],4:[function(require,module,exports){
var setterGetterify = require('setter-getterify');

function SamplePlayer(context) {
	var node = context.createGain();
	var nodeProperties = {
		buffer: null,
		loop: false,
		loopStart: 0,
		loopEnd: 0
	};

	var bufferSourcesCount = 0;
	var bufferSources = {};
	var bufferSourceProperties = {};

	setterGetterify(node, nodeProperties);

	// TODO: playbackRate which needs to be an AudioParam
	// TODO: player can be mono or poly i.e. only one buffer can play at a given time or many can overlap

	node.start = function(when, offset, duration) {
		
		var buffer = nodeProperties['buffer'];
		if(!buffer) {
			console.info('OpenMusic SamplePlayer: no buffer to play, so byeee!');
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

		// Mono: invalidate all scheduled bufferSources to make sure only one is played (retrig mode)
		// TODO implement invalidation code ...

		// Poly: it's fine, just add a new one to the list
		var bs = makeBufferSource();

		// console.log('start', 'when', when, 'offset', offset, 'duration', duration);
		bs.start(when, offset, duration);
		
	};

	node.stop = function(when) {
		// For ease of development, we'll just stop to all the sources and empty the queue
		// If you need to re-schedule them, you'll need to call start() again.
		var keys = Object.keys(bufferSources);
		keys.forEach(function(k) {
			var source = bufferSources[k];
			source.stop(when);
			removeFromQueue(source);
		});
	};

	node.cancelScheduledEvents = function(when) {
		// TODO: when/if there is automation
	};

	return node;
	
	//~~~

	function makeBufferSource() {

		var source = context.createBufferSource();
		source.addEventListener('ended', onBufferEnded);
		source.connect(node);
		source.id = bufferSourcesCount++;
		bufferSources[source.id] = source;

		Object.keys(nodeProperties).forEach(function(name) {
			source[name] = nodeProperties[name];
		});

		return source;
		
	}

	function onBufferEnded(e) {
		var source = e.target;
		source.disconnect();
		// also remove from list
		removeFromQueue(source);
	}

	function removeFromQueue(source) {
		delete bufferSources[source.id];
	}

}

module.exports = SamplePlayer;

},{"setter-getterify":5}],5:[function(require,module,exports){
module.exports = setterGetterify;


function setterGetterify(object, properties, callbacks) {
	callbacks = callbacks || {};
	var keys = Object.keys(properties);
	keys.forEach(function(key) {
		Object.defineProperty(object, key, makeGetterSetter(properties, key, callbacks));
	});
}


function makeGetterSetter(properties, property, callbacks) {
	var afterSetting = callbacks.afterSetting || function() {};
	return {
		get: function() {
			return getProperty(properties, property);
		},
		set: function(value) {
			setProperty(properties, property, value);
			afterSetting(property, value);
		},
		enumerable: true
	};
}


function getProperty(properties, name) {
	return properties[name];
}


function setProperty(properties, name, value) {
	properties[name] = value;
}



},{}],6:[function(require,module,exports){
var fullHouse = require('full-house')
fullHouse(document.getElementsByTagName('img'))

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

},{"full-house":1,"load-sample-2-buff":3,"openmusic-sample-player":4}]},{},[6]);
