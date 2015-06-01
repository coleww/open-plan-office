(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function (elements){

  function fullScreen(){
    for(var i = 0; i < elements.length; i++){
      elements[i].style.height = window.innerHeight + "px";
      elements[i].style.width = window.innerWidth + "px";
    }
  }

  window.onresize = function() {
    fullScreen()
  }

  fullScreen()
}

},{}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
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

},{"setter-getterify":4}],4:[function(require,module,exports){
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



},{}],5:[function(require,module,exports){
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

},{"./fullScreen":1,"load-sample-2-buff":2,"openmusic-sample-player":3}]},{},[5])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJmdWxsU2NyZWVuLmpzIiwibm9kZV9tb2R1bGVzL2xvYWQtc2FtcGxlLTItYnVmZi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9vcGVubXVzaWMtc2FtcGxlLXBsYXllci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9vcGVubXVzaWMtc2FtcGxlLXBsYXllci9ub2RlX21vZHVsZXMvc2V0dGVyLWdldHRlcmlmeS9tYWluLmpzIiwiaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChlbGVtZW50cyl7XG5cbiAgZnVuY3Rpb24gZnVsbFNjcmVlbigpe1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKyl7XG4gICAgICBlbGVtZW50c1tpXS5zdHlsZS5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQgKyBcInB4XCI7XG4gICAgICBlbGVtZW50c1tpXS5zdHlsZS53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoICsgXCJweFwiO1xuICAgIH1cbiAgfVxuXG4gIHdpbmRvdy5vbnJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGZ1bGxTY3JlZW4oKVxuICB9XG5cbiAgZnVsbFNjcmVlbigpXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFjLCBwYXRoLCBjYil7XG5cbiAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgcmVxdWVzdC5vcGVuKCdHRVQnLCBwYXRoLCB0cnVlKTtcbiAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuXG4gIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgYWMuZGVjb2RlQXVkaW9EYXRhKHJlcXVlc3QucmVzcG9uc2UsIGNiLCBvbkJ1ZmZlckxvYWRFcnJvcik7XG4gIH07XG5cbiAgcmVxdWVzdC5zZW5kKCk7XG5cbiAgZnVuY3Rpb24gb25CdWZmZXJMb2FkRXJyb3IoZXJyKSB7XG4gICAgY29uc29sZS5lcnJvcihlcnIpO1xuICB9XG5cbn0iLCJ2YXIgc2V0dGVyR2V0dGVyaWZ5ID0gcmVxdWlyZSgnc2V0dGVyLWdldHRlcmlmeScpO1xuXG5mdW5jdGlvbiBTYW1wbGVQbGF5ZXIoY29udGV4dCkge1xuXHR2YXIgbm9kZSA9IGNvbnRleHQuY3JlYXRlR2FpbigpO1xuXHR2YXIgbm9kZVByb3BlcnRpZXMgPSB7XG5cdFx0YnVmZmVyOiBudWxsLFxuXHRcdGxvb3A6IGZhbHNlLFxuXHRcdGxvb3BTdGFydDogMCxcblx0XHRsb29wRW5kOiAwXG5cdH07XG5cblx0dmFyIGJ1ZmZlclNvdXJjZXNDb3VudCA9IDA7XG5cdHZhciBidWZmZXJTb3VyY2VzID0ge307XG5cdHZhciBidWZmZXJTb3VyY2VQcm9wZXJ0aWVzID0ge307XG5cblx0c2V0dGVyR2V0dGVyaWZ5KG5vZGUsIG5vZGVQcm9wZXJ0aWVzKTtcblxuXHQvLyBUT0RPOiBwbGF5YmFja1JhdGUgd2hpY2ggbmVlZHMgdG8gYmUgYW4gQXVkaW9QYXJhbVxuXHQvLyBUT0RPOiBwbGF5ZXIgY2FuIGJlIG1vbm8gb3IgcG9seSBpLmUuIG9ubHkgb25lIGJ1ZmZlciBjYW4gcGxheSBhdCBhIGdpdmVuIHRpbWUgb3IgbWFueSBjYW4gb3ZlcmxhcFxuXG5cdG5vZGUuc3RhcnQgPSBmdW5jdGlvbih3aGVuLCBvZmZzZXQsIGR1cmF0aW9uKSB7XG5cdFx0XG5cdFx0dmFyIGJ1ZmZlciA9IG5vZGVQcm9wZXJ0aWVzWydidWZmZXInXTtcblx0XHRpZighYnVmZmVyKSB7XG5cdFx0XHRjb25zb2xlLmluZm8oJ09wZW5NdXNpYyBTYW1wbGVQbGF5ZXI6IG5vIGJ1ZmZlciB0byBwbGF5LCBzbyBieWVlZSEnKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR3aGVuID0gd2hlbiAhPT0gdW5kZWZpbmVkID8gd2hlbiA6IDA7XG5cdFx0b2Zmc2V0ID0gb2Zmc2V0ICE9PSB1bmRlZmluZWQgPyBvZmZzZXQgOiAwO1xuXHRcdFxuXHRcdC8vIFRPRE8gVGhpcyBpcyBtZWdhIHVnbHkgYnV0IHVyZ2ggd2hhdCBpcyBnb2luZyBvbiB1cmdoXG5cdFx0Ly8gaWYgSSBqdXN0IHBhc3MgJ3VuZGVmaW5lZCcgYXMgZHVyYXRpb24gQ2hyb21lIGRvZXNuJ3QgcGxheSBhbnl0aGluZ1xuXHRcdGlmKHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdjb3JyZWN0aW5nIGZvciBjaHJvbWUgYWdoaCcpO1xuXHRcdFx0dmFyIHNhbXBsZUxlbmd0aCA9IGJ1ZmZlci5sZW5ndGg7XG5cdFx0XHRkdXJhdGlvbiA9IGR1cmF0aW9uICE9PSB1bmRlZmluZWQgPyBkdXJhdGlvbiA6IHNhbXBsZUxlbmd0aCAtIG9mZnNldDtcblx0XHR9XG5cblx0XHQvLyBNb25vOiBpbnZhbGlkYXRlIGFsbCBzY2hlZHVsZWQgYnVmZmVyU291cmNlcyB0byBtYWtlIHN1cmUgb25seSBvbmUgaXMgcGxheWVkIChyZXRyaWcgbW9kZSlcblx0XHQvLyBUT0RPIGltcGxlbWVudCBpbnZhbGlkYXRpb24gY29kZSAuLi5cblxuXHRcdC8vIFBvbHk6IGl0J3MgZmluZSwganVzdCBhZGQgYSBuZXcgb25lIHRvIHRoZSBsaXN0XG5cdFx0dmFyIGJzID0gbWFrZUJ1ZmZlclNvdXJjZSgpO1xuXG5cdFx0Ly8gY29uc29sZS5sb2coJ3N0YXJ0JywgJ3doZW4nLCB3aGVuLCAnb2Zmc2V0Jywgb2Zmc2V0LCAnZHVyYXRpb24nLCBkdXJhdGlvbik7XG5cdFx0YnMuc3RhcnQod2hlbiwgb2Zmc2V0LCBkdXJhdGlvbik7XG5cdFx0XG5cdH07XG5cblx0bm9kZS5zdG9wID0gZnVuY3Rpb24od2hlbikge1xuXHRcdC8vIEZvciBlYXNlIG9mIGRldmVsb3BtZW50LCB3ZSdsbCBqdXN0IHN0b3AgdG8gYWxsIHRoZSBzb3VyY2VzIGFuZCBlbXB0eSB0aGUgcXVldWVcblx0XHQvLyBJZiB5b3UgbmVlZCB0byByZS1zY2hlZHVsZSB0aGVtLCB5b3UnbGwgbmVlZCB0byBjYWxsIHN0YXJ0KCkgYWdhaW4uXG5cdFx0dmFyIGtleXMgPSBPYmplY3Qua2V5cyhidWZmZXJTb3VyY2VzKTtcblx0XHRrZXlzLmZvckVhY2goZnVuY3Rpb24oaykge1xuXHRcdFx0dmFyIHNvdXJjZSA9IGJ1ZmZlclNvdXJjZXNba107XG5cdFx0XHRzb3VyY2Uuc3RvcCh3aGVuKTtcblx0XHRcdHJlbW92ZUZyb21RdWV1ZShzb3VyY2UpO1xuXHRcdH0pO1xuXHR9O1xuXG5cdG5vZGUuY2FuY2VsU2NoZWR1bGVkRXZlbnRzID0gZnVuY3Rpb24od2hlbikge1xuXHRcdC8vIFRPRE86IHdoZW4vaWYgdGhlcmUgaXMgYXV0b21hdGlvblxuXHR9O1xuXG5cdHJldHVybiBub2RlO1xuXHRcblx0Ly9+fn5cblxuXHRmdW5jdGlvbiBtYWtlQnVmZmVyU291cmNlKCkge1xuXG5cdFx0dmFyIHNvdXJjZSA9IGNvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG5cdFx0c291cmNlLmFkZEV2ZW50TGlzdGVuZXIoJ2VuZGVkJywgb25CdWZmZXJFbmRlZCk7XG5cdFx0c291cmNlLmNvbm5lY3Qobm9kZSk7XG5cdFx0c291cmNlLmlkID0gYnVmZmVyU291cmNlc0NvdW50Kys7XG5cdFx0YnVmZmVyU291cmNlc1tzb3VyY2UuaWRdID0gc291cmNlO1xuXG5cdFx0T2JqZWN0LmtleXMobm9kZVByb3BlcnRpZXMpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuXHRcdFx0c291cmNlW25hbWVdID0gbm9kZVByb3BlcnRpZXNbbmFtZV07XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gc291cmNlO1xuXHRcdFxuXHR9XG5cblx0ZnVuY3Rpb24gb25CdWZmZXJFbmRlZChlKSB7XG5cdFx0dmFyIHNvdXJjZSA9IGUudGFyZ2V0O1xuXHRcdHNvdXJjZS5kaXNjb25uZWN0KCk7XG5cdFx0Ly8gYWxzbyByZW1vdmUgZnJvbSBsaXN0XG5cdFx0cmVtb3ZlRnJvbVF1ZXVlKHNvdXJjZSk7XG5cdH1cblxuXHRmdW5jdGlvbiByZW1vdmVGcm9tUXVldWUoc291cmNlKSB7XG5cdFx0ZGVsZXRlIGJ1ZmZlclNvdXJjZXNbc291cmNlLmlkXTtcblx0fVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2FtcGxlUGxheWVyO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBzZXR0ZXJHZXR0ZXJpZnk7XG5cblxuZnVuY3Rpb24gc2V0dGVyR2V0dGVyaWZ5KG9iamVjdCwgcHJvcGVydGllcywgY2FsbGJhY2tzKSB7XG5cdGNhbGxiYWNrcyA9IGNhbGxiYWNrcyB8fCB7fTtcblx0dmFyIGtleXMgPSBPYmplY3Qua2V5cyhwcm9wZXJ0aWVzKTtcblx0a2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmplY3QsIGtleSwgbWFrZUdldHRlclNldHRlcihwcm9wZXJ0aWVzLCBrZXksIGNhbGxiYWNrcykpO1xuXHR9KTtcbn1cblxuXG5mdW5jdGlvbiBtYWtlR2V0dGVyU2V0dGVyKHByb3BlcnRpZXMsIHByb3BlcnR5LCBjYWxsYmFja3MpIHtcblx0dmFyIGFmdGVyU2V0dGluZyA9IGNhbGxiYWNrcy5hZnRlclNldHRpbmcgfHwgZnVuY3Rpb24oKSB7fTtcblx0cmV0dXJuIHtcblx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIGdldFByb3BlcnR5KHByb3BlcnRpZXMsIHByb3BlcnR5KTtcblx0XHR9LFxuXHRcdHNldDogZnVuY3Rpb24odmFsdWUpIHtcblx0XHRcdHNldFByb3BlcnR5KHByb3BlcnRpZXMsIHByb3BlcnR5LCB2YWx1ZSk7XG5cdFx0XHRhZnRlclNldHRpbmcocHJvcGVydHksIHZhbHVlKTtcblx0XHR9LFxuXHRcdGVudW1lcmFibGU6IHRydWVcblx0fTtcbn1cblxuXG5mdW5jdGlvbiBnZXRQcm9wZXJ0eShwcm9wZXJ0aWVzLCBuYW1lKSB7XG5cdHJldHVybiBwcm9wZXJ0aWVzW25hbWVdO1xufVxuXG5cbmZ1bmN0aW9uIHNldFByb3BlcnR5KHByb3BlcnRpZXMsIG5hbWUsIHZhbHVlKSB7XG5cdHByb3BlcnRpZXNbbmFtZV0gPSB2YWx1ZTtcbn1cblxuXG4iLCJ2YXIgZnVsbFNjcmVlbiA9IHJlcXVpcmUoJy4vZnVsbFNjcmVlbicpXG5mdWxsU2NyZWVuKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbWcnKSlcblxudmFyIFNhbXBsZVBsYXllciA9IHJlcXVpcmUoJ29wZW5tdXNpYy1zYW1wbGUtcGxheWVyJylcbnZhciBsb2FkU2FtcGxlMkJ1ZmYgPSByZXF1aXJlKCdsb2FkLXNhbXBsZS0yLWJ1ZmYnKVxuXG52YXIgYWMgPSBuZXcgQXVkaW9Db250ZXh0KClcblxudmFyIHBsYXllciA9IFNhbXBsZVBsYXllcihhYylcbmxvYWRTYW1wbGUyQnVmZihhYywgJy4vYXVkaW8vc2xhY2sub2dnJywgZnVuY3Rpb24oYnVmZmVyKXtcbiAgcGxheWVyLmJ1ZmZlciA9IGJ1ZmZlclxufSlcblxudmFyIHBhbm5lciA9IGFjLmNyZWF0ZVBhbm5lcigpXG5cbnBsYXllci5jb25uZWN0KHBhbm5lcilcbnBhbm5lci5jb25uZWN0KGFjLmRlc3RpbmF0aW9uKVxuXG5cbmZ1bmN0aW9uIHJhbmRvbSgpe1xuICByZXR1cm4gKE1hdGgucmFuZG9tKCkgKiAyMCkgLSAxMFxufVxuXG5mdW5jdGlvbiBzbGFjaygpe1xuICBwYW5uZXIuc2V0UG9zaXRpb24ocmFuZG9tKCkscmFuZG9tKCkscmFuZG9tKCkpXG4gIHBsYXllci5zdGFydCgpXG4gIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgc2xhY2soKVxuXG4gIH0sIDUwMCArIE1hdGgucmFuZG9tKCkgKiAzMDAwKVxufVxuXG4vLyBaWk9NRyBDQVJPVVNFTFxudmFyIGkgPSAxXG53aW5kb3cuc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW1nOm50aC1jaGlsZCgnKyBpICsnKScpLnN0eWxlLm9wYWNpdHkgPSAwXG4gIGlmKCsraSA+IDUpIGkgPSAxXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2ltZzpudGgtY2hpbGQoJysgaSArJyknKS5zdHlsZS5vcGFjaXR5ID0gMVxufSwgNTAwMClcblxudmFyIGxvb3AgPSBTYW1wbGVQbGF5ZXIoYWMpXG5sb2FkU2FtcGxlMkJ1ZmYoYWMsICcuL2F1ZGlvL29mZmljZS5vZ2cnLCBmdW5jdGlvbihidWZmZXIpe1xuICBsb29wLmJ1ZmZlciA9IGJ1ZmZlclxuICBsb29wLnN0YXJ0KClcbn0pXG5sb29wLmxvb3AgPSB0cnVlXG5cbnZhciBnYWluID0gYWMuY3JlYXRlR2FpbigpXG5nYWluLmdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgYWMuY3VycmVudFRpbWUpXG5nYWluLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMC4xLCBhYy5jdXJyZW50VGltZSArIDMpXG5cbmxvb3AuY29ubmVjdChnYWluKVxuZ2Fpbi5jb25uZWN0KGFjLmRlc3RpbmF0aW9uKVxuXG53aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpe1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdoMScpLnN0eWxlLm9wYWNpdHkgPSAwXG4gIHNsYWNrKClcbn0sIDUwMDApXG4iXX0=
