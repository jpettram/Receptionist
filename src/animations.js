let timer_60 = 0;
let dAndUFPS = 60;
// Initializes animation intervals?
function Init() {


    let animHandle = setInterval(updateTimer, 1000 / dAndUFPS);
}

// returns offsets on the y position based on time
function updateTimer() {
    timer_60 += 1 / 60;
}

function getDownAndUp(){
    return (Math.sin(timer_60 * 4));
}
function getCursor(){
    // return Math.abs((Math.sin(timer_60 * 2)));
    return Math.sin(timer_60 * 4) + 1;
}

let movers = [];
let timeStarts = [];
let moveToHandle = null;
let positions = [];
let goals = [];
let goalTimes = [];
let vectorsTo = [];
let counters = [];


function moveTo(posRef, startPos, goal, time){
    if (startPos[0] === goal[0] && startPos[1] === goal[1] && startPos[2] === goal[2]) 
    {
        // console.log("Pos is same as goal");
        return;
    }
    if (moveToHandle === null)
        moveToHandle = requestAnimationFrame(moveToLoop);
    // Initialize animation
    timeStarts[timeStarts.length] = timer_60;
    // moveRightHandles[moveRightHandles.length] = requestAnimationFrame(moveO)
    positions[positions.length] = posRef;
    goals[goals.length] = goal;
    // console.log(goal);
    goalTimes[goalTimes.length] = time;
    movers[movers.length] = true;
    counters[counters.length] = 0;
    vectorsTo[vectorsTo.length] = [goal[0] - startPos[0], goal[1] - startPos[1], goal[2] - startPos[2]];
}

function moveToLoop() {
    if (positions.length === 0){
        // console.log("cancelling");
        cancelAnimationFrame(moveToHandle);
        moveToHandle = null;
        return;
    }
    // store handle
    moveToHandle = requestAnimationFrame(moveToLoop);
    // Iterate through all objects to move
    for (let i = 0; i < positions.length; i++) {
        // Update position according to vector
        positions[i][0] += vectorsTo[i][0] * 1 / goalTimes[i];
        positions[i][1] += vectorsTo[i][1] * 1 / goalTimes[i];
        positions[i][2] += vectorsTo[i][2] * 1 / goalTimes[i];
        // increment counter
        counters[i]++;
        // If we exceed time limit
        if (counters[i] >= goalTimes[i]) {
            // console.log("wha");
            // if (goals[i][2] < 0) goals[i][2] = 0;
            // Set final position and remove from list
            positions[i] = [goals[i][0], goals[i][1], goals[i][2]];
            // console.log(positions[i])
            positions.splice(i,1);
            goals.splice(i,1);
            timeStarts.splice(i,1);
            goalTimes.splice(i,1);
            vectorsTo.splice(i,1);
            counters.splice(i,1);
        }
    }
}

let jiggling = false
let jiggleHandle = null;
let jigglePositions = [];
let jiggleGoalTime;
let jiggleCounter;
let jiggleVector;
function jiggle(posRef, time) {
    if (jiggling) return;
    if (jiggleHandle === null)
        jiggleHandle = requestAnimationFrame(jiggleLoop);
    
    // Commence the jiggle
    jiggling = true;
    for (let p of posRef) {
        jigglePositions[jigglePositions.length] = p.getPos();
    }
    jiggleGoalTime = time;
    jiggleCounter = 0;
    jiggleVector = [1,0];
}
function getJiggle() {return jiggling;}

function jiggleLoop() {
    // Done jiggling
    if (jigglePositions.length === 0){
        // console.log("cancelling");
        cancelAnimationFrame(jiggleHandle);
        jiggleHandle = null;
        jiggling = false;
        return;
    }
    // store handle
    jiggleHandle = requestAnimationFrame(jiggleLoop);
    // Iterate through all objects to move
    for (let j of jigglePositions) {
        j[0] += jiggleVector[0];
    }
    jiggleCounter++;
    if (jiggleCounter % 5 === 0)
        jiggleVector[0] *= -1;
    if (jiggleCounter >= jiggleGoalTime) {
        jigglePositions = [];
    }

}

export {getDownAndUp, getCursor, Init, moveTo, jiggle, getJiggle};