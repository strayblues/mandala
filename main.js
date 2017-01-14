/**
* @author Hagar Shilo <strayblues@gmail.com>
*/

window.onbeforeunload = function (e) {
    e = e || window.event;

    // For Crome, IE and Firefox prior to version 4
    if (e) {
        e.returnValue = 'Sure?';
    }

    // For Safari
    return 'Sure?';
};

$(function(){

var canvas, ctx, flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false;

var currentColor = "hotpink";

var lineWidth = 2;


function init() {
    canvas = document.getElementById('myMandala');
    ctx = canvas.getContext("2d");
    canvas.height = window.innerHeight-30;
    canvas.width = window.innerHeight-30;
    w = canvas.width;
    h = canvas.height;

    $('canvas').on('mousemove', function (e) {
        onMouseMove(e)
    });
    $('canvas').on('mousedown', function (e) {
        handleMouseDown(e)
    });
    $('canvas').on('mouseup', function (e) {
        stopDrawing()
    });
    $('canvas').on('mouseout', function (e) {
        stopDrawing()
    });

    //selectionPalette
    $("#selectionPalette").spectrum({
        showPalette: true,
        color: currentColor,
        chooseText: "Save color",
        palette: [ ],
        showSelectionPalette: true, // true by default
        selectionPalette: [ ],
        change: function(color){
          currentColor = color.toHexString();
        },
        move: function(color){
          currentColor = color.toHexString();
        }
    });


    // Hide spectrum when mouse leaves the selection palette
    $(".sp-container").mouseleave(function () {
      $("#selectionPalette").spectrum("hide");
    });

    $('#btn-download').click(function () {

      document.getElementById("myMandala").toBlob(function(blob) {
        saveAs(blob, 'Mandala.png');
      });
    });

    $('#btn-clear').click(clear);

}

init();

// Let user set the width of the line
$(":input").bind('keyup mouseup', function () {
  lineWidth = document.getElementById("line-width").value;
});

function downloadURI(uri, name) {
  var link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  delete link;
}

function flip(x,y) {
  var y = h-y;
  var coordinateArray = [x,y];
  return coordinateArray;
}

function drawDot() {
  var pointSize = 2; //TODO Make adjustable AND round
  ctx.beginPath();
  ctx.fillStyle = currentColor;

  var x_,y_;

  var origPointAndItsRotations = [
    [currX,currY]
  ];

  var n = 5; // Temp. In the future: get user input

  // Store rotation coordinates in an array
  while (origPointAndItsRotations.length<n) {
    [x_,y_] = origPointAndItsRotations[origPointAndItsRotations.length-1];
    origPointAndItsRotations.push(rotate(x_,y_,n));
  }

  // Draw the rotation coordinates kept in the array
  for (var i=0; i<n; i++) {
    ctx.fillRect(origPointAndItsRotations[i][0],origPointAndItsRotations[i][1],pointSize,pointSize);
  }

  var flippedCoordinate = []; // Empty array of arrays

/**
 * Reflects the rotated coordinates
 */
  for (var i=0; i<n; i++) {

    // Get fliped coordinates and store in vars a,b
    var a = origPointAndItsRotations[i][0];
    var b = origPointAndItsRotations[i][1];

    // Flip coordinates
    var flipResult = flip(a,b);

    // Add flipped coordinates to array
    flippedCoordinate.push(flipResult);

  }

  // Draw the flip coordinates kept in array
  for (var i=0; i<n; i++) {
    ctx.fillRect(flippedCoordinate[i][0],flippedCoordinate[i][1],pointSize,pointSize);
  }

  ctx.closePath();
}

function rotate(x,y,numOfReflections){
  var c = Math.cos(2*Math.PI/numOfReflections);
  var s = Math.sin(2*Math.PI/numOfReflections);
  var x2 = c*(x-w/2)+s*(h/2-y)+w/2;
  var y2 = c*(y-h/2)+s*(x-w/2)+h/2;
  var coordinateArray = [x2,y2];
  return coordinateArray;
}


function drawLine() {
    var a = prevX, a_ = a, b = prevY, b_ = h-b, c = currX, c_ = c, d = currY, d_ = h-d;
    ctx.beginPath();
    ctx.moveTo(a, b);
    ctx.lineTo(c, d);
    ctx.moveTo(a_, b_);
    ctx.lineTo(c_, d_);
    a_ = w-a; b_ = b; c_ = w-c; d_ = d;
    ctx.moveTo(a_, b_);
    ctx.lineTo(c_, d_);
    a_ = w-a; b_ = h-b; c_ = w-c; d_ = h-d;
    ctx.moveTo(a_, b_);
    ctx.lineTo(c_, d_);
    a_ = w/2+h/2-b; b_ = w/2+h/2-a; c_ = w/2+h/2-d; d_ = w/2+h/2-c;
    ctx.moveTo(a_, b_);
    ctx.lineTo(c_, d_);
    a_ = w/2+h/2-b; b_ = h/2-w/2+a; c_ = w/2+h/2-d; d_ = h/2-w/2+c;
    ctx.moveTo(a_, b_);
    ctx.lineTo(c_, d_);
    a_ = w/2-h/2+b; b_ = w/2+h/2-a; c_ = w/2-h/2+d; d_ = w/2+h/2-c;
    ctx.moveTo(a_, b_);
    ctx.lineTo(c_, d_);
    a_ = w/2-h/2+b; b_ = h/2-w/2+a; c_ = w/2-h/2+d; d_ = h/2-w/2+c;
    ctx.moveTo(a_, b_);
    ctx.lineTo(c_, d_);

    ctx.strokeStyle = currentColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.closePath();
}

function clear() {
    var m = confirm("Wanna clear everything?");
    if (m) {
        ctx.clearRect(0, 0, w, h);
    }
}

function handleMouseDown(e) {
  prevX = currX;
  prevY = currY;
  currX = e.clientX - canvas.offsetLeft;
  currY = e.clientY - canvas.offsetTop;

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

function onMouseMove(e) {
  if (flag) {
      prevX = currX;
      prevY = currY;
      currX = e.clientX - canvas.offsetLeft;
      currY = e.clientY - canvas.offsetTop;
      drawLine();
  }
}

});
