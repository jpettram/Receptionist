import * as animations from './animations.js';

// globals
let colors = ["#FAC448", "#FA5D3C", "#6E9CFA", "#54D8A5"];
let playerColor = colors[Math.floor(Math.random() * colors.length)];
// Contains a definition for a message
// Has:
// Context reference
// Text to display
// size of bubble
// position
// color of bubble
const MAX_SIZE = 240;
class Message {
    constructor(ctx, text, pos, color, w, fontSize = 14) {
        // const MAX_SIZE = 180;
        // Alright, based on the text and font size, determine suitable size
        this.text = [text];
        this.rawText = text;
        this.pos = pos;
        this.fontSize = fontSize;
        this.padding = [10,7];
        let temp = gDetermineBubbleSize([text], MAX_SIZE, fontSize, ctx, this.padding);
        this.text = temp[1];
        this.size = temp[0];
        this.pos[0] = color ? (w - this.size[0] - 10) : this.pos[0];
        // Bake alpha into the pos
        this.pos[2] = 1;
        this.color = color ? playerColor : "#b4b4bc";
    }
    draw(ctx) {
        // ALL messages will have text bubbles
        this.drawTextBubble(ctx);
        // Draw the text completely normally
        this.drawText(ctx);
    }
    // Handles drawing the background of the text
    drawTextBubble(ctx) {
        // draws bubble
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.pos[2];
        if (this.pos[2] < 0)
            this.globalAlpha = 0;
        ctx.beginPath();
        ctx.roundRect(this.pos[0], this.pos[1], this.size[0], this.size[1], 15);
        ctx.fill();
        ctx.restore();


    }

    getSize() {return this.size;}
    getPos() {return this.pos;}
    setPos(val) {this.pos = val;}
    getPosCopy() {return [this.pos[0], this.pos[1], this.pos[2]];}
    setAlpha(val) {this.pos[2] = val;}
    getFullHeight() {return this.size[1] + this.pos[1];};
    // bumps the message up by amt (will be font size)
    bump(amt) {
        this.pos[1] += amt;
    }
    // handles drawing the text portion of a message
    drawText(ctx) {
        ctx.save();
        ctx.fillStyle = "black";
        ctx.font = `${this.fontSize}pt sans-serif`
        ctx.globalAlpha = this.pos[2];
        if (this.pos[2] < 0)
            this.globalAlpha = 0;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        let heightChange = this.fontSize + this.padding[1];
        for (let i = 0; i < this.text.length; i++) {
            ctx.fillText(this.text[i], this.pos[0] + this.padding[0], this.pos[1] + this.padding[1] + (heightChange * i));

        }
        ctx.restore();
    }

    determineBubbleSize(text, max, fontSize, ctx) {
        // width = either maxLength or textLength * ?
        // height = either fontsize + 8 or fontSize * (length / max) + 8 (padding)
        
        // Measure the size of the text
        ctx.font = `${this.fontSize}pt sans-serif`
        let width = ctx.measureText(text[0]).width;
        // width = div.clientWidth - 20;
        // width += this.fontSize;
        // width += this.padding[0];
        let size = [];
        // Checks if we have more chars than width. If so, cap width and add height
        size[0] = width > max ? max : width;
        size[1] = width > max ? (Math.trunc(width / max) + 1) : 1;

        
        let t = text;
        // simply cutting in 3 isn't good enough...
        // New strategy: have a temp variable store the current line
        // add characters to the line while doing so doesn't exceed width
        // once that happens, store in t and go to next line
        // If we end up having more height, split the text into an array
        if (size[1] > 1) {
            let line = "";
            let count = 0;
            let h = 0;
            let rawText = text[0];
            ctx.font = `${this.fontSize}pt sans-serif`

            t = [];
            while (count < rawText.length) {
                line += rawText[count];
                if (ctx.measureText(line).width > max - (this.padding[0])) {
                    t[h] = line;
                    line = "";
                    if (t[h][0] === ' ') {
                        t[h] = t[h].slice(1);
                        t[h - 1] += ' ';
                    }
                    h++;
                }
                count++;
            }
            t[h] = line;
            if (t[h][0] === ' ') {
                t[h] = t[h].slice(1);
                t[h - 1] += ' ';
            }
            h++;
            size[1] = h;
        }

        // Store the values and return
        size[0] += this.padding[0] * 2;
        // size[1] = fontSize * (size[1] + 2);
        size[1] = (fontSize * (size[1]))  + ((size[1] + 1) * this.padding[1]);
        return [size, t];
    }

    setHeight(h) {
        // True height is desired height (h) MINUS the height stored here in the class
        this.pos[1] = h - this.size[1];

        this.pos[1] = h;

        // We will also return the result to be used in the recursive function
        return this.pos[1] + this.size[1];
    }
};



class ActiveMessage {

    constructor(ctx, text, pos, fontSize = 12) {
        // const MAX_SIZE = 180;
        // Alright, based on the text and font size, determine suitable size
        this.text = [text];
        this.rawText = text;
        this.pos = pos;     // akter the x to be based on the anchor
        this.fontSize = fontSize;
        this.padding = [10,7];
        let temp = gDetermineBubbleSize([text], MAX_SIZE, fontSize, ctx, this.padding);
        this.text = temp[1];
        this.size = temp[0];
        this.active = true;
        this.index = 0;

        this.correct = "";

        this.pos[0] = (pos[0] - this.size[0]);
        // Bake alpha into position
        this.pos[2] = 1;
        this.color = true ? playerColor : "#b4b4bc";
        this.fontSize = fontSize;
        // always align message to be close from bottom
        // this.pos[1] = (pos[1] - this.size[1] - 5);

    }

    getSize() { return this.size; }
    getPos() { return this.pos };
    getPosCopy() {return [this.pos[0], this.pos[1],this.pos[2]];}
    setPos(val) {this.pos = val};
    setRecursivePosX(val) {this.pos[0] = val; this.pos[0] -= this.size[0]; return this.pos[0]};
    // Answers the question: If I end up with my right side touching here, what is my postion? 
    getRecursivePosX(val) {return val - this.size[0];}
    getRawText() { return this.rawText; }
    setDrawData(correct) {
        // Match correct to the format of this.text
        // This means there are multiple lines to match
        if (this.text.length > 1) {
            let l = correct.length;
            let index = 0;
            this.correct = [];
            while (index < this.text.length && l > 0) {
                if (l > this.text[index].length) {
                    this.correct[index] = this.text[index];
                    l -= this.text[index].length;
                    index++;

                } else {    // Handles overflow
                    this.correct[index] = this.text[index].slice(0, l);
                    l = 0;
                }
            }
        }
        else {
            this.correct = [correct];
        }
    }
    setActive(val) { this.active = val; }
    getActive() { return this.active; }
    getIndex() { return this.index; }
    setIndex(val) { this.index = val; }

    draw(ctx) {
        // if (!this.active) return;
        // console.log(this.getRawText() + ": " + this.getPos()[2]);
        // ALL messages will have text bubbles
        this.drawTextBubble(ctx);
        // Otherwise, draw the text with possibility of text being highlighted
        this.drawActiveText(ctx);
    }

    // Handles drawing the text portion of an 'active' message
    drawActiveText(ctx) {
        ctx.save();
        ctx.fillStyle = "black";
        // ctx.globalAlpha = 1;
        // if (!this.active) // ctx.globalAlpha = .5;
        ctx.globalAlpha = this.pos[2];
        if (this.pos[2] < 0) ctx.globalAlpha = 0;
        ctx.font = `${this.fontSize}pt sans-serif`
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        let heightChange = this.fontSize + this.padding[1];
        for (let i = 0; i < this.text.length; i++) {
            ctx.fillText(this.text[i], this.pos[0] + this.padding[0], this.pos[1] + this.padding[1] + (heightChange * i));
        }
        // ctx.fillText(this.text[0], this.pos[0] + 10, this.pos[1] + 8);
        // ctx.strokeText(text, pos[0] + 5, pos[1] + 8);

        // Draw the active text
        ctx.fillStyle = "white";
        for (let i = 0; i < this.correct.length; i++) {
            ctx.fillText(this.correct[i], this.pos[0] + this.padding[0], this.pos[1] + this.padding[1] + (heightChange * i));
        }
        // draw cursor?
        if (this.correct.length > 0)
        {
            // console.log(this.correct[0]);
            // console.log(this.correct.length);
            let lastLine = this.correct[this.correct.length - 1];
            if (lastLine.length === 0) {ctx.restore();return;}
            let eol = lastLine[lastLine.length - 1];
            // Draw cursor at the eol position
            // ctx.fillText('|', this.pos[0] + this.padding[0] + ctx.measureText(lastLine).width - 2, this.pos[1] + this.padding[1] + (heightChange * (this.correct.length - 1)));
            ctx.beginPath();
            ctx.strokeStyle = "white";
            // ctx.strokeWeight = 2;
            ctx.lineWidth = 1.5;
            let val = animations.getCursor();
            ctx.globalAlpha = val > 1 ? 1 : val;
            let x = this.pos[0] + this.padding[0] + ctx.measureText(lastLine).width - 1;
            let y = this.pos[1] + this.padding[1] + (heightChange * (this.correct.length - 1));
            ctx.moveTo(x,y);
            ctx.lineTo(x, y + 15);
            ctx.fill();
            ctx.stroke();
        }
        // ctx.fillText(this.correct, this.pos[0] + 10, this.pos[1] + 8);
        // ctx.strokeText(correct, pos[0] + 5, pos[1] + 8);
        ctx.restore();
    }

    // Handles drawing the background of the text
    drawTextBubble(ctx) {
        // draws bubble
        ctx.save();
        ctx.fillStyle = this.color;
        // ctx.globalAlpha = 1;
        // if (!this.active) //ctx.globalAlpha = .5;
        ctx.globalAlpha = this.pos[2];
        if (this.pos[2] < 0) ctx.globalAlpha = 0;
        ctx.beginPath();
        ctx.roundRect(this.pos[0], this.pos[1], this.size[0], this.size[1], 15);
        ctx.fill();
        ctx.restore();
    }

    // returns this message's position as if it were aligned right
    getInactivePos(w) {
        return [w - this.size[0] - 10, this.pos[1]];
    }

    determineBubbleSize(text, max, fontSize, ctx) {
        // Measure the size of the text
        ctx.font = `${this.fontSize}pt sans-serif`
        let width = ctx.measureText(text[0]).width;
        // width = div.clientWidth - 20;
        // width += this.fontSize;
        // width += this.padding[0];
        let size = [];
        // Checks if we have more chars than width. If so, cap width and add height
        size[0] = width > max ? max : width;
        size[1] = width > max ? (Math.trunc(width / max) + 1) : 1;

        
        let t = text;
        // simply cutting in 3 isn't good enough...
        // New strategy: have a temp variable store the current line
        // add characters to the line while doing so doesn't exceed width
        // once that happens, store in t and go to next line
        // If we end up having more height, split the text into an array
        if (size[1] > 1) {
            let line = "";
            let count = 0;
            let lineCount = 0;
            let h = 0;
            let rawText = text[0];
            ctx.font = `${this.fontSize}pt sans-serif`
            // widths stores each line's width for later use
            let widths = [];
            t = [];
            while (count < rawText.length) {
                line += rawText[count];
                // Did adding this char exceed the max?
                if (ctx.measureText(line).width > max - (this.padding[0])) {
                    // before storing this line, check to see if we're in the middle of a word
                    if (rawText[count] != ' ' && rawText[count+1] != ' ') { // We are in the middle of a word if the current char and the next char both aren't spaces
                        // we need to modify line before storing it AND set line to the word fragment we remove
                        let backwards = lineCount;
                        while(rawText[backwards] != ' ') {
                            backwards--;
                        }
                        console.log("BEFORE: " + line);
                        console.log("DATA: " + backwards + "," + count);
                        t[h] = line.slice(0, backwards);
                        console.log("STEP 1: " + line);
                        line = line.slice(backwards);
                        console.log("ALERT: " + line + " AND: " + t[h]);
                    } else {

                        t[h] = line;
                        line = "";
                    }
                    if (t[h][0] === ' ') {
                        t[h] = t[h].slice(1);
                        t[h - 1] += ' ';
                    }
                    widths[h] = ctx.measureText(t[h]).width;
                    lineCount = 0;
                    h++;
                }
                count++;
                lineCount++;
            }
            t[h] = line;
            if (t[h][0] === ' ') {
                t[h] = t[h].slice(1);
                t[h - 1] += ' ';
            }
            h++;
            size[1] = h;
            size[0] = 0;
            // We have the mutated widths.  May have to decrease total width of bubble
            for (let w of widths) {
                if (w > size[0]) size[0] = w;
            }
        }
        // Store the values and return
        size[0] += this.padding[0] * 2;
        size[1] = (fontSize * (size[1]))  + ((size[1] + 1) * this.padding[1]);
        // size[1] += this.padding[1] * 2;
        return [size, t];
    }
};

function gDetermineBubbleSize(text, max, fontSize, ctx, padding) {
    // Measure the size of the text
    ctx.font = `${fontSize}pt sans-serif`
    let width = ctx.measureText(text[0]).width;
    // width = div.clientWidth - 20;
    // width += this.fontSize;
    // width += this.padding[0];
    let size = [];
    // increase bubble size by 50% if text height would go off screen
    // Hard coded AF
    if (width > 900) 
    {
        max *= 1.3;
        console.log(text[0].length);
        console.log(width);
        console.log("beeeeg");
    }

    // Checks if we have more chars than width. If so, cap width and add height
    size[0] = width > max ? max : width;
    size[1] = width > max ? (Math.trunc(width / max) + 1) : 1;

    
    let t = text;
    // simply cutting in 3 isn't good enough...
    // New strategy: have a temp variable store the current line
    // add characters to the line while doing so doesn't exceed width
    // once that happens, store in t and go to next line
    // If we end up having more height, split the text into an array
    if (size[1] > 1) {
        let line = "";
        let count = 0;
        let lineCount = 0;
        let h = 0;
        let rawText = text[0];
        ctx.font = `${fontSize}pt sans-serif`
        // widths stores each line's width for later use
        let widths = [];
        t = [];
        while (count < rawText.length) {
            line += rawText[count];
            // Did adding this char exceed the max?
            if (ctx.measureText(line).width > max - (padding[0])) {
                // before storing this line, check to see if we're in the middle of a word
                if (rawText[count] != ' ' && rawText[count+1] != ' ') { // We are in the middle of a word if the current char and the next char both aren't spaces
                    // we need to modify line before storing it AND set line to the word fragment we remove
                    let backwards = lineCount;
                    // Back up until we hit a space (get whole word)
                    while(line[backwards] != ' ') {
                        backwards--;
                    }
                    // store the line up to the last word
                    t[h] = line.slice(0, backwards);
                    // save the word fragment into line
                    line = line.slice(backwards);
                    // lineCount reflects the no. of chars in the word frag
                    lineCount = line.length;
                } else {
                    // normal stuff
                    // store the full ine
                    t[h] = line;
                    // line no exist
                    line = "";
                    lineCount = 0;
                }
                // Pesky space messing up your readability? Not for long!
                if (t[h][0] === ' ') {
                    t[h] = t[h].slice(1);
                    t[h - 1] += ' ';
                }
                // IMPORTANT! Store the widths so we can pick the max width later for the bubble size
                widths[h] = ctx.measureText(t[h]).width;
                h++;
            }
            count++;
            lineCount++;
        }
        // overflow line
        t[h] = line;
        // Pesky space messing up your readability? Not for long!
        if (t[h][0] === ' ') {
            t[h] = t[h].slice(1);
            t[h - 1] += ' ';
        }
        widths[h] = ctx.measureText(t[h]).width;
        h++;
        size[1] = h;
        size[0] = 0;
        // We have the mutated widths.  May have to decrease total width of bubble
        for (let w of widths) {
            if (w > size[0]) size[0] = w;
        }
    }
    // Store the values and return
    size[0] += padding[0] * 2;
    size[1] = (fontSize * (size[1]))  + ((size[1] + 1) * padding[1]);
    // size[1] += this.padding[1] * 2;
    return [size, t];
}

export { Message, ActiveMessage };