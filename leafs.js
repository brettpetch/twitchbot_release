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
                let dateTime = games['gameDate']
                if (status['abstractGameState'] === "Live") {
                    if (home['score'] === away['score']) {
                        msg = ("The game is currently tied at " + home['score'] + " - " + away['score']);
                    }
                    if (home['score'] > away['score']) {
                        msg = ("The " + home['team']['name'] + " are currently winning " + home['score'] + " - " + away['score'] + " against the " + away['team']['name']);
                    }
                    if (home['score'] < away['score']) {
                        msg = ("The " + away['team']['name'] + " are currently winning " + away['score'] + " - " + home['score'] + " against the " + home['team']['name']);
                    }
                }
                if (status['abstractGameState'] === "Preview") {
                    msg = (home['team']['name'] + " play the " + away['team']['name'] + " tonight at " + new Date(Date.parse(dateTime)).toTimeString());
                }
            } else {
                msg = ("There are no games scheduled for today.")
            }
            console.log(msg)
        });
}, 3000);
