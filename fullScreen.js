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
