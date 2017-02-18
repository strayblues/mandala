/**
* @author Hagar Shilo <strayblues@gmail.com>
*/

// Prevent user from accidentally closing the window
window.onbeforeunload = function (e) {
    e = e || window.event;

    // For Crome, IE and Firefox prior to version 4
    if (e) {
        e.returnValue = 'Sure?';
    }

    // For Safari
    return 'Sure?';
};


// DO EVERYTHING
$(function(){

var canvas, ctx, flag = false,
    prevCoords = [0,0],
    currCoords = [0,0],
    dot_flag = false;

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
    rotationsNum: settingsVariable('rotationsNum', 5)
};

var doReflect = true;
$("#do-reflect").change(function() {
  if(this.checked) {
      doReflect = true;
    }
  else {
      doReflect = false;
  }
});

function init() {
    // Create and display a canvas element
    canvas = document.getElementById('myMandala');
    ctx = canvas.getContext("2d");
    canvas.height = window.innerHeight-35;
    canvas.width = window.innerHeight-35;
    w = canvas.width;
    h = canvas.height;

    // Handle mouse/touch events
    $('canvas').on('mousemove', function (e) {
        onMouseMove(e.clientX, e.clientY);
    });
    $('canvas').on('touchmove', function (e) {
        e.preventDefault();
        onMouseMove(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
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

    // The Spectrum color picker selection palette
    $("#selectionPalette").spectrum({
        showPalette: true,
        color: settings.currentColor.get(),
        chooseText: "Save color",
        palette: [ ],
        showSelectionPalette: true, // true by default
        selectionPalette: [ ],
        change: function(color){
          settings.currentColor.set(color.toHexString());
        },
        move: function(color){
          settings.currentColor.set(color.toHexString());
        }
    });

    // Hide Spectrum color picker when mouse leaves the selection palette
    $(".sp-container").mouseleave(function () {
      $("#selectionPalette").spectrum("hide");
    });

    // Handle download of an image file of the canvas
    $('#btn-download').click(function () {
      document.getElementById("myMandala").toBlob(function(blob) {
        saveAs(blob, 'Mandala.png');
      });
    });

    // Clear the canvas
    $('#btn-clear').click(clear);

    // read lineWidth from localStorage
    $('#line-width').val(settings.lineWidth.get());

    // Read rotations-num from localStorage
    $('#rotations-num').val(settings.rotationsNum.get());
}

init();

// Let user set brush size
// This will get rewritten at some point
$(":input").bind('keyup mouseup', function () {
  settings.lineWidth.set($('#line-width').val());
});

//NEW Allow the user to change the number of rotations
$(":input").bind('keyup mouseup', function () {
  settings.rotationsNum.set($('#rotations-num').val()); //NEW
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

  if (doReflect) {
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
     if (doReflect) {

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
        ctx.clearRect(0, 0, w, h);
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

function onMouseMove(x, y) {
  if (flag) {
      prevCoords = currCoords;
      currCoords = eventToCanvasCoords(x, y);
      drawLine();
  }
}
/*
// Popup window for Twitter share button
$('#popup').click(function(){
  var myWindow = window.open("https://twitter.com/intent/tweet?text=https://strayblues.github.io/mandala", "Tweet", "width=500,height=250");
});
*/

});
