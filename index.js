const TwitchBot = require('twitch-bot');

let teamID = 10;
let sassTime = 'America/Toronto';
let timeZone = sassTime;

/*
This project is made possible thanks to this great API documentation: https://gitlab.com/dword4/nhlapi
All data presented is owned by NHL; this is purely a transport medium for clients using Twitch Chat.

Team IDs (Last updated: 2019-11-18)
* 1:    New Jersey Devils
* 2:    New York Islanders
* 3:    New York Rangers
* 4:    Philadelphia Flyers
* 5:    Pittsburgh Penguins
* 6:    Boston Bruins
* 7:    Buffalo Sabres
* 8:    Montréal Canadiens
* 9:    Ottawa Senators
* 10:   Toronto Maple Leafs
* 12:   Carolina Hurricanes
* 13:   Florida Panthers
* 14:   Tampa Bay Lightning
* 15:   Washington Capitals
* 16:   Chicago Blackhawks
* 17:   Detroit Red Wings
* 18:   Nashville Predators
* 19:   St. Louis Blues
* 20:   Calgary Flames
* 21:   Colorado Avalanche
* 22:   Edmonton Oilers
* 23:   Vancouver Canucks
* 24:   Anaheim Ducks
* 25:   Dallas Stars
* 26:   Los Angeles Kings
* 28:   San Jose Sharks
* 29:   Columbus Blue Jackets
* 30:   Minnesota Wild
* 52    Winnipeg Jets
* 53:   Arizona Coyotes
* 54:   Vegas Golden Knights
 */


async function leafs(team) {
    let msg = "";
    const fetch = require('node-fetch');
    let url = 'https://statsapi.web.nhl.com/api/v1/schedule?teamId='+ team + '&expand=schedule.linescore';
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
                let currentPeriodOrdinal = games['linescore']['currentPeriodOrdinal'];
                let currentPeriodTimeRemaining = games['linescore']['currentPeriodTimeRemaining'];
                // Check to see if the game is live or nah
                if (status['abstractGameState'] === "Live" || status['abstractGameState'] === "Final") {
                    if (currentPeriodTimeRemaining === 'END') {
                        currentPeriodTimeRemaining = '0.0s'
                    }
                    if (status['abstractGameState'] === "Final") {

                    }
                    // check to see if the game is tied.
                    if (home['score'] === away['score']) {
                        msg = ("The game is currently tied at " + home['score'] + " - " + away['score'] + " with " + currentPeriodTimeRemaining + " left in the " + currentPeriodOrdinal);
                    }
                    // check to see if the game is being won by home
                    if (home['score'] > away['score']) {
                        msg = ("The " + home['team']['name'] + " are currently winning " + home['score'] + " - " + away['score'] + " against the " + away['team']['name'] + " with " + currentPeriodTimeRemaining + " left in the " + currentPeriodOrdinal);
                    }
                    // check to see if game is being won by away.
                    if (home['score'] < away['score']) {
                        msg = ("The " + away['team']['name'] + " are currently winning " + away['score'] + " - " + home['score'] + " against the " + home['team']['name'] + " with " + currentPeriodTimeRemaining + " left in the " + currentPeriodOrdinal);
                    }
                }
                if (status['abstractGameState'] === "Preview") {
                    msg = (home['team']['name'] + " play the " + away['team']['name'] + " tonight at " + new Date(Date.parse(dateTime)).toLocaleTimeString('en-US', {timeZone: timeZone}) + " Sasstime (" + timeZone + ") sasslyCheers.");
                }
                Bot.say(msg)
            } else {
                schedule(team)
            }
        });
}

async function schedule(team) {
    let msg = "";
    const fetch = require('node-fetch');
    let url = 'https://statsapi.web.nhl.com/api/v1/teams/' + team + '?expand=team.schedule.next';
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
            let games = json['teams'][0]['nextGameSchedule']['dates'][0]['games'][0];
            let awayTeam = games['teams']['away']['team']['name'];
            let homeTeam = games['teams']['home']['team']['name'];
            let dateTime = games['gameDate'];
            msg = ("There are no games scheduled for today. The "+ homeTeam + " will play the " + awayTeam + " on " + new Date(Date.parse(dateTime)).toLocaleString('en-US', {timeZone: timeZone}) + " Sasstime (" + timeZone + ') sasslyCheers');
            Bot.say(msg)
        });
}


let _oldHomeScore = 0;
let _oldAwayScore = 0;

/*
Set interval to run leafsScore(): 10 seconds (min poll time for API)
ToDo: make it so when game is inactive, polling rates are lower maybe.
 */

setInterval(async function leafsScore() {
    msg = "";
    const fetch = require('node-fetch');
    let url = 'https://statsapi.web.nhl.com/api/v1/schedule?teamId=' + teamID + '&expand=schedule.scoringplays&expand=schedule.linescore';
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
                let homeTeam = home['team']['name'];
                let awayTeam = away['team']['name'];
                let winningTeam = "";
                let homeScore = home['score'];
                let awayScore = away['score'];
                let winningScore = 0;
                let losingScore = 0;
                let currentPeriodOrdinal = games['linescore']['currentPeriodOrdinal'];
                let currentPeriodTimeRemaining = games['linescore']['currentPeriodTimeRemaining'];
                let msg = "";
                /*
                * Detect if game is live, check if either score is greater than score that is stored outide the function.
                * If score is greater than outside function, check if team that scored is Leafs
                * If leafs, respond with ("GOALLLLLLLLL!" + home['team']['name'] + "scored! the score is now" -> check who is winning game -> return score as winning or not winning. )
                * If not Leafs, respond with (home['team']['name'] + "scored :( The score is now -> check to see who is winning game, then return as winning or not winning."
                * wow! what a surprise, {} scored.! The score is now "" with "" in the "" period.
                * */
                if (status['abstractGameState'] === "Live") {
                    /*
                     * Check to see who is winning
                     */
                    if (currentPeriodTimeRemaining === 'END') {
                        currentPeriodTimeRemaining = '0.0s'
                    }
                    if (homeScore > awayScore) {
                        winningTeam = homeTeam;
                        winningScore = homeScore;
                        losingScore = awayScore;
                    }
                    if (awayScore > homeScore) {
                        winningTeam = awayTeam;
                        winningScore = awayScore;
                        losingScore = homeScore;
                    }
                    if (homeScore === awayScore) {
                        winningTeam = (homeTeam + " vs " + awayTeam)
                    }
                    /*
                    * Check to see if anyone scored.
                    * Then check if it was the leafs that scored
                    * Then return a message
                    * Send a message in chat with score containing "" + team name that scored + "scored" + team['score'] + " - " + team['score'] + " " + winningTeam
                    * Do it all again.
                     */
                    if (homeScore > _oldHomeScore && homeScore !== awayScore) {
                        let len = games['scoringPlays'].length-1;
                        let lastScorer = games['scoringPlays'][len]['result']['description'];
                        /* Check if homeTeam is "Toronto Maple Leafs */
                        if (homeTeam === "Toronto Maple Leafs") {
                            /* Return goal message for TML */
                            msg = ("GOAL!!!" + lastScorer + " of " + homeTeam + "scored!" + " It is now " + winningScore + " - " + losingScore + " " + winningTeam + ". There is " + currentPeriodTimeRemaining + " remaining in the " + currentPeriodOrdinal)
                        } else {
                            /* returns goal message for not TML */
                            msg = (homeTeam + " scored sasslyFeels. " + lastScorer + " are to blame for this travesty. It is now " + winningScore + " - " + losingScore + " " + winningTeam + ". There is " + currentPeriodTimeRemaining + " remaining in the " + currentPeriodOrdinal)
                        }
                        Bot.say(msg)
                    }
                    if (awayScore > _oldAwayScore && homeScore !== awayScore) {
                        let len = games['scoringPlays'].length-1;
                        let lastScorer = games['scoringPlays'][len]['result']['description'];
                        /* Check if away score is larger than previous away score, then ensure home score is not equal to away score */
                        if (awayTeam === "Toronto Maple Leafs") {
                            /* Check if leafs, return message */
                            msg = ("GOAL!!! " + lastScorer + " of " + awayTeam + "scored!" + " It is now " + winningScore + " - " + losingScore + " " + winningTeam + ". There is " + currentPeriodTimeRemaining + " remaining in the " + currentPeriodOrdinal)
                        } else {
                            /* Return away team scored */
                            msg = (awayTeam + " scored sasslyFeels. " + lastScorer + " are to blame for this travesty. It is now " + winningScore + " - " + losingScore + " " + winningTeam + ". There is " + currentPeriodTimeRemaining + " remaining in the " + currentPeriodOrdinal)
                        }
                        Bot.say(msg)
                    }
                    if ((homeScore > _oldHomeScore || awayScore > _oldAwayScore) && homeScore === awayScore) {
                        let len = games['scoringPlays'].length-1;
                        let lastScorer = games['scoringPlays'][len]['result']['description'];
                        /* check if home score or away score is greater than previous, ensure homeScore = awayScore */
                        msg = ("It's all tied up here in the " + currentPeriodOrdinal + ". You can thank " + lastScorer + " The score is now " + homeScore + " - " + awayScore + " " + homeTeam + " vs " + awayTeam + ". There is " + currentPeriodTimeRemaining + " remaining in the period");
                        Bot.say(msg)
                    }                    /*
                    * Check to see if home score and _oldHomeScore are the same
                    * If they are not the same, correct _oldHomeScore and _oldAwayScore.
                     */
                    if (_oldHomeScore !== home['score']) {
                        _oldHomeScore = home['score'];
                    }
                    if (_oldAwayScore !== away['score']) {
                        _oldAwayScore = away['score']
                    }
                }
            }
        });
}, 12000);

const Bot = new TwitchBot({
    username: '', // Username of Bot (create new twitch account or use existing)
    oauth: 'oauth:2y14gx5mlzivl3pr86k7qs9n8k5dje', // Get oauth from here: https://twitchapps.com/tmi/
    channels: ['target_channel'] // change 'target_channel' to the channel name you want TB to occupy.
});

Bot.on('join', channel => {
    console.log(`Joined channel: ${channel}`);
    Bot.say("/color Blue");
});

Bot.on('error', err => {
    console.log(err);
});

Bot.on('message', chatter => {
    if(chatter.message === '!score' || chatter.message === '!leafs' || chatter.message === '!LEAFS') {
        leafs(teamID);
    }
});
