/**
* @author Hagar Shilo <strayblues@gmail.com>
*/

"use strict";


// DO EVERYTHING
$(function(){

  var mobile_flag = true;
  if (!(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()))) {
    mobile_flag = false; // TODO Change back to false when done testing
  }

var canvas, ctx, flag = false,
    prevCoords = [0,0],
    currCoords = [0,0],
    dot_flag = false,
    w,
    h;


// localStorage settings

function settingsVariable(name, defaultValue) {
    if (!localStorage.getItem(name)) {
        localStorage.setItem(name, defaultValue);
    }

    return {
        get: function() {
            return localStorage.getItem(name);
        },
        set: function(value) {
            localStorage.setItem(name, value);
        }
    };
}

var settings = {
    currentColor: settingsVariable('currentColor', '#449afc'),
    lineWidth: settingsVariable('lineWidth', 2),
    rotationsNum: settingsVariable('rotationsNum', 5),
    doReflect: settingsVariable('doReflect', true)
};


$(".do-reflect").change(function() {
  if(this.checked) {
      settings.doReflect.set(true);
    }
  else {
    // Silly hack to fix a bug quickly. I pass an empty string instead of
    // the boolean value false, because localStorage converts everything into
    // string, which means it reads 'false' as a non-empty string,
    // which absurdly makes its boolean value TRUE (badness ensues).
      settings.doReflect.set('');
  }
});


// Pre-paint the canvas white - should be called on clear(); too

function paintWhite(){
ctx.beginPath();
ctx.rect(0, 0, w, h);
ctx.fillStyle = "white";
ctx.fill();
}


// Draw background grid

function drawBoard(){
  ctx.moveTo(w/2,0);
  ctx.lineTo(w/2,h);
  ctx.moveTo(0,h/2);
  ctx.lineTo(w,h/2);
  ctx.lineWidth = 1; // So line doesn't change to user settings
  ctx.strokeStyle = "#f5f5f5";
  ctx.stroke();
}


function init() {

  window.onbeforeunload = askBeforeLeave;

  // Create and display canvas for either desktop or mobile device
  function setCanvasSize(){
    if (mobile_flag){
      canvas = document.getElementById('mobile-canvas');
      $('#mobile').show();
      if (window.innerWidth < window.innerHeight) {
        canvas.width = canvas.height = window.innerWidth - 30;
      }
      else {
        canvas.height = window.innerHeight - $('#menu').height();
        canvas.width = window.innerHeight  - $('#menu').height();
      }
    }
    else {
      canvas = document.getElementById('desktop-canvas');
      $('#desktop').show();
      canvas.height = window.innerHeight-35;
      canvas.width = window.innerHeight-35;
    }
    ctx = canvas.getContext("2d");
    w = canvas.width;
    h = canvas.height;
  }

  setCanvasSize();


  // Pre-paint canvas so it has white bg on save
  paintWhite();


  // Drow bg grid
  drawBoard();


  // Handle mouse/touch events
  $('canvas').on('mousemove', function (e) {
      handleMouseMove(e.clientX, e.clientY);
  });
  $('canvas').on('touchmove', function (e) {
      e.preventDefault();
      handleMouseMove(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
  });

  $('canvas').on('mousedown', function (e) {
      handleMouseDown(e.clientX, e.clientY);
  });
  $('canvas').on('touchstart', function (e) {
      e.preventDefault();
      handleMouseDown(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
  });

  $('canvas').on('mouseup mouseout', function (e) {
      stopDrawing();
  });
  $('canvas').on('touchend touchcancel', function (e) {
      e.preventDefault();
      stopDrawing();
  });

  // Color picker selection palette
  $(".selectionPalette").spectrum({
      showPalette: true,
      maxSelectionSize: 100,
      togglePaletteOnly: true,
      showInitial: true,
      color: settings.currentColor.get(),
      chooseText: "Save color",
      palette: [ ],
      showSelectionPalette: true, // true by default
      hideAfterPaletteSelect:true,
      selectionPalette: [ ],
      change: function(color){
        settings.currentColor.set(color.toHexString());
      },
      move: function(color){
        settings.currentColor.set(color.toHexString());
      }
  });

  // Hide color picker when mouse leaves the selection palette
  $(".sp-container").mouseleave(function () {
    $(".selectionPalette").spectrum("hide");
  });


  // Handle download of an image file of the canvas
  // No support for some iOS devices at this point
  // Some iPhone users may need jpg format
  $('.btn-download').click(function () {
    if (mobile_flag) {
      document.getElementById("mobile-canvas").toBlob(function(blob) {
        saveAs(blob, 'Mandala.jpg');
      });
    }
      else {
        document.getElementById("desktop-canvas").toBlob(function(blob) {
          saveAs(blob, 'Mandala.jpg');
          });
      }
  });

/*
  //TODO try this for creating a URL
  $('.btn-url').click(function () {
    var dataURL = canvas.toDataURL();
    alert(dataURL);
  });
*/

  // Clear the canvas
  $('.btn-clear').click(clear);

  // read lineWidth from localStorage
  $('.line-width').val(settings.lineWidth.get());

  // Read rotations-num from localStorage
  $('.rotations-num').val(settings.rotationsNum.get());

  // Read do-reflect from localStorage
  $('.do-reflect').attr(settings.doReflect.get());
}

init();


// Let user set brush size
$(".line-width").bind('keyup mouseup', function () {
  settings.lineWidth.set($(this).val());
});

//Allow user to change the number of rotations
$(".rotations-num").bind('keyup mouseup', function () {
  settings.rotationsNum.set($(this).val());
});


// Flip the coordinates
function flip(x,y) {
  var y = h-y;
  var coordinateArray = [x,y];
  return coordinateArray;
}

// Draw a dot in response to a single mouse click
function drawDot() {
  ctx.fillStyle = settings.currentColor.get();

  // Array of coordinate pairs
  var origPointAndItsRotations = [
    currCoords // These are initialized at the top of the big inclusive function
  ];

  // Store rotation coordinates in an array
  while (origPointAndItsRotations.length<settings.rotationsNum.get()) {
    var x_,y_;
    [x_,y_] = origPointAndItsRotations[origPointAndItsRotations.length-1];
    origPointAndItsRotations.push(rotate(x_,y_,settings.rotationsNum.get()));
  }

  // Draw the rotation coordinates kept in the array
  for (var i=0; i<settings.rotationsNum.get(); i++) {
    ctx.beginPath();
    ctx.arc(
        origPointAndItsRotations[i][0],
        origPointAndItsRotations[i][1],
        settings.lineWidth.get() / 2,
        0,
        2 * Math.PI
    );
    ctx.fill();
  }

  if (settings.doReflect.get()) {
    var flippedCoordinates = []; // Array of arrays

  /**
   * Reflects the rotated coordinates
   */
    for (var i=0; i<settings.rotationsNum.get(); i++) {

      // Get flipped coordinates and store in vars a,b
      var a = origPointAndItsRotations[i][0];
      var b = origPointAndItsRotations[i][1];

      // Flip coordinates
      var flipResult = flip(a,b);

      // Add flipped coordinates to array
      flippedCoordinates.push(flipResult);
    }

    // Draw/display the flipped coordinates kept in the array
    for (var i=0; i<settings.rotationsNum.get(); i++) {
      ctx.beginPath();
      ctx.arc(
          flippedCoordinates[i][0],
          flippedCoordinates[i][1],
          settings.lineWidth.get() / 2,
          0,
          2 * Math.PI
      );
      ctx.fill();
    }
  }
}

// Calculate rotations and store rotated coordinates in array
function rotate(x,y,numOfRotations){
  var c = Math.cos(2*Math.PI/numOfRotations);
  var s = Math.sin(2*Math.PI/numOfRotations);
  var x2 = c*(x-w/2)+s*(h/2-y)+w/2;
  var y2 = c*(y-h/2)+s*(x-w/2)+h/2;
  var coordinateArray = [x2,y2];
  return coordinateArray;
}

// Draw/display lines where the user drags the mouse
function drawLine() {
    var x, y, a;

    ctx.beginPath();
    var lineStartPoints = [
      prevCoords
    ];
    var lineEndPoints = [
      currCoords
    ];

    // Rotate line start point coordinates and store the rotation coordinates in an array
    while (lineStartPoints.length<settings.rotationsNum.get()) {
      a = lineStartPoints[lineStartPoints.length-1];
      x = a[0];
      y = a[1];
      lineStartPoints.push(rotate(x,y,settings.rotationsNum.get()));
    }

    // Rotate line end point coordinates and store the rotation coordinates in an array
    while (lineEndPoints.length<settings.rotationsNum.get()) {
      a = lineEndPoints[lineEndPoints.length-1];
      x = a[0];
      y = a[1];
      lineEndPoints.push(rotate(x,y,settings.rotationsNum.get()));
    }

    for (var i=0; i<settings.rotationsNum.get(); i++) {
      ctx.moveTo(lineStartPoints[i][0],lineStartPoints[i][1]);
      ctx.lineTo(lineEndPoints[i][0],lineEndPoints[i][1]);
    }

    /**
     * Reflects the rotated coordinates
     */
     if (settings.doReflect.get()) {

        var flippedLineStartPoints = [];
        for (var i=0; i<settings.rotationsNum.get(); i++) {
          flippedLineStartPoints.push(flip(lineStartPoints[i][0],lineStartPoints[i][1]));
        }

        var flippedLineEndPoints = [];
        for (var i=0; i<settings.rotationsNum.get(); i++) {
          flippedLineEndPoints.push(flip(lineEndPoints[i][0],lineEndPoints[i][1]));
        }

        for (var i=0; i<settings.rotationsNum.get(); i++) {
          ctx.moveTo(flippedLineStartPoints[i][0],flippedLineStartPoints[i][1]);
          ctx.lineTo(flippedLineEndPoints[i][0],flippedLineEndPoints[i][1]);
        }
     }

    // Brush settings
    ctx.strokeStyle = settings.currentColor.get();
    ctx.lineWidth = settings.lineWidth.get();
    ctx.lineCap = 'round';

    // Display the linez
    ctx.stroke();
    ctx.closePath();
}

// Confirm before clearing the canvas
function clear() {
    var m = confirm("Clear everything?");
    if (m) {
      // Removing paintWhite below will make the clear steps undone-able
      // (once undo function is written).
      ctx.clearRect(0, 0, w, h);
      paintWhite();
      drawBoard();
    }
}

function eventToCanvasCoords(x, y) {
    var rect = canvas.getBoundingClientRect();
    return [x - rect.left, y - rect.top];
}

function handleMouseDown(x, y) {
  currCoords = eventToCanvasCoords(x, y);

  flag = true;
  dot_flag = true;
  if (dot_flag) {
    drawDot();
    dot_flag = false;
  }
}

function stopDrawing() {
  flag = false;
}

function handleMouseMove(x, y) {
  if (flag) {
      prevCoords = currCoords;
      currCoords = eventToCanvasCoords(x, y);
      drawLine();
  }
}

});
