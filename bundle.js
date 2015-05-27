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
module.exports = function(ac, path, node, loop){

  var request = new XMLHttpRequest();
  request.open('GET', path, true);
  request.responseType = 'arraybuffer';

  request.onload = function() {
    ac.decodeAudioData(request.response, onBufferLoaded, onBufferLoadError);
  };

  request.send();

  function onBufferLoaded(buffer) {
    node.buffer = buffer;
    if(loop){
      console.log('WHEE')
      node.start()
    }
  }

  function onBufferLoadError(err) {
    console.error('oh no', err);
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

// ZZOMG CAROUSEL
var i = 1
window.setInterval(function(){
  document.querySelector('img:nth-child('+ i +')').style.opacity = 0
  if(++i > 5) i = 1
  document.querySelector('img:nth-child('+ i +')').style.opacity = 1
}, 5000)

var loop = SamplePlayer(ac)
loadSample(ac, './audio/office.ogg', loop, true)
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

},{"./fullScreen":1,"./loadSample":2,"openmusic-sample-player":3}]},{},[5])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJmdWxsU2NyZWVuLmpzIiwibG9hZFNhbXBsZS5qcyIsIm5vZGVfbW9kdWxlcy9vcGVubXVzaWMtc2FtcGxlLXBsYXllci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9vcGVubXVzaWMtc2FtcGxlLXBsYXllci9ub2RlX21vZHVsZXMvc2V0dGVyLWdldHRlcmlmeS9tYWluLmpzIiwiaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChlbGVtZW50cyl7XG5cbiAgZnVuY3Rpb24gZnVsbFNjcmVlbigpe1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKyl7XG4gICAgICBlbGVtZW50c1tpXS5zdHlsZS5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQgKyBcInB4XCI7XG4gICAgICBlbGVtZW50c1tpXS5zdHlsZS53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoICsgXCJweFwiO1xuICAgIH1cbiAgfVxuXG4gIHdpbmRvdy5vbnJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGZ1bGxTY3JlZW4oKVxuICB9XG5cbiAgZnVsbFNjcmVlbigpXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFjLCBwYXRoLCBub2RlLCBsb29wKXtcblxuICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICByZXF1ZXN0Lm9wZW4oJ0dFVCcsIHBhdGgsIHRydWUpO1xuICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XG5cbiAgcmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICBhYy5kZWNvZGVBdWRpb0RhdGEocmVxdWVzdC5yZXNwb25zZSwgb25CdWZmZXJMb2FkZWQsIG9uQnVmZmVyTG9hZEVycm9yKTtcbiAgfTtcblxuICByZXF1ZXN0LnNlbmQoKTtcblxuICBmdW5jdGlvbiBvbkJ1ZmZlckxvYWRlZChidWZmZXIpIHtcbiAgICBub2RlLmJ1ZmZlciA9IGJ1ZmZlcjtcbiAgICBpZihsb29wKXtcbiAgICAgIGNvbnNvbGUubG9nKCdXSEVFJylcbiAgICAgIG5vZGUuc3RhcnQoKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uQnVmZmVyTG9hZEVycm9yKGVycikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ29oIG5vJywgZXJyKTtcbiAgfVxuXG59IiwidmFyIHNldHRlckdldHRlcmlmeSA9IHJlcXVpcmUoJ3NldHRlci1nZXR0ZXJpZnknKTtcblxuZnVuY3Rpb24gU2FtcGxlUGxheWVyKGNvbnRleHQpIHtcblx0dmFyIG5vZGUgPSBjb250ZXh0LmNyZWF0ZUdhaW4oKTtcblx0dmFyIG5vZGVQcm9wZXJ0aWVzID0ge1xuXHRcdGJ1ZmZlcjogbnVsbCxcblx0XHRsb29wOiBmYWxzZSxcblx0XHRsb29wU3RhcnQ6IDAsXG5cdFx0bG9vcEVuZDogMFxuXHR9O1xuXG5cdHZhciBidWZmZXJTb3VyY2VzQ291bnQgPSAwO1xuXHR2YXIgYnVmZmVyU291cmNlcyA9IHt9O1xuXHR2YXIgYnVmZmVyU291cmNlUHJvcGVydGllcyA9IHt9O1xuXG5cdHNldHRlckdldHRlcmlmeShub2RlLCBub2RlUHJvcGVydGllcyk7XG5cblx0Ly8gVE9ETzogcGxheWJhY2tSYXRlIHdoaWNoIG5lZWRzIHRvIGJlIGFuIEF1ZGlvUGFyYW1cblx0Ly8gVE9ETzogcGxheWVyIGNhbiBiZSBtb25vIG9yIHBvbHkgaS5lLiBvbmx5IG9uZSBidWZmZXIgY2FuIHBsYXkgYXQgYSBnaXZlbiB0aW1lIG9yIG1hbnkgY2FuIG92ZXJsYXBcblxuXHRub2RlLnN0YXJ0ID0gZnVuY3Rpb24od2hlbiwgb2Zmc2V0LCBkdXJhdGlvbikge1xuXHRcdFxuXHRcdHZhciBidWZmZXIgPSBub2RlUHJvcGVydGllc1snYnVmZmVyJ107XG5cdFx0aWYoIWJ1ZmZlcikge1xuXHRcdFx0Y29uc29sZS5pbmZvKCdPcGVuTXVzaWMgU2FtcGxlUGxheWVyOiBubyBidWZmZXIgdG8gcGxheSwgc28gYnllZWUhJyk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0d2hlbiA9IHdoZW4gIT09IHVuZGVmaW5lZCA/IHdoZW4gOiAwO1xuXHRcdG9mZnNldCA9IG9mZnNldCAhPT0gdW5kZWZpbmVkID8gb2Zmc2V0IDogMDtcblx0XHRcblx0XHQvLyBUT0RPIFRoaXMgaXMgbWVnYSB1Z2x5IGJ1dCB1cmdoIHdoYXQgaXMgZ29pbmcgb24gdXJnaFxuXHRcdC8vIGlmIEkganVzdCBwYXNzICd1bmRlZmluZWQnIGFzIGR1cmF0aW9uIENocm9tZSBkb2Vzbid0IHBsYXkgYW55dGhpbmdcblx0XHRpZih3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0KSB7XG5cdFx0XHRjb25zb2xlLmxvZygnY29ycmVjdGluZyBmb3IgY2hyb21lIGFnaGgnKTtcblx0XHRcdHZhciBzYW1wbGVMZW5ndGggPSBidWZmZXIubGVuZ3RoO1xuXHRcdFx0ZHVyYXRpb24gPSBkdXJhdGlvbiAhPT0gdW5kZWZpbmVkID8gZHVyYXRpb24gOiBzYW1wbGVMZW5ndGggLSBvZmZzZXQ7XG5cdFx0fVxuXG5cdFx0Ly8gTW9ubzogaW52YWxpZGF0ZSBhbGwgc2NoZWR1bGVkIGJ1ZmZlclNvdXJjZXMgdG8gbWFrZSBzdXJlIG9ubHkgb25lIGlzIHBsYXllZCAocmV0cmlnIG1vZGUpXG5cdFx0Ly8gVE9ETyBpbXBsZW1lbnQgaW52YWxpZGF0aW9uIGNvZGUgLi4uXG5cblx0XHQvLyBQb2x5OiBpdCdzIGZpbmUsIGp1c3QgYWRkIGEgbmV3IG9uZSB0byB0aGUgbGlzdFxuXHRcdHZhciBicyA9IG1ha2VCdWZmZXJTb3VyY2UoKTtcblxuXHRcdC8vIGNvbnNvbGUubG9nKCdzdGFydCcsICd3aGVuJywgd2hlbiwgJ29mZnNldCcsIG9mZnNldCwgJ2R1cmF0aW9uJywgZHVyYXRpb24pO1xuXHRcdGJzLnN0YXJ0KHdoZW4sIG9mZnNldCwgZHVyYXRpb24pO1xuXHRcdFxuXHR9O1xuXG5cdG5vZGUuc3RvcCA9IGZ1bmN0aW9uKHdoZW4pIHtcblx0XHQvLyBGb3IgZWFzZSBvZiBkZXZlbG9wbWVudCwgd2UnbGwganVzdCBzdG9wIHRvIGFsbCB0aGUgc291cmNlcyBhbmQgZW1wdHkgdGhlIHF1ZXVlXG5cdFx0Ly8gSWYgeW91IG5lZWQgdG8gcmUtc2NoZWR1bGUgdGhlbSwgeW91J2xsIG5lZWQgdG8gY2FsbCBzdGFydCgpIGFnYWluLlxuXHRcdHZhciBrZXlzID0gT2JqZWN0LmtleXMoYnVmZmVyU291cmNlcyk7XG5cdFx0a2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGspIHtcblx0XHRcdHZhciBzb3VyY2UgPSBidWZmZXJTb3VyY2VzW2tdO1xuXHRcdFx0c291cmNlLnN0b3Aod2hlbik7XG5cdFx0XHRyZW1vdmVGcm9tUXVldWUoc291cmNlKTtcblx0XHR9KTtcblx0fTtcblxuXHRub2RlLmNhbmNlbFNjaGVkdWxlZEV2ZW50cyA9IGZ1bmN0aW9uKHdoZW4pIHtcblx0XHQvLyBUT0RPOiB3aGVuL2lmIHRoZXJlIGlzIGF1dG9tYXRpb25cblx0fTtcblxuXHRyZXR1cm4gbm9kZTtcblx0XG5cdC8vfn5+XG5cblx0ZnVuY3Rpb24gbWFrZUJ1ZmZlclNvdXJjZSgpIHtcblxuXHRcdHZhciBzb3VyY2UgPSBjb250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuXHRcdHNvdXJjZS5hZGRFdmVudExpc3RlbmVyKCdlbmRlZCcsIG9uQnVmZmVyRW5kZWQpO1xuXHRcdHNvdXJjZS5jb25uZWN0KG5vZGUpO1xuXHRcdHNvdXJjZS5pZCA9IGJ1ZmZlclNvdXJjZXNDb3VudCsrO1xuXHRcdGJ1ZmZlclNvdXJjZXNbc291cmNlLmlkXSA9IHNvdXJjZTtcblxuXHRcdE9iamVjdC5rZXlzKG5vZGVQcm9wZXJ0aWVzKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcblx0XHRcdHNvdXJjZVtuYW1lXSA9IG5vZGVQcm9wZXJ0aWVzW25hbWVdO1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHNvdXJjZTtcblx0XHRcblx0fVxuXG5cdGZ1bmN0aW9uIG9uQnVmZmVyRW5kZWQoZSkge1xuXHRcdHZhciBzb3VyY2UgPSBlLnRhcmdldDtcblx0XHRzb3VyY2UuZGlzY29ubmVjdCgpO1xuXHRcdC8vIGFsc28gcmVtb3ZlIGZyb20gbGlzdFxuXHRcdHJlbW92ZUZyb21RdWV1ZShzb3VyY2UpO1xuXHR9XG5cblx0ZnVuY3Rpb24gcmVtb3ZlRnJvbVF1ZXVlKHNvdXJjZSkge1xuXHRcdGRlbGV0ZSBidWZmZXJTb3VyY2VzW3NvdXJjZS5pZF07XG5cdH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNhbXBsZVBsYXllcjtcbiIsIm1vZHVsZS5leHBvcnRzID0gc2V0dGVyR2V0dGVyaWZ5O1xuXG5cbmZ1bmN0aW9uIHNldHRlckdldHRlcmlmeShvYmplY3QsIHByb3BlcnRpZXMsIGNhbGxiYWNrcykge1xuXHRjYWxsYmFja3MgPSBjYWxsYmFja3MgfHwge307XG5cdHZhciBrZXlzID0gT2JqZWN0LmtleXMocHJvcGVydGllcyk7XG5cdGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqZWN0LCBrZXksIG1ha2VHZXR0ZXJTZXR0ZXIocHJvcGVydGllcywga2V5LCBjYWxsYmFja3MpKTtcblx0fSk7XG59XG5cblxuZnVuY3Rpb24gbWFrZUdldHRlclNldHRlcihwcm9wZXJ0aWVzLCBwcm9wZXJ0eSwgY2FsbGJhY2tzKSB7XG5cdHZhciBhZnRlclNldHRpbmcgPSBjYWxsYmFja3MuYWZ0ZXJTZXR0aW5nIHx8IGZ1bmN0aW9uKCkge307XG5cdHJldHVybiB7XG5cdFx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBnZXRQcm9wZXJ0eShwcm9wZXJ0aWVzLCBwcm9wZXJ0eSk7XG5cdFx0fSxcblx0XHRzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHRzZXRQcm9wZXJ0eShwcm9wZXJ0aWVzLCBwcm9wZXJ0eSwgdmFsdWUpO1xuXHRcdFx0YWZ0ZXJTZXR0aW5nKHByb3BlcnR5LCB2YWx1ZSk7XG5cdFx0fSxcblx0XHRlbnVtZXJhYmxlOiB0cnVlXG5cdH07XG59XG5cblxuZnVuY3Rpb24gZ2V0UHJvcGVydHkocHJvcGVydGllcywgbmFtZSkge1xuXHRyZXR1cm4gcHJvcGVydGllc1tuYW1lXTtcbn1cblxuXG5mdW5jdGlvbiBzZXRQcm9wZXJ0eShwcm9wZXJ0aWVzLCBuYW1lLCB2YWx1ZSkge1xuXHRwcm9wZXJ0aWVzW25hbWVdID0gdmFsdWU7XG59XG5cblxuIiwidmFyIGZ1bGxTY3JlZW4gPSByZXF1aXJlKCcuL2Z1bGxTY3JlZW4nKVxuZnVsbFNjcmVlbihkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW1nJykpXG5cbnZhciBTYW1wbGVQbGF5ZXIgPSByZXF1aXJlKCdvcGVubXVzaWMtc2FtcGxlLXBsYXllcicpXG52YXIgbG9hZFNhbXBsZSA9IHJlcXVpcmUoJy4vbG9hZFNhbXBsZScpXG5cbnZhciBhYyA9IG5ldyBBdWRpb0NvbnRleHQoKVxuXG52YXIgcGxheWVyID0gU2FtcGxlUGxheWVyKGFjKVxubG9hZFNhbXBsZShhYywgJy4vYXVkaW8vc2xhY2sub2dnJywgcGxheWVyKVxuXG52YXIgcGFubmVyID0gYWMuY3JlYXRlUGFubmVyKClcblxucGxheWVyLmNvbm5lY3QocGFubmVyKVxucGFubmVyLmNvbm5lY3QoYWMuZGVzdGluYXRpb24pXG5cblxuZnVuY3Rpb24gcmFuZG9tKCl7XG4gIHJldHVybiAoTWF0aC5yYW5kb20oKSAqIDIwKSAtIDEwXG59XG5cbmZ1bmN0aW9uIHNsYWNrKCl7XG4gIHBhbm5lci5zZXRQb3NpdGlvbihyYW5kb20oKSxyYW5kb20oKSxyYW5kb20oKSlcbiAgcGxheWVyLnN0YXJ0KClcbiAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICBzbGFjaygpXG5cbiAgfSwgNTAwICsgTWF0aC5yYW5kb20oKSAqIDMwMDApXG59XG5cbi8vIFpaT01HIENBUk9VU0VMXG52YXIgaSA9IDFcbndpbmRvdy5zZXRJbnRlcnZhbChmdW5jdGlvbigpe1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbWc6bnRoLWNoaWxkKCcrIGkgKycpJykuc3R5bGUub3BhY2l0eSA9IDBcbiAgaWYoKytpID4gNSkgaSA9IDFcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW1nOm50aC1jaGlsZCgnKyBpICsnKScpLnN0eWxlLm9wYWNpdHkgPSAxXG59LCA1MDAwKVxuXG52YXIgbG9vcCA9IFNhbXBsZVBsYXllcihhYylcbmxvYWRTYW1wbGUoYWMsICcuL2F1ZGlvL29mZmljZS5vZ2cnLCBsb29wLCB0cnVlKVxubG9vcC5sb29wID0gdHJ1ZVxuXG52YXIgZ2FpbiA9IGFjLmNyZWF0ZUdhaW4oKVxuZ2Fpbi5nYWluLnNldFZhbHVlQXRUaW1lKDAsIGFjLmN1cnJlbnRUaW1lKVxuZ2Fpbi5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAuMSwgYWMuY3VycmVudFRpbWUgKyAzKVxuXG5sb29wLmNvbm5lY3QoZ2FpbilcbmdhaW4uY29ubmVjdChhYy5kZXN0aW5hdGlvbilcblxud2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaDEnKS5zdHlsZS5vcGFjaXR5ID0gMFxuICBzbGFjaygpXG59LCA1MDAwKVxuIl19
