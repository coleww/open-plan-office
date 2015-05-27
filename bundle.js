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

},{"setter-getterify":3}],3:[function(require,module,exports){
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



},{}],4:[function(require,module,exports){
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
},{"./loadSample":1,"openmusic-sample-player":2}]},{},[4])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsb2FkU2FtcGxlLmpzIiwibm9kZV9tb2R1bGVzL29wZW5tdXNpYy1zYW1wbGUtcGxheWVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL29wZW5tdXNpYy1zYW1wbGUtcGxheWVyL25vZGVfbW9kdWxlcy9zZXR0ZXItZ2V0dGVyaWZ5L21haW4uanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYWMsIHBhdGgsIG5vZGUpe1xuXG4gIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gIHJlcXVlc3Qub3BlbignR0VUJywgcGF0aCwgdHJ1ZSk7XG4gIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcblxuICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIGFjLmRlY29kZUF1ZGlvRGF0YShyZXF1ZXN0LnJlc3BvbnNlLCBvbkJ1ZmZlckxvYWRlZCwgb25CdWZmZXJMb2FkRXJyb3IpO1xuICB9O1xuXG4gIHJlcXVlc3Quc2VuZCgpO1xuXG4gIGZ1bmN0aW9uIG9uQnVmZmVyTG9hZGVkKGJ1ZmZlcikge1xuICAgIG5vZGUuYnVmZmVyID0gYnVmZmVyO1xuICB9XG5cbiAgZnVuY3Rpb24gb25CdWZmZXJMb2FkRXJyb3IoZXJyKSB7XG4gICAgY29uc29sZS5lcnJvcignb2ggbm8nLCBlcnIpO1xuICB9XG5cbn0iLCJ2YXIgc2V0dGVyR2V0dGVyaWZ5ID0gcmVxdWlyZSgnc2V0dGVyLWdldHRlcmlmeScpO1xuXG5mdW5jdGlvbiBTYW1wbGVQbGF5ZXIoY29udGV4dCkge1xuXHR2YXIgbm9kZSA9IGNvbnRleHQuY3JlYXRlR2FpbigpO1xuXHR2YXIgbm9kZVByb3BlcnRpZXMgPSB7XG5cdFx0YnVmZmVyOiBudWxsLFxuXHRcdGxvb3A6IGZhbHNlLFxuXHRcdGxvb3BTdGFydDogMCxcblx0XHRsb29wRW5kOiAwXG5cdH07XG5cblx0dmFyIGJ1ZmZlclNvdXJjZXNDb3VudCA9IDA7XG5cdHZhciBidWZmZXJTb3VyY2VzID0ge307XG5cdHZhciBidWZmZXJTb3VyY2VQcm9wZXJ0aWVzID0ge307XG5cblx0c2V0dGVyR2V0dGVyaWZ5KG5vZGUsIG5vZGVQcm9wZXJ0aWVzKTtcblxuXHQvLyBUT0RPOiBwbGF5YmFja1JhdGUgd2hpY2ggbmVlZHMgdG8gYmUgYW4gQXVkaW9QYXJhbVxuXHQvLyBUT0RPOiBwbGF5ZXIgY2FuIGJlIG1vbm8gb3IgcG9seSBpLmUuIG9ubHkgb25lIGJ1ZmZlciBjYW4gcGxheSBhdCBhIGdpdmVuIHRpbWUgb3IgbWFueSBjYW4gb3ZlcmxhcFxuXG5cdG5vZGUuc3RhcnQgPSBmdW5jdGlvbih3aGVuLCBvZmZzZXQsIGR1cmF0aW9uKSB7XG5cdFx0XG5cdFx0dmFyIGJ1ZmZlciA9IG5vZGVQcm9wZXJ0aWVzWydidWZmZXInXTtcblx0XHRpZighYnVmZmVyKSB7XG5cdFx0XHRjb25zb2xlLmluZm8oJ09wZW5NdXNpYyBTYW1wbGVQbGF5ZXI6IG5vIGJ1ZmZlciB0byBwbGF5LCBzbyBieWVlZSEnKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR3aGVuID0gd2hlbiAhPT0gdW5kZWZpbmVkID8gd2hlbiA6IDA7XG5cdFx0b2Zmc2V0ID0gb2Zmc2V0ICE9PSB1bmRlZmluZWQgPyBvZmZzZXQgOiAwO1xuXHRcdFxuXHRcdC8vIFRPRE8gVGhpcyBpcyBtZWdhIHVnbHkgYnV0IHVyZ2ggd2hhdCBpcyBnb2luZyBvbiB1cmdoXG5cdFx0Ly8gaWYgSSBqdXN0IHBhc3MgJ3VuZGVmaW5lZCcgYXMgZHVyYXRpb24gQ2hyb21lIGRvZXNuJ3QgcGxheSBhbnl0aGluZ1xuXHRcdGlmKHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdjb3JyZWN0aW5nIGZvciBjaHJvbWUgYWdoaCcpO1xuXHRcdFx0dmFyIHNhbXBsZUxlbmd0aCA9IGJ1ZmZlci5sZW5ndGg7XG5cdFx0XHRkdXJhdGlvbiA9IGR1cmF0aW9uICE9PSB1bmRlZmluZWQgPyBkdXJhdGlvbiA6IHNhbXBsZUxlbmd0aCAtIG9mZnNldDtcblx0XHR9XG5cblx0XHQvLyBNb25vOiBpbnZhbGlkYXRlIGFsbCBzY2hlZHVsZWQgYnVmZmVyU291cmNlcyB0byBtYWtlIHN1cmUgb25seSBvbmUgaXMgcGxheWVkIChyZXRyaWcgbW9kZSlcblx0XHQvLyBUT0RPIGltcGxlbWVudCBpbnZhbGlkYXRpb24gY29kZSAuLi5cblxuXHRcdC8vIFBvbHk6IGl0J3MgZmluZSwganVzdCBhZGQgYSBuZXcgb25lIHRvIHRoZSBsaXN0XG5cdFx0dmFyIGJzID0gbWFrZUJ1ZmZlclNvdXJjZSgpO1xuXG5cdFx0Ly8gY29uc29sZS5sb2coJ3N0YXJ0JywgJ3doZW4nLCB3aGVuLCAnb2Zmc2V0Jywgb2Zmc2V0LCAnZHVyYXRpb24nLCBkdXJhdGlvbik7XG5cdFx0YnMuc3RhcnQod2hlbiwgb2Zmc2V0LCBkdXJhdGlvbik7XG5cdFx0XG5cdH07XG5cblx0bm9kZS5zdG9wID0gZnVuY3Rpb24od2hlbikge1xuXHRcdC8vIEZvciBlYXNlIG9mIGRldmVsb3BtZW50LCB3ZSdsbCBqdXN0IHN0b3AgdG8gYWxsIHRoZSBzb3VyY2VzIGFuZCBlbXB0eSB0aGUgcXVldWVcblx0XHQvLyBJZiB5b3UgbmVlZCB0byByZS1zY2hlZHVsZSB0aGVtLCB5b3UnbGwgbmVlZCB0byBjYWxsIHN0YXJ0KCkgYWdhaW4uXG5cdFx0dmFyIGtleXMgPSBPYmplY3Qua2V5cyhidWZmZXJTb3VyY2VzKTtcblx0XHRrZXlzLmZvckVhY2goZnVuY3Rpb24oaykge1xuXHRcdFx0dmFyIHNvdXJjZSA9IGJ1ZmZlclNvdXJjZXNba107XG5cdFx0XHRzb3VyY2Uuc3RvcCh3aGVuKTtcblx0XHRcdHJlbW92ZUZyb21RdWV1ZShzb3VyY2UpO1xuXHRcdH0pO1xuXHR9O1xuXG5cdG5vZGUuY2FuY2VsU2NoZWR1bGVkRXZlbnRzID0gZnVuY3Rpb24od2hlbikge1xuXHRcdC8vIFRPRE86IHdoZW4vaWYgdGhlcmUgaXMgYXV0b21hdGlvblxuXHR9O1xuXG5cdHJldHVybiBub2RlO1xuXHRcblx0Ly9+fn5cblxuXHRmdW5jdGlvbiBtYWtlQnVmZmVyU291cmNlKCkge1xuXG5cdFx0dmFyIHNvdXJjZSA9IGNvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG5cdFx0c291cmNlLmFkZEV2ZW50TGlzdGVuZXIoJ2VuZGVkJywgb25CdWZmZXJFbmRlZCk7XG5cdFx0c291cmNlLmNvbm5lY3Qobm9kZSk7XG5cdFx0c291cmNlLmlkID0gYnVmZmVyU291cmNlc0NvdW50Kys7XG5cdFx0YnVmZmVyU291cmNlc1tzb3VyY2UuaWRdID0gc291cmNlO1xuXG5cdFx0T2JqZWN0LmtleXMobm9kZVByb3BlcnRpZXMpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuXHRcdFx0c291cmNlW25hbWVdID0gbm9kZVByb3BlcnRpZXNbbmFtZV07XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gc291cmNlO1xuXHRcdFxuXHR9XG5cblx0ZnVuY3Rpb24gb25CdWZmZXJFbmRlZChlKSB7XG5cdFx0dmFyIHNvdXJjZSA9IGUudGFyZ2V0O1xuXHRcdHNvdXJjZS5kaXNjb25uZWN0KCk7XG5cdFx0Ly8gYWxzbyByZW1vdmUgZnJvbSBsaXN0XG5cdFx0cmVtb3ZlRnJvbVF1ZXVlKHNvdXJjZSk7XG5cdH1cblxuXHRmdW5jdGlvbiByZW1vdmVGcm9tUXVldWUoc291cmNlKSB7XG5cdFx0ZGVsZXRlIGJ1ZmZlclNvdXJjZXNbc291cmNlLmlkXTtcblx0fVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2FtcGxlUGxheWVyO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBzZXR0ZXJHZXR0ZXJpZnk7XG5cblxuZnVuY3Rpb24gc2V0dGVyR2V0dGVyaWZ5KG9iamVjdCwgcHJvcGVydGllcywgY2FsbGJhY2tzKSB7XG5cdGNhbGxiYWNrcyA9IGNhbGxiYWNrcyB8fCB7fTtcblx0dmFyIGtleXMgPSBPYmplY3Qua2V5cyhwcm9wZXJ0aWVzKTtcblx0a2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmplY3QsIGtleSwgbWFrZUdldHRlclNldHRlcihwcm9wZXJ0aWVzLCBrZXksIGNhbGxiYWNrcykpO1xuXHR9KTtcbn1cblxuXG5mdW5jdGlvbiBtYWtlR2V0dGVyU2V0dGVyKHByb3BlcnRpZXMsIHByb3BlcnR5LCBjYWxsYmFja3MpIHtcblx0dmFyIGFmdGVyU2V0dGluZyA9IGNhbGxiYWNrcy5hZnRlclNldHRpbmcgfHwgZnVuY3Rpb24oKSB7fTtcblx0cmV0dXJuIHtcblx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIGdldFByb3BlcnR5KHByb3BlcnRpZXMsIHByb3BlcnR5KTtcblx0XHR9LFxuXHRcdHNldDogZnVuY3Rpb24odmFsdWUpIHtcblx0XHRcdHNldFByb3BlcnR5KHByb3BlcnRpZXMsIHByb3BlcnR5LCB2YWx1ZSk7XG5cdFx0XHRhZnRlclNldHRpbmcocHJvcGVydHksIHZhbHVlKTtcblx0XHR9LFxuXHRcdGVudW1lcmFibGU6IHRydWVcblx0fTtcbn1cblxuXG5mdW5jdGlvbiBnZXRQcm9wZXJ0eShwcm9wZXJ0aWVzLCBuYW1lKSB7XG5cdHJldHVybiBwcm9wZXJ0aWVzW25hbWVdO1xufVxuXG5cbmZ1bmN0aW9uIHNldFByb3BlcnR5KHByb3BlcnRpZXMsIG5hbWUsIHZhbHVlKSB7XG5cdHByb3BlcnRpZXNbbmFtZV0gPSB2YWx1ZTtcbn1cblxuXG4iLCJ2YXIgU2FtcGxlUGxheWVyID0gcmVxdWlyZSgnb3Blbm11c2ljLXNhbXBsZS1wbGF5ZXInKVxudmFyIGxvYWRTYW1wbGUgPSByZXF1aXJlKCcuL2xvYWRTYW1wbGUnKVxuXG52YXIgYWMgPSBuZXcgQXVkaW9Db250ZXh0KClcblxudmFyIHBsYXllciA9IFNhbXBsZVBsYXllcihhYylcbmxvYWRTYW1wbGUoYWMsICcuL3NsYWNrLm9nZycsIHBsYXllcilcblxudmFyIHBhbm5lciA9IGFjLmNyZWF0ZVBhbm5lcigpXG5cbnBsYXllci5jb25uZWN0KHBhbm5lcilcbnBhbm5lci5jb25uZWN0KGFjLmRlc3RpbmF0aW9uKVxuXG5cbmZ1bmN0aW9uIHJhbmRvbSgpe1xuICByZXR1cm4gKE1hdGgucmFuZG9tKCkgKiAyMCkgLSAxMFxufVxuXG5mdW5jdGlvbiBzbGFjaygpe1xuICBwYW5uZXIuc2V0UG9zaXRpb24ocmFuZG9tKCkscmFuZG9tKCkscmFuZG9tKCkpXG4gIHBsYXllci5zdGFydCgpXG4gIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgc2xhY2soKVxuXG4gIH0sIDUwMCArIE1hdGgucmFuZG9tKCkgKiAzMDAwKVxufVxuXG53aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpe1xuICBzbGFjaygpXG5cbn0sIDEwMDApIl19
