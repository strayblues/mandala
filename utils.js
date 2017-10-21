// Prevent user from accidentally closing the window
function askBeforeLeave(e){
  e = e || window.event;

  // For Crome, IE and Firefox prior to version 4
  if (e) {
      e.returnValue = 'Sure?';
  }

  // For Safari
  return 'Sure?';
}

function fixMobileSpectrumDisplay(){
  setTimeout(function(){
    window.scrollTo(0, 1);
  }, 0);
}
