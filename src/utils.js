function getScenarioOne() {
    let map = new Map();
    let responses = new Map();
    // Initialize the map
    // This is MASSIVE. Can easily make a tool for future use that writes all this to a file to read from.
    // Tutorial?
    map.set('Hello', ["Can you help me choose a restaurant?","I\'m planning on visiting some attractions today, can you help me a bit?","I\'m checking out"]);
    responses.set('Hello', "Hello! How can I help you?");
    
    // Endings 1 - 2,
    map.set('Can you help me choose a restaurant?', ["Well, I was thinking about having lunch soon. Can you recommend a place nearby?", "Do you know any nice places with a good view? I'm meeting someone I really want to impress"]);
    responses.set('Can you help me choose a restaurant?', "Do you want to eat now or make a reservation later? ");
    // Response 2
    map.set("Well, I was thinking about having lunch soon. Can you recommend a place nearby?", ["That sounds perfect! I guess it's somewhere near the beach?"]);
    map.set("Do you know any nice places with a good view? I'm meeting someone I really want to impress", ["That sounds perfect! I guess it's somewhere near the beach?"]);
    responses.set("Well, I was thinking about having lunch soon. Can you recommend a place nearby?", "There's an authentic pizza place by the sea");
    responses.set("Do you know any nice places with a good view? I'm meeting someone I really want to impress", "There's an authentic pizza place by the sea");
    // Response 3
    map.set("That sounds perfect! I guess it's somewhere near the beach?", ["Wait a second, I think I've been there with my family when I was a little kid!", "I had plans on visiting the lighthouse anyway, it's a very beautiful photo spot"]);
    responses.set("That sounds perfect! I guess it's somewhere near the beach?", "Yes. It's in the harbor, right next to the old lighthouse");
    // BRANCH Ending 1 
    map.set("Wait a second, I think I've been there with my family when I was a little kid!", ["OMG it is the same place! Wow, I didn't even realize, thank you for the tip!"]);
    responses.set("Wait a second, I think I've been there with my family when I was a little kid!", "The same family has ran it since the 90's");
    // BRANCH END Ending 2
    map.set("I had plans on visiting the lighthouse anyway, it's a very beautiful photo spot", ["ENDThank you for the tip, I'll check it out. Bye!"]);
    responses.set("I had plans on visiting the lighthouse anyway, it's a very beautiful photo spot", "It is a nice place, especially at sunset");
    responses.set("Thank you for the tip, I'll check it out. Bye!", "Ending 2/8: \'Photogenic Pizza Party\'");
    // END Ending 1
    map.set("OMG it is the same place! Wow, I didn't even realize, thank you for the tip!", ["ENDI do indeed! I'm going there right away, bye!"]);
    responses.set("OMG it is the same place! Wow, I didn't even realize, thank you for the tip!", "Glad I could help, it sounds like you have fond memories of that place");
    responses.set("I do indeed! I'm going there right away, bye!", "Ending 1/8: \'Nostalgia Lane\'");


    // Endings 3-6
    map.set('I\'m planning on visiting some attractions today, can you help me a bit?', ["I've heard good things of the museum of Modern art, do you know how long it's open?", "How can I get to the old town? I'm interested in history and would like to see the castle"]);
    responses.set("I'm planning on visiting some attractions today, can you help me a bit?", "There's plenty to see here! What are you interesed in?")
    // BRANCH Endings 3 and 4
    map.set("I've heard good things of the museum of Modern art, do you know how long it's open?", ["Hmm I don't think that's enough... Maybe I'll visit some art galleries instead, they should stay open longer", "So there's still plenty of time! Could you call a cab for me, I'll be ready in ten minutes"]);
    responses.set("I've heard good things of the museum of Modern art, do you know how long it's open?", "Today they close at six");
    //  BRANCH Ending 3
    map.set("Hmm I don't think that's enough... Maybe I'll visit some art galleries instead, they should stay open longer", ["That is pretty close, maybe I'll turn this into a nice evening stroll. Any tips on where to grab something to eat while I'm there?"]);
    responses.set("Hmm I don't think that's enough... Maybe I'll visit some art galleries instead, they should stay open longer", "They do, and the art district is close by. Just turn left by the cathedral")
    //  END Ending 3
    map.set("That is pretty close, maybe I'll turn this into a nice evening stroll. Any tips on where to grab something to eat while I'm there?", ["ENDThat's a big promise! I'll check it out, thanks for the tip. Bye!"]);
    responses.set("That is pretty close, maybe I'll turn this into a nice evening stroll. Any tips on where to grab something to eat while I'm there?", "At the square, right beside the statue. Best Café in the city");
    responses.set("That's a big promise! I'll check it out, thanks for the tip. Bye!", "Ending 3/8: \'Evening Stroll\'");

    //  BRANCH Ending 4
    map.set("So there's still plenty of time! Could you call a cab for me, I'll be ready in ten minutes", ["Thank you! I tried going there yesterday but I just couldn't find it, got lost and ended up visiting the archeological site instead"]);
    responses.set("So there's still plenty of time! Could you call a cab for me, I'll be ready in ten minutes", "The car will be waiting outside");

    map.set("Thank you! I tried going there yesterday but I just couldn't find it, got lost and ended up visiting the archeological site instead", ["ENDHopefully so! Thank you for helping me, bye!"]);
    responses.set("Thank you! I tried going there yesterday but I just couldn't find it, got lost and ended up visiting the archeological site instead", "Oh no! Well the taxi will get you there for sure");
    responses.set("Hopefully so! Thank you for helping me, bye!", "Ending 4/8 \'Finally Getting There\'");

    // BRANCH Endings 5 and 6
    map.set("How can I get to the old town? I'm interested in history and would like to see the castle", ["It's pretty close, I think I'll walk since the weather is so nice. What is the route?", "I'm in a bit of a hurry, it would be great if you'd call a cab for me"]);
    responses.set("How can I get to the old town? I'm interested in history and would like to see the castle", "By walking, bus or taxi?")
    //  BRANCH Ending 5
    map.set("It's pretty close, I think I'll walk since the weather is so nice. What is the route?", ["Sounds easy enough. How long would it take to visit the castle? I'm trying to figure out my schedule"]);
    responses.set("It's pretty close, I think I'll walk since the weather is so nice. What is the route?", "Down the promenade, left at the cathedral and straight until you reach the port");

    //  END Ending 5
    map.set("Sounds easy enough. How long would it take to visit the castle? I'm trying to figure out my schedule", ["ENDGreat, thank you very much!"]);
    responses.set("Sounds easy enough. How long would it take to visit the castle? I'm trying to figure out my schedule", "You can get through it in thirty minutes, guided tours take about an hour");
    responses.set("Great, thank you very much!", "Ending 5/8: \'Average History Enjoyer\'");

    //  END Ending 6
    map.set("I'm in a bit of a hurry, it would be great if you'd call a cab for me", ["ENDNo, this is fine. Thank you!"]);
    responses.set("I'm in a bit of a hurry, it would be great if you'd call a cab for me", "It will be here in a couple of minutes. Is there anything else?");
    responses.set("No, this is fine. Thank you!", "Ending 6/8: \'In a Hurry\'");

    
    // Endings 7 and 8
    map.set('I\'m checking out', ["Sadly, yes. I've had a lovely stay but it seems all good things must come to an end"]);
    responses.set('I\'m checking out', "Ah you're leaving already?");

    map.set("Sadly, yes. I've had a lovely stay but it seems all good things must come to an end", ["I did! I've been here before but it was years ago. Now I'm already planning my next trip, could be next summer"])
    responses.set("Sadly, yes. I've had a lovely stay but it seems all good things must come to an end", "Glad to hear you enjoyed your stay!");

    map.set("I did! I've been here before but it was years ago. Now I'm already planning my next trip, could be next summer", ["It is? I thought I still had to sign something. Then I'll just head to the airport"]);
    responses.set("I did! I've been here before but it was years ago. Now I'm already planning my next trip, could be next summer", "Looks like the check-out is already done, just return the key as you're leaving");

    map.set("It is? I thought I still had to sign something. Then I'll just head to the airport", ["ENDThere's a shuttle bus that leaves every half an hour, I can take it: Thanks for everything!", "ENDThat would be great, thanks for everything"]);
    responses.set("It is? I thought I still had to sign something. Then I'll just head to the airport", "Would you like for me to call a taxi for you?");

    // END Ending 7
    responses.set("There's a shuttle bus that leaves every half an hour, I can take it: Thanks for everything!", "Ending 7/8: \'Traveller\'");

    // END Ending 8
    responses.set("That would be great, thanks for everything", "Ending 8/8: \'Homeward\'");
    return [map, responses];
}

export {getScenarioOne};