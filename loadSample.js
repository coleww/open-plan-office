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