import * as classes from './classes.js';
import * as animations from './animations.js';

let ctx, canvasWidth, canvasHeight, fontSize, anchor;

let img;
let headerHeight = 50;
let isScrollWheel = false;

function setUpCanvas(canvasElement) {
    ctx = canvasElement.getContext("2d");
    canvasWidth = canvasElement.width;
    canvasHeight = canvasElement.height;

    img = document.createElement('img');
    img.src = "./img/thumbnail.jpg";
    fontSize = 20;      // Title font size
    anchor = 0;
    animations.Init();
}

function getContext2D() { return ctx };

function draw() {
    // First, clear the rect
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    // ctx.save();
    // ctx.beginPath();
    // ctx.roundRect(ctx, 0, 0, canvasWidth, canvasHeight, 50);
    // ctx.clip();
    // ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    // ctx.restore();

    // Draw background
    // ctx.save();
    // ctx.fillStyle = "#FBFBFB";
    // ctx.globalAlpha = 0.0;
    // ctx.fillRect(0,0,canvasWidth, canvasHeight);
    // ctx.restore();


    ctx.save();
    ctx.fillStyle = "lightgray";
    ctx.beginPath();
    ctx.roundRect(0, 0, canvasWidth, canvasHeight, 10);
    ctx.fill();
    ctx.restore();

    // ctx.drawImage(img, 0,0, 100,100);
    // draw receives a list of messages to draw
    // THE FOLLOWING WILL BE REPLACED BY A SINGLE MESSAGE DRAW CALL
    // first draw the textBubble
    // drawTextBubble([200,550], true);
    // now draw text
    // drawText(params.target, params.correct, [200,550]);
}

function drawHeader() {
    // Useful header dimensions:
    let h = headerHeight - 8;
    // Draw the bacground AGAIN but smaller
    ctx.save();
    ctx.fillStyle = "lightgray";
    ctx.beginPath();
    ctx.roundRect(0, 0, canvasWidth, h + 10, [10, 10, 0, 0]);
    ctx.fill();
    ctx.restore();
    // First, fill whole header with bg color
    ctx.save();
    ctx.fillStyle = "#FBFBFB";
    ctx.globalAlpha = 1.0;
    ctx.beginPath();
    ctx.roundRect(3, 3, canvasWidth - 6, headerHeight - 6, [10, 10, 0, 0]);
    ctx.fill();
    ctx.restore();
    // Draw the clipart
    // first, determine where you want the circle to draw (center)
    let x = h / 2;
    let y = h / 3;
    let r = h / 2;
    // r -= 6;

    // draw clipart
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + r / 2, y * 2, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(img, x - (r / 2), y - (r / 2), r * 2, r * 2);
    ctx.restore();


    // draw text
    ctx.save();
    ctx.font = `${16}pt sans-serif`
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = "black";
    ctx.fillText("Travel Helper", x + r + r, headerHeight / 2 - fontSize / 2);
    ctx.restore();

    // draw header line
    // ctx.save();
    // ctx.fillStyle = "gray";
    // ctx.fillRect(0, h - 1, canvasWidth, 5);
    // ctx.restore();

}

function drawFooter(anchor) {
    // First, fill whole footer with bg color
    // ctx.save();
    // ctx.fillStyle = "#FBFBFB";
    // ctx.globalAlpha = 1.0;
    // ctx.fillRect(0, anchor, canvasWidth, canvasHeight - anchor);
    // ctx.restore();

    // Draw abckground AGAIN but smaller for footer
    ctx.save();
    ctx.fillStyle = "lightgray";
    ctx.beginPath();
    ctx.roundRect(0, anchor - 4, canvasWidth, canvasHeight - (anchor - 4), [0,0,10,10]);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "#FBFBFB";
    ctx.globalAlpha = 1.0;
    ctx.beginPath();
    ctx.roundRect(3, anchor, canvasWidth - 6, canvasHeight - anchor - 3, [0, 0, 10, 10]);
    ctx.fill();
    ctx.restore();
    // draw footer line
    // ctx.save();
    // ctx.fillRect(0, anchor, canvasWidth, .5);
    // ctx.restore();
}

function drawBody(top, height) {
    ctx.save();
    ctx.fillStyle = "#FBFBFB";
    ctx.fillRect(3, top - 9, canvasWidth - 6, height + 5);
    ctx.restore();
}

function drawIntro(x,y){
    ctx.save();
    let arrowW = 25 / 4;
    let arrowH = 50 * .5;
    y -= 50;
    ctx.fillStyle = "red";
    ctx.font = `20pt sans-serif`
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Type \'Hello\' using your keyboard", x, y);
    ctx.fillText("Then press Enter!", x, y + 25);
    ctx.fillStyle = "lightgray";
    ctx.beginPath();
    y += 60;
    // console.log(animations.getDownAndUp());
    y += Math.abs(animations.getDownAndUp() * 10);
    ctx.moveTo(x - arrowW, y);
    ctx.lineTo(x + arrowW, y);
    ctx.lineTo(x + arrowW, y + (1 * arrowH));
    ctx.lineTo(x + (2 * arrowW), y + (1 * arrowH));
    ctx.lineTo(x, y + (2 * arrowH));
    ctx.lineTo(x - (2 * arrowW), y + (1 * arrowH));
    ctx.lineTo(x - arrowW, y + (1 * arrowH));
    ctx.fill();
    ctx.restore();
}

function drawTutorial(x,y) {
    ctx.save();
    let arrowW = 25 / 4;
    let arrowH = 50 * .5;
    y -= 50;
    ctx.fillStyle = "red";
    ctx.font = `20pt sans-serif`
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Now type one of the messages,", x, y);
    ctx.fillText("and then hit enter to keep playing!", x, y + 25);
    ctx.fillStyle = "lightgray";
    ctx.beginPath();
    y += 60;
    // console.log(animations.getDownAndUp());
    y += Math.abs(animations.getDownAndUp() * 10);
    ctx.moveTo(x - arrowW, y);
    ctx.lineTo(x + arrowW, y);
    ctx.lineTo(x + arrowW, y + (1 * arrowH));
    ctx.lineTo(x + (2 * arrowW), y + (1 * arrowH));
    ctx.lineTo(x, y + (2 * arrowH));
    ctx.lineTo(x - (2 * arrowW), y + (1 * arrowH));
    ctx.lineTo(x - arrowW, y + (1 * arrowH));
    ctx.fill();
    ctx.restore();
}

// vpw = ViewPortHeight
function drawScrollWheel(highest, lowest, vph = 0, top, bot) {
    // highest = highest > headerHeight ? highest : headerHeight; 
    // viewport
    // messageBlock height
    let messageBlock = lowest - highest;
    // If our viewport height is greater than the message block, nothing to do
    if (vph > messageBlock) return;
    if (!isScrollWheel) isScrollWheel = true;
    // now we do some stuff
    // scroll wheel is fully at bottom when highest > top
    // scroll wheel height is proportional to vph as vph is to message block
    let swh = vph * (vph / messageBlock);
    swh -= top - headerHeight;
    // Calculate how much larger message block is than vph
    let hDiff = messageBlock - vph;
    let val = hDiff - (top - Math.abs(highest));
    // The scroll wheel's distance from bottom is equivalent to highest's distance from top
    ctx.save();
    ctx.fillStyle = "darkgray";
    ctx.globalAlpha = 1.0;
    ctx.beginPath();
    // Disable scroll wheel for now
    // ctx.roundRect(canvasWidth - 10, headerHeight + (hDiff - (top - highest)), 5, swh, 15);
    ctx.fill();
    ctx.restore();
}

function scrollWheelActive() { return isScrollWheel; }

function getValidScroll(amt, highest, lowest, vph = 0, top, bot) {
    // Takes in a scroll amt
    // returns whether this scroll is possible:
    // 3 cases:
    //  1: Scroll is fully possible, simply calculate and return new top height
    //  2: Scroll is limited possible (scroll wheel hits bottom/top with room to spare)
    //      Calculate and return new top height
    //  3: Scroll is fully impossible

    // First, calculate useful information
    let messageBlock = lowest - highest;
    let swh = vph * (vph / messageBlock);
    let hDiff = messageBlock - vph;
    // check the amt by which we want to scroll
    if (amt > 0) {  // moving objects down the canvas
        // determine whether we can do a full scroll
        // Note: We can no longer scroll down when highest would be greater than top
        if (highest + amt < top) {// All good
            return highest + amt;
        }
        else {
            return top;
        }

    } else {        // moving objects up the canvas
        // Determine whether we can do a full scrol
        // Note: We can no longer scroll up when lowest would be less than bot
        if (lowest + amt > bot) {// All good
            // return top + (hDiff - (top - Math.abs(highest))); //lowest + amt;
            return highest + amt;
        }
        else {
            return top - hDiff;
        }
    }
}


export { setUpCanvas, draw, getContext2D, drawHeader, drawIntro, drawFooter, drawBody, drawTutorial, drawScrollWheel, scrollWheelActive, getValidScroll };