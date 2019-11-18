let msg = "";

async function leafs() {
    const fetch = require('node-fetch');
    let url = 'https://statsapi.web.nhl.com/api/v1/schedule?teamId=10';
    let settings = {method: "Get"};
    fetch(url, settings)
        .then(res => res.json())
        .then((json) => {
            /*
            * Create a few variables from the json data: Games, which dumps the first games[0] into a variable to be used.
            * Status: located inside of games, it reads the json returns abstractGameState, codedGameState, detailedState, statusCode, startTimeTBD
            * Home: Uses teams to return leagueRecord, Score, Team {id, name, link}
            * Away:Uses teams to return leagueRecord, Score, Team {id, name, link}
            * */
            if (json['totalGames'] > 0) {
                let games = json['dates'][0]['games'][0];
                let status = games['status'];
                let home = games['teams']['home'];
                let away = games['teams']['away'];
                let dateTime = games['gameDate'];
                if (status['abstractGameState'] === "Live") {
                    if (home['score'] !== _oldHomeScore) {
                        console.log("Home score has changed!");
                        console.log("the score is now" + home['score']);
                    }
                    if (away['score'] !== _oldAwayScore) {
                        console.log("Away score has changed!");
                        console.log("the score is now" + away['score']);
                    }
                    if (home['score'] === away['score']) {
                        console.log("The game is currently tied at " + home['score'] + " - " + away['score']);
                    }
                    if (home['score'] > away['score']) {
                        console.log("The " + home['team']['name'] + " are currently winning " + home['score'] + " - " + away['score'] + " against the " + away['team']['name']);
                        _oldhomeScore = home['score'];
                        _oldawayScore = away['score'];
                    }
                    if (home['score'] < away['score']) {
                        console.log("The " + away['team']['name'] + " are currently winning " + away['score'] + " - " + home['score'] + " against the " + home['team']['name']);
                        _oldhomeScore = home['score'];
                        _oldawayScore = away['score'];
                    }
                }
                if (status['abstractGameState'] === "Preview") {
                    console.log(home['team']['name'] + " play the " + away['team']['name'] + " tonight at " + new Date(Date.parse(dateTime)).toTimeString());
                }
            } else {
                console.log("There are no games scheduled for today.")
            }
            msg = ""
        });
}

leafs();

let _oldHomeScore = 0;
let _oldAwayScore = 0;

setInterval(async function leafs() {
    msg = "";
    const fetch = require('node-fetch');
    let url = 'https://statsapi.web.nhl.com/api/v1/schedule?teamId=10';
    let settings = {method: "Get"};
    fetch(url, settings)
        .then(res => res.json())
        .then((json) => {
            /*
            * Create a few variables from the json data: Games, which dumps the first games[0] into a variable to be used.
            * Status: located inside of games, it reads the json returns abstractGameState, codedGameState, detailedState, statusCode, startTimeTBD
            * Home: Uses teams to return leagueRecord, Score, Team {id, name, link}
            * Away:Uses teams to return leagueRecord, Score, Team {id, name, link}
            * */
            if (json['totalGames'] > 0) {
                let games = json['dates'][0]['games'][0];
                let status = games['status'];
                let home = games['teams']['home'];
                let away = games['teams']['away'];
                let dateTime = games['gameDate'];
                if (status['abstractGameState'] === "Live") {
                    if (home['score'] >= _oldHomeScore) {
                        _oldHomeScore = home['score'];
                        msg = ("GOALLLLLL! " + home['team']['name'] + " scored! The score is now " + home['score'] + " - " + away['score']);
                    }
                    if (away['score'] >= _oldAwayScore) {
                        _oldAwayScore = away['score'];
                        msg = ("GOALLLLLL! " + away['team']['name'] + " scored! The score is now " + home['score'] + " - " + away['score']);
                    }
                }
                if (status['abstractGameState'] === "Preview") {
                    console.log("There is no ongoing game, but there is one later at" + new Date(Date.parse(dateTime)).toTimeString() + ":)")
                }
            } else {
                console.log("There is no ongoing game.");
                console.log(_oldAwayScore, _oldHomeScore);
                _oldAwayScore = 0;
                _oldHomeScore = 0;
            }
        });
}, 6000);