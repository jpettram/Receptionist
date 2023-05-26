
/*
    main.js is primarily responsible for hooking up the UI to the rest of the application 
    and setting up the main event loop
*/

import * as canvas from './canvas.js';
import * as classes from './classes.js';
import * as utils from './utils.js';
import * as animations from './animations.js';
// import {Howl, Howler} from 'howler';


let notif = new Howl({
    src: ['./Sounds/notification.mp3'],
    sprite: {
        outgoing: [250,1000],
        incoming: [2300,3000]
    }
});
let success = new Howl({
    src: ['./Sounds/success.mp3']
})
let pop = new Howl({
    src: ['./Sounds/pop.mp3'],
    sprite: {
        pop: [600,300]
    }
});
Howler.volume(1.0);
notif.play('incoming');
// pop.play('pop');
// success.play();
let target, correct, output, fontSize, activeFontSize, ctx, first, h, w, min;

let activeMessages = [];
let activePositions = [];
let messagesToDraw = [];
let unMatched = [];
let messages = [];
let end = false;

// DEV CHEAT
let devCheat = false;
// THINK TIME
let thinkTime = 200;
// TUTORIAL BOOL
let tutorial = true;


// hash maps to hold text information
let tempMap = utils.getScenarioOne();
const map = tempMap[0];
const responses = tempMap[1];

// params that will be passed to the canvas draw to draw active message boxes
const drawParams = {
    target,
    correct
};

// Game States?
let playerTurn = true;
let timer = 0;          // Controls when the AI Message should pop up
let anim;
let AIMessage;
let AIx = 10;
let AIy = 400;
let botAnchorY = 400;
let topAnchorY;
let genAnchorY;
let AIThinking;
let ah;
let messageSend;
let messageSendSpeed = 25;
let fadeSpeed = 20;
let moveSpeed = 20;
let waiting = false;

// Scroll wheel vars
let offCenter = false;

// Vars ues for keyboard
let input = '';
let index = 0;

// choose font size here
fontSize = 11;
activeFontSize = fontSize + 2;

let prevActiveCount = 0;
let sendSpeedRef;

// Initialize basic app functions
function init() {
    console.log("init called");

    // Canvas properties
    let canvasElement = document.querySelector("canvas"); // hookup <canvas> element
    canvas.setUpCanvas(canvasElement);
    w = canvasElement.width;
    h = canvasElement.height;
    // Hardcoded header size...
    min = 50;
    topAnchorY = min + fontSize;
    genAnchorY = topAnchorY;
    botAnchorY = canvasElement.height - 100;
    ah = botAnchorY + fontSize;
    
    ctx = canvas.getContext2D();

    // Where Ending information is displayed
    output = document.querySelector("#end");
    output.innerHTML = "";


    correct = '';
    // document.querySelector("#dev").style.display = devCheat ? 'block' : 'none' ;

    // Set up animation speed modifier
    // animation speeds hookup:
    sendSpeedRef = document.querySelector("#sendSpeed");
    sendSpeedRef.addEventListener('input', updateSpeed)
    function updateSpeed(e) {
        messageSendSpeed = e.target.value * 100;
    }
    // Active messages should dynamically determine their position
    activeMessages[0] = new classes.ActiveMessage(ctx, "I'm planning on visiting some attractions today, can you help me a bit?", [w - 10, ah], activeFontSize);
    activeMessages[1] = new classes.ActiveMessage(ctx, "Can you help me choose a restaurant?", [activeMessages[0].getPos()[0], ah], activeFontSize);
    activeMessages[2] = new classes.ActiveMessage(ctx, "I'm checking out", [activeMessages[1].getPos()[0], ah], activeFontSize);
    messagesToDraw = activeMessages;

    for (let i = 0; i < activeMessages.length; i++)
        activePositions[activePositions.length] = activeMessages[i].getPos();

    // Regular messages
    messages[messages.length] = new classes.Message(ctx, "How can I help you?", [AIx, genAnchorY], false, w, fontSize);

    // AI thinking message
    AIThinking = new classes.Message(ctx, "...", [AIx,botAnchorY], false, w, fontSize);

    // Split this up into a separate function because reducing it doesn't work 
    // for whatever reason
    output.addEventListener("click", reload);
    function reload() {        
	 window.location.href = "https://www.typingtest.com/thelab/";    
	 }

    // Scroll Wheel functionality
    canvasElement.addEventListener("mousewheel", handleMouseWheel, false);

    // Main keyboard functionality
    document.addEventListener('keydown', handleKeyboard);
    // loops brother
    loop();
}


function toggleDevCheat() {
    devCheat = !devCheat;
    // sendSpeedRef.setAttribute("visible", devCheat);
    // sendSpeedRef.style.display = devCheat ? 'block' : 'none' ;
    document.querySelector("#dev").style.display = devCheat ? 'block' : 'none' ;
    return "Devcheat? " + devCheat;
}
function loop() {
    requestAnimationFrame(loop);

    // draw everything to canvas
    canvas.draw(drawParams);
    canvas.drawBody(topAnchorY, botAnchorY - topAnchorY);
    // Draw tutorial?
    if (tutorial) canvas.drawTutorial(w/2, h / 2);
    for (let m of messages) { m.draw(ctx); }
    // draw footer 
    canvas.drawFooter(botAnchorY);
    if (playerTurn)
        for (let m of activeMessages) { m.draw(ctx); }
    else messageSend.draw(ctx);
    if (!playerTurn && !animating && !waiting) { AIThinking.draw(ctx); }

    canvas.drawHeader();
    canvas.drawScrollWheel(
        messages[0].getPos()[1], 
        messages[messages.length - 1].getFullHeight(), 
        botAnchorY - topAnchorY, 
        topAnchorY,
        botAnchorY);
    // canvas.drawBorder();
}

function handleKeyboard(event) {
    const key = event.key;  // The key that was pressed
    first = true;
    // Regular expression to allow certain keys
    let regex = /[^A-z!@#$%^&*()?,'.:;\ ]/i;        // Backslash followed by space includes spacebar

    if (offCenter) {
        offCenter = false;
        // setRecursiveHeight(
        //     messages[messages.length - 1], 
        //     topAnchorY - ((messages[messages.length - 1].getFullHeight() - messages[0].getPos()[1]) - (botAnchorY - topAnchorY)));
    }
    // Early return if not player turn
    if (!playerTurn) return;
    // Special cases:
    // Shortcut CHEAT: Autocompletes the current message you're typing
    if (key === "Control" && devCheat) {
        for (let m of messagesToDraw) if (m.getActive()) {
            correct = m.getRawText();
            m.setDrawData(correct);
            break;
        }
    }
    // Can we submit?
    if (key === "Enter") {
        // Check if we're done with current message.  If yes, change activeMessage to regular message
        for (let m of activeMessages) {
            // Inactive, we don't care
            if (!m.getActive()) { continue; }
            if (correct === m.getRawText()) {
                // now what?
                // First, was this the last message of the story?
                if (end) {
                    // YES, so activate the ending and return
                    output.innerHTML = responses.get(correct);
                    output.innerHTML += `<br>Game Finished, please click <b>here</b> to restart`
                    correct = '';
                    index = 0;
                    end = false;
                    // playerTurn = false;
                    messages[messages.length] = new classes.Message(ctx, m.getRawText(), m.getInactivePos(w), true, w, fontSize);
                    let sentMessage = messages[messages.length - 1];
                    sentMessage.setAlpha(0);
                    sentMessage.setPos([w,sentMessage.getPos()[1],0]);
                    animations.moveTo(sentMessage.getPos(), sentMessage.getPosCopy(), [w - 10 - sentMessage.getSize()[0],m.getInactivePos(w)[1],1], messageSendSpeed);
                    // setRecursiveHeight();
                    setRecursiveHeight(messages.length - 1, messages[0].getPos()[1]);
                    // After setting recursive height: Check if we need to bump above the anchor
                    formatMessages();
                    activeMessages = [];
                    messagesToDraw = [];
                    Howler.volume(0.5);
                    success.play();
                    messageSend = m;
                    animations.moveTo(m.getPos(), m.getPosCopy(), [(w-10),m.getPos()[1],0], messageSendSpeed);
                    return;
                }
                // Add activeMessage to regular messages
                messages[messages.length] = new classes.Message(ctx, m.getRawText(), m.getInactivePos(w), true, w, fontSize);
                let sentMessage = messages[messages.length - 1];
                sentMessage.setAlpha(0);
                sentMessage.setPos([w,sentMessage.getPos()[1],0]);
                animations.moveTo(sentMessage.getPos(), sentMessage.getPosCopy(), [w - 10 - sentMessage.getSize()[0],m.getInactivePos(w)[1],1], messageSendSpeed);
                
                // Add AI message
                let temp = m.getInactivePos();
                // dummy size values
                temp[0] = 10;
                temp[1] += fontSize * 2;
                let mes = messages[messages.length - 1];
                genAnchorY = mes.getSize()[1];
                AIMessage = new classes.Message(ctx, responses.get(correct), [AIx, genAnchorY], false, w, fontSize);

                // bump all messages up by the size of the message we just typed
                // for (let m of messages) { m.bump(messages[messages.length - 1].getSize()[1]); }
                // setRecursiveHeight();
                setRecursiveHeight(messages.length - 1, messages[0].getPos()[1]);
                // After setting recursive height: Check if we need to bump above the anchor
                formatMessages();
                // Send the message to AITurn func
                AITurn(mes.getPos()[1] + mes.getSize()[1]);
                // no longer player turn
                playerTurn = false;
                // Temporary dummy text
                // MEssage send animation?
                messageSend = m;
                animations.moveTo(m.getPos(), m.getPosCopy(), [(w-10),m.getPos()[1],0], messageSendSpeed);

                // prepare for new active messages
                activeMessages = [];
                // get the list of newchoices
                let newChoices = map.get(correct);
                for (let s of newChoices) {
                    // Keyword baked into text.  Notifies program that this is the end
                    if (s.slice(0, 3) === "END") {
                        newChoices[activeMessages.length] = s.slice(3);
                        end = true;
                    }
                    // Create the new active message
                    activeMessages[activeMessages.length] =
                        new classes.ActiveMessage(ctx, newChoices[activeMessages.length],
                            [activeMessages[activeMessages.length - 1] ? activeMessages[activeMessages.length - 1].getPos()[0] : w - 10, ah],
                            activeFontSize);
                }
                messagesToDraw = activeMessages;
                for (let i = 0; i < activeMessages.length; i++)
                    activePositions[activePositions.length] = activeMessages[i].getPos();
                // Reset vals
                correct = '';
                index = 0;
                prevActiveCount = 0;
                notif.play('outgoing');
                return;
            }
        }
    }
    // Backspace functionality
    if (key === "Backspace") {
        // if there is stuff in correct, remove last char then reactivate inactive messages
        if (correct.length > 0) {
            correct = correct.slice(0, correct.length - 1);
            index--;
            // now check if we should reactivate one of the inactives
            for (let m of activeMessages) {
                if (!m.getActive()) {
                    if (m.getIndex() === index) {
                        m.setActive(true);
                        m.setDrawData(correct);
                    }
                }
                else {
                    m.setDrawData(correct);
                }
            }
            let c = 0;
            for (let m of activeMessages) {
                if (m.getActive())
                {
                    messagesToDraw[c] = m;
                    c++;
                }
            }
            prevActiveCount = c;
            repositionActiveMessages(messagesToDraw.length - 1, true);
        }
        return;
    }
    // Are we jiggling?
    if (animations.getJiggle()) return;
    // valid key?
    if (key.length !== 1 || key.match(regex)) {
        return;
    }
    input = key;
    unMatched = [];
    messagesToDraw = [];
    // iterate through active messages
    for (let m of activeMessages) {
        // if this key pressed matches the key at this index AND is active
        if (input === m.getRawText()[index] && m.getActive()) {
            if (first) {
                correct += input;
                first = false;
                tutorial = false;
            }
            m.setDrawData(correct);
        }
        else if (input !== m.getRawText()[index] && m.getActive()) {
            unMatched[unMatched.length] = m;
            // m.setActive(false);
            // m.setIndex(index);

        }
    }
    let activeCount = 0;
    // Count how many actives we have
    for (let m of activeMessages)
        if (m.getActive())
        {
            activeCount++;
        }
    // Store when each message was deactivated for later reactivation
    if (unMatched.length < activeCount) {
        for (let m of unMatched) {
            m.setActive(false);
            m.setIndex(index);
        }
    }
    if (unMatched.length === activeCount) {
        // user did not match any of the messages
        // play jiggle animation for incorrect keypress
        animations.jiggle(activeMessages, 20);
    }
    activeCount = 0;
    for (let m of activeMessages) {
        if (m.getActive())
        {
            messagesToDraw[activeCount] = m;
            activeCount++;
        }
    }
    // messagesToDraw = activeMessages;
    repositionActiveMessages();
    if (prevActiveCount != activeCount)
        fadeInactiveMessages();
    prevActiveCount = activeCount;
    // If a successful key was typed, increment
    if (!first) index++;
}

// If messages are no longer active, reposition so that empty space is condensed
function repositionActiveMessages(counter = messagesToDraw.length - 1, backwards = false)
{
    if (messagesToDraw.length === 0) return;
    if (moving != null) return;
    if (counter === 0)
    {
        // we are at bottom, set position
        // console.log('ur a bottom');
        // console.log(messagesToDraw[counter].getRawText());
        // let q = messagesToDraw[counter].setRecursivePosX(w - 10);
        let q = messagesToDraw[counter].getRecursivePosX(w - 10);
        // animations.moveRightTo(messagesToDraw[counter].getPos(), q);
        let tempM = messagesToDraw[counter];
        let fade = tempM.getActive() ? 1 : 0;
        let g = [q, tempM.getPos()[1], fade];
        let pp = tempM.getPos();
        if (g[0] == pp[0] && g[1] == pp[1] && g[2] == pp[2])
            return q;
        // console.log(fade);
        animations.moveTo(tempM.getPos(), tempM.getPosCopy(), [q, tempM.getPos()[1], fade], moveSpeed);
        moveCounter = 0;
        moving = requestAnimationFrame(trackMove);
        return q;
    }
    else
    {
        // let z = messagesToDraw[counter].setRecursivePosX(repositionActiveMessages(--counter));
        // let n = repositionActiveMessages(--counter);
        // console.log(messagesToDraw[counter].getRawText());
        let z = messagesToDraw[counter].getRecursivePosX(repositionActiveMessages(counter - 1));
        // animations.moveRightTo(messagesToDraw[counter].getPos(), z);
        let tempM = messagesToDraw[counter];
        let fade = tempM.getActive() ? 1 : 0;
        let g = [z, tempM.getPos()[1], fade];
        let pp = tempM.getPos();
        if (g[0] == pp[0] && g[1] == pp[1] && g[2] == pp[2])
            return z;
        // console.log(fade);
        animations.moveTo(tempM.getPos(), tempM.getPosCopy(), [z, tempM.getPos()[1], fade], moveSpeed);
        moveCounter = 0;
        moving = requestAnimationFrame(trackMove);
        return z;
    }
}
function fadeInactiveMessages(){
    for (let m of activeMessages) {
        if (!m.getActive()) {
            // console.log("Fading");
            animations.moveTo(m.getPos(), m.getPosCopy(), [m.getPosCopy()[0], m.getPosCopy()[1], 0], fadeSpeed);
        }
    }
}

let moveCounter = 0;
let moving = null;
function trackMove() {
    moving = requestAnimationFrame(trackMove);
    moveCounter++;
    if (moveCounter > moveSpeed) {
        cancelAnimationFrame(moving);
        moving = null;
    }
}

// Controls the AI Turn (Waits briefly then 'responds')
function AITurn(h) {
    anim = requestAnimationFrame(AITurn);
    if (animating) return;
    if (timer == 0) {
        // console.log("AI turn start");
        AIThinking.setHeight(h);
        // console.log('Timer: ' + timer);
        waiting = true;
        messages[messages.length] = AIThinking;
        // setRecursiveHeight();
        setRecursiveHeight(messages.length - 1, messages[0].getPos()[1]);
        // After setting recursive height: Check if we need to bump above the anchor
        formatMessages(true);
        // Do it NORMALLY
        // formatMessagesNorm();
        // h = messages[messages.length - 1].getPos()[1];
        // AIThinking.setHeight(h);
        messages = messages.slice(0, messages.length - 1);
    }
    else if (timer > messageSendSpeed + 50 && waiting) {
        waiting = false;
        // console.log('wha');
        pop.play('pop');
    }
    timer++;
    if (timer > thinkTime + (messageSendSpeed + 50)) {
        timer = 0;
        playerTurn = true;
        cancelAnimationFrame(anim);
        // Put AI text here
        messages[messages.length] = AIMessage;
        // Do some recursion magic and Ensure all messages are evenly spaced 
        // and correctly spaced above player type messages
        // setRecursiveHeight();
        setRecursiveHeight(messages.length - 1, messages[0].getPos()[1]);
        // After setting recursive height: Check if we need to bump above the anchor
        formatMessages();
        notif.play('incoming');
        // console.log("Response, animating: " + animating);
    }
}

// For all messages, most recent message is at the bottom.
// So that will be our base case
// At the bottom, we set y pos to be AIy - height
// Then take that position's y and feed it to the previos message's y
// All the way up
function setRecursiveHeight(counter = messages.length - 1, topHeight = topAnchorY) {
    // early return
    if (messages.length === 0) return;
    // Base case
    if (counter === 0) {
        // We are at the bottom, so return
        return messages[counter].setHeight(topHeight);
    }
    else {
        // Otherwise, recurse   
        return messages[counter].setHeight(setRecursiveHeight(--counter, topHeight));
    }
}

function formatMessagesNorm() {
    // if the most recent message would go PAST the bot anchor
    // bump all messages up by the amt past the anchor the message would go
    let amt = messages[messages.length - 1].getFullHeight();
    if (amt > botAnchorY - 5) {
        // bump errything
        for (let m of messages) m.bump((botAnchorY - bumpamt - 5));
    }
}
let bumpTime;
let handle;
let animating;
let bumpamt;
function formatMessages(aiStart = false) {
    // if the most recent message would go PAST the bot anchor
    // bump all messages up by the amt past the anchor the message would go
    let amt = messages[messages.length - 1].getFullHeight();
    if (amt > botAnchorY - 5) {
        // bump errything
        // if (animating) return;
        animating = true;
        bumpamt = amt;
        bumpTime = 0;
        animatedBump(aiStart);
    }
}

function animatedBump(ais) {
    handle = requestAnimationFrame(animatedBump);
    for (let m of messages) m.bump((botAnchorY - bumpamt - 5) / 20);
    // console.log("Bumping?");
    bumpTime++;
    if (bumpTime >= 20) 
    {
        cancelAnimationFrame(handle);
        animating = false;
        if (ais) AIThinking.setHeight(messages[messages.length - 1].getFullHeight());
    }
}

// Handles chat scrolling
function handleMouseWheel(e) {
    let delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    let scrollAmt = 10;
    if (delta == 1) {
        // if (messages[messages.length - 1].getPos()[1] <= botAnchorY) return;
        moveAllMessages(-scrollAmt);
    }
    if (delta == -1) {
        // if (messages[0].getPos()[1] >= topAnchorY) return;
        moveAllMessages(scrollAmt);
    }
    offCenter = true;
    return false;
}

function moveAllMessages(amt) {
    // if (!playerTurn) return;
    // Do we even need to scroll?
    if (!canvas.scrollWheelActive()) return;
    let yuck = canvas.getValidScroll(
        amt, 
        messages[0].getPos()[1], 
        messages[messages.length - 1].getFullHeight(), 
        botAnchorY - topAnchorY, 
        topAnchorY - 5, 
        botAnchorY - 5);
    setRecursiveHeight(messages.length - 1, yuck);
    return;
    let scrollAmt = amt;
    // check if moving the top message by amt would make it greater than topAnchor
    // if (messages[0].getPos()[1] + amt > AIy) return;
    let hMes = messages[0].getPos()[1];
    if (hMes + amt >= topAnchorY && amt > 0) {
        scrollAmt = (hMes + amt - topAnchorY);
        console.log("DOWN: " + scrollAmt);
        //for (let m of messages) m.bump(amt);
        //return;
    }
    hMes = messages[messages.length - 1].getFullHeight();
    // Check if moving bottom message by am would make it less than bot anchor
    if (hMes + amt <= botAnchorY && amt < 0) {
        scrollAmt = -(botAnchorY - hMes + amt);
        console.log("UP: " + scrollAmt);
        //for (let m of messages) m.bump(amt);
        //return;
    } 
    for (let m of messages) m.bump(scrollAmt);
}



export { init, toggleDevCheat };