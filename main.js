var canvas, ctx, flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false;

var currentColor = "hotpink";

var x = currentColor,
    y = 2;


function init() {
    canvas = document.getElementById('myMandala');
    ctx = canvas.getContext("2d");
    w = canvas.width;
    h = canvas.height;

    $('canvas').on('mousemove', function (e) {
        findxy('move', e)
    });
    $('canvas').on('mousedown', function (e) {
        findxy('down', e)
    });
    $('canvas').on('mouseup', function (e) {
        findxy('up', e)
    });
    $('canvas').on('mouseout', function (e) {
        findxy('out', e)
    });

    $("#custom").spectrum({
        color: currentColor,
        change: function(color){
          currentColor = color.toHexString();
        }
    });
}


function draw() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = y;
    ctx.stroke();
    ctx.closePath();
}

function erase() {
    var m = confirm("Want to clear everything?");
    if (m) {
        ctx.clearRect(0, 0, w, h);
    }
}

// TODO Add an eraser 

function save() {
// TODO Recored session + print to png/JPEG/whatever + save to user account?
}

function findxy(CurrentEvent, e) {
    if (CurrentEvent == 'down') {
        prevX = currX;
        prevY = currY;
        currX = e.clientX - canvas.offsetLeft;
        currY = e.clientY - canvas.offsetTop;

        flag = true;
        dot_flag = true;
        if (dot_flag) {
            ctx.beginPath();
            ctx.fillStyle = currentColor;
            ctx.fillRect(currX, currY, 2, 2);
            ctx.closePath();
            dot_flag = false;
        }
    }
    if (CurrentEvent == 'up' || CurrentEvent == "out") {
        flag = false;
    }
    if (CurrentEvent == 'move') {
        if (flag) {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - canvas.offsetLeft;
            currY = e.clientY - canvas.offsetTop;
            draw();
        }
    }
}
