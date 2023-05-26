
/*
    main.js is primarily responsible for hooking up the UI to the rest of the application 
    and setting up the main event loop
*/

import * as canvas from './canvas.js';
import * as classes from './classes.js';
import * as utils from './utils.js';
import * as animations from './animations.js';

// const {MongoClient} = require('mongodb');
// import {Howl, Howler} from 'howler';
// import { MongoClient } from '../node_modules/mongodb/lib/index.js';
// import * as mongodb from '../node_modules/mongodb';
// import {Db as MongoDb, MongoClient} from 'mongodb';

let notif = new Howl({
    src: ['./Sounds/notification.mp3'],
    sprite: {
        outgoing: [250, 1000],
        incoming: [2300, 3000]
    }
});
let success = new Howl({
    src: ['./Sounds/success.mp3']
})
let pop = new Howl({
    src: ['./Sounds/pop.mp3'],
    sprite: {
        pop: [600, 300]
    }
});
Howler.volume(1.0);
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
let tutorial = 2;


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

let DB_REF;
let collection;
let localData;
// This is going to allow us to access the localData Bigrams array to update it in linear time
// SUPER necessary as we are going to have a TON of bigrams
let bigramMap = new Map();
// Do the same thing for the individual letters.
// Now, this isn't as needed as I could just add dummy containers for all letters
// in alphabetical order.  But, this is consistent with the previous implementation
let letterMap = new Map();
// Keep track of dirty indices
let dirtyIndices = [];
let id;


// Initialize basic app functions
function init(app, coll) {
    console.log("init called");
    tutorial = sessionStorage.getItem("tutorial");
    if (tutorial == null)
        tutorial = 2;
    if (tutorial == 0)
        notif.play('incoming');

    // Set up Database
    collection = coll;
    // mongoTest();
    // Dumy updates
    // updateDB("ts", 1.234);
    // updateDB("dr", 1.432);
    
    // Store the id we're using to query the DB from local storage (should exist by now)
    id = window.localStorage.getItem('typingID');
    
    // Do we have local data to work with?
    localData = window.localStorage.getItem('typingData');
    localData = JSON.parse(localData);
    // console.log(localData);
    // using localData.Bigrams, populate the map with indices of bigrams already stored
    try {
        for (let i = 0; i < localData.Bigrams.length;i++) {
            bigramMap.set(localData.Bigrams[i].Bigram, i);
        }
        for (let i = 0; i < localData.Letters.length;i++) {
            letterMap.set(localData.Letters[i].Letter, i);
        }
    }
    catch (e) {
        console.log("Bigram doesn't exist, add to end");
    }
    // Now immediately update DB with data gathered previously
    updateDBData();

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
    // Active messages should dynamically determine their position
    if (tutorial == 0) {
        // Normal game setup
        activeMessages[0] = new classes.ActiveMessage(ctx, "I'm planning on visiting some attractions today, can you help me a bit?", [w - 10, ah], activeFontSize);
        activeMessages[1] = new classes.ActiveMessage(ctx, "Can you help me choose a restaurant?", [activeMessages[0].getPos()[0], ah], activeFontSize);
        activeMessages[2] = new classes.ActiveMessage(ctx, "I'm checking out", [activeMessages[1].getPos()[0], ah], activeFontSize);
    }
    else
    {
        // TUTORIAL SETUP
        activeMessages[0] = new classes.ActiveMessage(ctx, "Hello", [w - 10, ah], activeFontSize);
    }
    messagesToDraw = activeMessages;

    for (let i = 0; i < activeMessages.length; i++)
        activePositions[activePositions.length] = activeMessages[i].getPos();

    // Regular messages
    if (tutorial == 0)
        messages[messages.length] = new classes.Message(ctx, "How can I help you?", [AIx, genAnchorY], false, w, fontSize);

    // AI thinking message
    AIThinking = new classes.Message(ctx, "...", [AIx, botAnchorY], false, w, fontSize);

    // Split this up into a separate function because reducing it doesn't work 
    // for whatever reason
    output.addEventListener("click", reload);
    function reload() { location.reload(); }

    // Scroll Wheel functionality
    canvasElement.addEventListener("mousewheel", handleMouseWheel, false);

    // Main keyboard functionality
    document.addEventListener('keydown', handleKeyboard);
    // Store the current time
    timeLastHit = Date.now();
    // loops brother
    loop();
}

async function mongoTest() {
    let result;
    // result = await collection.insertOne({
    //     name: "lily of the valley",
    //     sunlight: "full",
    //     color: "white",
    //     type: "perennial",
    //     _partition: "Store 47",
    // });
    // console.log(result);
    result = await collection.findOne({Bigram: "aa"});
    console.log("Result: ", result.TimesWritten);
    result.TimesWritten++;
    result = await collection.updateOne(
        {Bigram: "aa"},
        { $set: {TimesWritten: `${result.TimesWritten}`}});
    console.log("Updated? ", result);
    if (result.matchedCount >= 1)
        console.log("YUH: ", result.matchedCount);

}

// FirstVisit: Date.now(),
// LastVisit: Date.now(),
// DaysInARow: 0,
// TimesPlayed: 0,
// SentencesWritten: 0,
// Bigrams: []
async function updateDBBigrams() {
    let result;
    result = await collection.updateOne(
        {_id: Realm.BSON.ObjectId(id)},
        // Update relevant data
        {$set: {
            Bigrams: localData.Bigrams, 
            Letters: localData.Letters,
            SentencesWritten: ++localData.SentencesWritten
        }}
    );
    // console.log("DB updated?", result);
}
async function updateDBData() {
    let result;
    result = await collection.updateOne(
        {_id: Realm.BSON.ObjectId(id)},
        // Update relevant data
        {$set: {
            LastVisit: localData.LastVisit,
            DaysInARow: localData.DaysInARow,
            TimesPlayed: localData.TimesPlayed
        }}
    );
    // console.log("DB updated?", result);
}

async function updateDB(b, t) {
    let result;
    result = await collection.findOne({Bigram: `${b}`});
    console.log("result: ", result);
    if (!result)
    {
        result = await collection.insertOne({
            Bigram: b,
            TimesWritten: "N/A",
            AvgIki: t,
            StdIki: "N/A",
            Errors: 1,
            ErrPros: "N/A"
        });
        console.log(result);
    }
    else
    {
        result = await collection.updateOne(
            {Bigram: b},
            {$set: {Errors: result.Errors + 1, AvgIki: result.AvgIki + ((t - result.AvgIki) / (result.Errors + 1))}});
        console.log(result);
    }
}

function toggleDevCheat() {
    devCheat = !devCheat;
    // sendSpeedRef.setAttribute("visible", devCheat);
    // sendSpeedRef.style.display = devCheat ? 'block' : 'none' ;
    document.querySelector("#dev").style.display = devCheat ? 'block' : 'none';
    return "Devcheat? " + devCheat;
}
function loop() {
    requestAnimationFrame(loop);

    // draw everything to canvas
    canvas.draw(drawParams);
    canvas.drawBody(topAnchorY, botAnchorY - topAnchorY);
    // Draw tutorial?
    if (tutorial == 2) canvas.drawIntro(w / 2, h / 2);
    else if (tutorial == 1 && playerTurn) canvas.drawTutorial(w / 2, h / 2);
    for (let m of messages) { m.draw(ctx); }
    // draw footer 
    canvas.drawFooter(botAnchorY);
    if (playerTurn)
        for (let m of activeMessages) { m.draw(ctx); }
    else messageSend.draw(ctx);
    if (!playerTurn && !animating && !waiting) { AIThinking.draw(ctx); }

    canvas.drawHeader();
    // canvas.drawScrollWheel(
    //     messages[0].getPos()[1],
    //     messages[messages.length - 1].getFullHeight(),
    //     botAnchorY - topAnchorY,
    //     topAnchorY,
    //     botAnchorY);
    // canvas.drawBorder();
}

let timeError;
let timeLastHit;
let madeError = false;
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
                // Decrement tutorial stage after first message typed.
                if (tutorial == 2) tutorial--;
                // now what?
                // Update Bigram data
                // console.log("Updating DB Data");
                updateDBBigrams();
                
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
                    sentMessage.setPos([w, sentMessage.getPos()[1], 0]);
                    animations.moveTo(sentMessage.getPos(), sentMessage.getPosCopy(), [w - 10 - sentMessage.getSize()[0], m.getInactivePos(w)[1], 1], messageSendSpeed);
                    // setRecursiveHeight();
                    setRecursiveHeight(messages.length - 1, messages[0].getPos()[1]);
                    // After setting recursive height: Check if we need to bump above the anchor
                    formatMessages();
                    activeMessages = [];
                    messagesToDraw = [];
                    Howler.volume(0.5);
                    success.play();
                    messageSend = m;
                    animations.moveTo(m.getPos(), m.getPosCopy(), [(w - 10), m.getPos()[1], 0], messageSendSpeed);
                    // Sotre tutorial value in local storage (tutorial happens only if you haven't completed game)
                    sessionStorage.setItem("tutorial", tutorial);
                    return;
                }
                // Add activeMessage to regular messages
                messages[messages.length] = new classes.Message(ctx, m.getRawText(), m.getInactivePos(w), true, w, fontSize);
                let sentMessage = messages[messages.length - 1];
                sentMessage.setAlpha(0);
                sentMessage.setPos([w, sentMessage.getPos()[1], 0]);
                animations.moveTo(sentMessage.getPos(), sentMessage.getPosCopy(), [w - 10 - sentMessage.getSize()[0], m.getInactivePos(w)[1], 1], messageSendSpeed);

                // Add AI message
                let temp = m.getInactivePos();
                // dummy size values
                temp[0] = 10;
                temp[1] += fontSize * 2;
                let mes = messages[messages.length - 1];
                genAnchorY = mes.getSize()[1];
                AIMessage = new classes.Message(ctx, responses.get(correct), [AIx, genAnchorY], false, w, fontSize);

                // The tutorial being active means the anchor is the top
                // This is manifested by a default call to SetRecursHeight
                if (tutorial > 0) {
                    setRecursiveHeight();
                }
                // This method repositions all messages as needed from top to bottom, 
                // bottommost messages are visible.
                else
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
                animations.moveTo(m.getPos(), m.getPosCopy(), [(w - 10), m.getPos()[1], 0], messageSendSpeed);

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
                prevActiveCount = messagesToDraw.length;
                index = 0;
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
                if (m.getActive()) {
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
                // Modify to include stages
                if (tutorial == 1)
                    tutorial--;
                // log the time
                if (madeError && key != ' ') {
                    // console.log((Date.now() - timeError) / 1000);
                    if (correct.length > 1 && correct[correct.length - 2] != ' '){
                        // updateDB(correct[correct.length - 2] + correct[correct.length - 1], ((Date.now() - timeError) / 1000));
                        updateBigramData(correct[correct.length - 2] + correct[correct.length - 1], true, ((Date.now() - timeLastHit) / 1000));
                    }
                }
                // update bigram data
                if (!madeError && correct.length > 1 && correct[correct.length - 2] != ' ' && correct[correct.length - 1] != ' '){
                    // updateBigramData(correct[correct.length - 2] + correct[correct.length - 1]);
                    updateBigramData(correct[correct.length - 2] + correct[correct.length - 1], false, ((Date.now() - timeLastHit) / 1000));
                }
                // Always update letter data (if not space)
                // Ignore first letter as user needs time to read the messages
                if (correct[correct.length - 1] != ' ' && correct.length > 1)
                {
                    UpdateLetterData(correct[correct.length - 1], madeError, (Date.now() - timeLastHit)/1000);
                }
                madeError = false;
                
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
        if (m.getActive()) {
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
        // User made error (disregard spaces)
        if (!madeError)
        {
            madeError = true;
        }
    }
    // Track when this key was struck
    timeLastHit = Date.now();
    activeCount = 0;
    for (let m of activeMessages) {
        if (m.getActive()) {
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

// Update bigram data as needed (in map and local storage)
function updateBigramData(bgram, error = false, t = 0) {
    let bLength = localData.Bigrams.length;
    // console.log("Handling bigram:", bgram);
    try {
        let index = bigramMap.get(bgram);
        // update bigram data at that index
        localData.Bigrams[index].TimesWritten++;
        if (error) {
            // console.log("Error was made");
            // Update number of times you messed up
            localData.Bigrams[index].Errors++;
        }
        // Update percentage error rate
        localData.Bigrams[index].ErrorPros = 
            localData.Bigrams[index].Errors / 
            localData.Bigrams[index].TimesWritten;
        // Update AvgIki and stdlki (only on errors?)
        let roundedVal =  Math.abs(localData.Bigrams[index].AvgIki - t);
        roundedVal = Math.trunc(roundedVal * 10000) / 10000;
        localData.Bigrams[index].StdIki = roundedVal;
        roundedVal = ((t - localData.Bigrams[index].AvgIki) / 
            (localData.Bigrams[index].Errors + 1));
        roundedVal += localData.Bigrams[index].AvgIki;
        roundedVal = Math.trunc(roundedVal * 10000) / 10000;
        localData.Bigrams[index].AvgIki = roundedVal;
        // console.log("modified the bigram:", localData.Bigrams);
    }
    catch (e) {
        // console.log("Bigram doesn't exist, adding to end");
        // if (error) console.log("Error was made");
        bigramMap.set(bgram, bLength);
        localData.Bigrams[bLength] = {
            Bigram: bgram,
            TimesWritten: 1,
            AvgIki: t,
            StdIki: t,
            Errors: error ? 1 : 0,
            ErrorPros: error? 100 : 0
        }
        // console.log("Added to end:", localData.Bigrams);
    }
}

function UpdateLetterData(letter, error = false, t = 0) {
    
    let lLength = localData.Letters.length;
    // console.log("Handling bigram:", bgram);
    try {
        let index = letterMap.get(letter);
        // update bigram data at that index
        localData.Letters[index].TimesWritten++;
        if (error) {
            // console.log("Error was made");
            // Update number of times you messed up
            localData.Letters[index].Errors++;
        }
        // Update percentage error rate
        localData.Letters[index].ErrorPros = 
            localData.Letters[index].Errors / 
            localData.Letters[index].TimesWritten;
        // Update AvgIki and stdlki (only on errors?)
        let roundedVal =  Math.abs(localData.Letters[index].AvgIki - t);
        // Round to 4 decimals
        roundedVal = Math.trunc(roundedVal * 10000) / 10000;
        localData.Letters[index].StdIki = roundedVal;
        roundedVal = ((t - localData.Letters[index].AvgIki) / 
            (localData.Letters[index].Errors + 1));
        // Round to 4 decimals
        roundedVal += localData.Letters[index].AvgIki;
        roundedVal = Math.trunc(roundedVal * 10000) / 10000;
        localData.Letters[index].AvgIki = roundedVal;
        // console.log("modified the bigram:", localData.Letters);
    }
    catch (e) {
        // console.log("Bigram doesn't exist, adding to end");
        // if (error) console.log("Error was made");
        letterMap.set(letter, lLength);
        localData.Letters[lLength] = {
            Letter: letter,
            TimesWritten: 1,
            AvgIki: t,
            StdIki: t,
            Errors: error ? 1 : 0,
            ErrorPros: error? 1.0 : 0
        }
        // console.log("Added to end:", localData.Letters);
    }
}

// If messages are no longer active, reposition so that empty space is condensed
function repositionActiveMessages(counter = messagesToDraw.length - 1, backwards = false) {
    if (messagesToDraw.length === 0) return;
    if (moving != null) return;
    if (counter === 0) {
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
    else {
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
function fadeInactiveMessages() {
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
    if (bumpTime >= 20) {
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