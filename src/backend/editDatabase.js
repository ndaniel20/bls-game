const fs = require('fs');
const request = require("request-promise");
const readlineSync = require('readline-sync');
const clubsData = require('../data/clubs.json');
const playersData = require('../data/database.json');
const chalk = require('chalk');

const API_URL = '3';

function savePlayersDataToFile() {  
  fs.writeFile('src/data/database.json', `{\n${JSON.stringify(playersData).split(`}}],"`).join(`}}],\n"`).slice(1, -1)}\n}`, err => {
    if (err) {
      console.error('Error writing JSON file:', err);
    } else {
    }
  });
}

function findMostOccurringElement(arr) {
  const frequency = arr.reduce((acc, curr) => {
    acc[curr] = (acc[curr] || 0) + 1;
    return acc;
  }, {});

  return Object.keys(frequency).reduce((a, b) => (frequency[a] > frequency[b] ? a : b));
}
  
async function getPlayerDataFromAPI(playerName) {
  try {
    var body = await request(`https://apigw.fotmob.com/searchapi/suggest?term=${playerName}`, {
      "referrerPolicy": "strict-origin-when-cross-origin",
      "method": "GET"
    });
    var parsed = JSON.parse(body)
    var id = parsed.squadMemberSuggest[0].options[0].payload.id
    var body = await request(`https://www.fotmob.com/api/playerData?id=${id}`, {
      "referrerPolicy": "strict-origin-when-cross-origin",
      "method": "GET"
    })
    var parsed = JSON.parse(body)
    return parsed.origin.teamName ? parsed.origin.teamName : "Free Agent"
  } catch (error) {
    return null;
  }
}

async function verifyPlayerInfo() {
    var allClubs = clubsData.filter(c=>c.name != "Saudi All-Star").map(c=>c.name).reverse()
    for (var x = 0; x < allClubs.length; x++){
        if (x < 50) continue;
        var club = allClubs[x]
        var previousNum = 0
        const Players = playersData[club];
        var samplePlayers = Players.slice(0,15)
        var arr = []
        for (var y = 0; y < samplePlayers.length; y++){
            let averageClubName = await getPlayerDataFromAPI(samplePlayers[y].normalName);
            arr.push(averageClubName)
        }
        var clubName = findMostOccurringElement(arr)
        console.log(chalk.green.bold(`\nNow examining player information for ${clubName} (${x})`));
        for (let i = Players.length - 1; i >= 0; i--) {
            const player = Players[i];
            let playerClub = await getPlayerDataFromAPI(player.normalName);
            if (!playerClub) {
                const lastName = player.normalName.split(" ").pop();
                playerClub = await getPlayerDataFromAPI(lastName);
                if (!playerClub) {
                console.log(chalk.red('Error fetching player data from the API for', player.name));
                continue;
                }
            }
        
            if (player.potential <= 70) continue;
            if (playerClub.startsWith(clubName)) continue;
        
            console.log(chalk.blue.bold('\nPlayer:'), chalk.yellow.bold(player.normalName));
            console.log(chalk.blue.bold('API Club:'), chalk.cyan.bold(playerClub));
            var isCorrect = readlineSync.keyInYNStrict(chalk.blue.bold('Do you watch to change the club?'));
            if (isCorrect) {
                var newClub;
                while (true) {
                newClub = readlineSync.question(chalk.yellow.bold('Enter the correct club name: '));
                if (newClub.toLowerCase() === "delete") {
                    var clubList = playersData["Free Agent"];
                    Players.splice(i, 1);
                    player.club = clubList[0].club;
                    player.clubLogoUrl = clubList[0].clubLogoUrl;
                    clubList.push(player);
                    console.log(chalk.red('Player removed from the list.'));
                    break;
                }
                var clubList = playersData[newClub];
                if (!clubList) {
                    console.log(chalk.red('Invalid club name. Please enter a valid club name or "delete".'));
                } else {
                    Players.splice(i, 1);
                    player.club = clubList[0].club;
                    player.clubLogoUrl = clubList[0].clubLogoUrl;
                    clubList.push(player);
                    break;
                }
                }
            }
            previousNum = i
            savePlayersDataToFile();
        }
    }
}

verifyPlayerInfo();
