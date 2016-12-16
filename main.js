/**
* @author Hagar Shilo <strayblues@gmail.com>
*/


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
        var dataURL = canvas.toDataURL('image/png');
        downloadURI(dataURL, 'Drawing.png');
    });

    $('#btn-clear').click(clear);

}

init();

function downloadURI(uri, name) {
  var link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  delete link;
}

function drawDot() {
  ctx.beginPath();
  ctx.fillStyle = currentColor;
  ctx.fillRect(currX, currY, 20, 20);
  ctx.fillRect(currX, h-currY, 20, 20);
  ctx.fillRect(w-currX, currY, 20, 20);
  ctx.fillRect(w-currX, h-currY, 20, 20);

  ctx.closePath();
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

function reflectTwice() {
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

function save() {
// TODO Recored session + print to png/JPEG/whatever + save to user account?
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
