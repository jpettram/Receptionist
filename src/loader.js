import * as main from "./main.js";
window.main = main;

window.onload = ()=>{
	console.log("window.onload called");
	// 1 - do preload here - load fonts, images, additional sounds, etc...
	LoadDB();		// App is started within this method once DB is connected
}

async function LoadDB() {
    const APP_ID = 'typingapp-attwk';
    const app = new Realm.App({id: APP_ID});
    // Create an anonymous credential
    const credentials = Realm.Credentials.anonymous();
    // Authenticate the user
    const user = await app.logIn(credentials);
    // `App.currentUser` updates to match the logged in user
    console.assert(user.id === app.currentUser.id);
    console.log("user logged in?");
    // Connect to specific collection
    const mongo = app.currentUser.mongoClient("mongodb-atlas");
    const collection = mongo.db("TypingTrainer").collection("Users");
    // Check local storage for an id.
    // If it exists, query mongoDB with it and store the object it returns (or pass it to main)
    // If it doesn't, create a new DB object and store the id (and the object)
    let id = window.localStorage.getItem('typingID');
    console.log("ID: " + id);
    if (id === null) {
        console.log("id is null. Creating new DB object and storing it with reference")
        let result = await collection.insertOne({
            FirstVisit: Date.now(),
            LastVisit: Date.now(),
            DaysInARow: 0,
            TimesPlayed: 0,
            SentencesWritten: 0,
            Bigrams: [],
            Letters:[]
        });
        // console.log(result);
        // console.log("result id?", result.insertedId);
        window.localStorage.setItem('typingID', result.insertedId);
        // Store same data in local storage
        window.localStorage.setItem('typingData', JSON.stringify({
            FirstVisit: Date.now(),
            LastVisit: Date.now(),
            // Add special to local storage only (shouldn't cause issues)
            StreakOrigin: Date.now(),
            DaysInARow: 0,
            TimesPlayed: 0,
            SentencesWritten: 0,
            Bigrams: [],
            Letters:[]
        }));
    } else {
        console.log("id is not null. Query DB for matching id and store it in local storage with reference.")
        console.log("Here is the id:", id.trim());
        // Find the ID and log it
        let result = await collection.findOne({_id: Realm.BSON.ObjectId(id)});
        // IMPORTANT: If the user's database data was deleted somehow, result will be null.
        // If this is the case, simply clear localStorage and reload. (local data will be lost)
        // If we want to add a layer of data saving, we could have the local data restore the databse data.
        // However, this is the simplest.
        if (result === null) {
            console.log("Database data missing. Resetting and reloading");
            // Clear data and reload
            window.localStorage.clear();
            location.reload();
        }
        // Update the most recent visit
        result.LastVisit = Date.now();
        // Determine days since last login
        // Get stored data determining when the streak of days started
        let localData = window.localStorage.getItem('typingData');
        localData = JSON.parse(localData);
        // Get time since streak started (in ms)
        let timeSinceLogin = result.LastVisit - localData.StreakOrigin;
        // console.log("Days (in ms): ", timeSinceLogin);
        // console.log("Days (in seconds): ", timeSinceLogin / 86400000);

        // Convert ms -> Days (truncated)
        let daysSinceFirstLogin = timeSinceLogin / 86400000;
        daysSinceFirstLogin = Math.trunc(daysSinceFirstLogin);
        // For days in a row, check if stored days in a row is exactly 1 less than the current truncated days since first login
        // If it is, increment
        if (daysSinceFirstLogin - 1 == result.DaysInARow) {
            // icnrement!
        } else if (daysSinceFirstLogin > result.DaysInARow) {
            // More than a full day has passed (the previous if didn't fire but the value is still greater)
            // Ergo, reset Days in a Row and update LOCAL streakOrigin
            result.DaysInARow = 0;
            result.StreakOrigin = Date.now();
        }
        // Move this somewhere else maybe?
        result.TimesPlayed++;
        // ensure local streakOrigin remains (and if it somehow got lost, remake it)
        result.StreakOrigin = result.StreakOrigin ? result.StreakOrigin : Date.now();
        // console.log(result);
        window.localStorage.setItem('typingData', JSON.stringify(result));
        // Not querying database here.  Instead doing so in main.js
        
    }
	// 2 - start up app
	main.init(app, collection);
}
