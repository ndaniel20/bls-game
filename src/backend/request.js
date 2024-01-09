const request = require("request-promise");
const fs = require('fs');
const cheerio = require('cheerio');
var accents = require('remove-accents');
const {flag, code, name, countries} = require('country-emoji');


async function fetchClub(id){
    var res = await request(`https://fminside.net/clubs/4-fm-24/${id}`, {
    "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "max-age=0",
        "cookie": "PHPSESSID=9isfhqbqrba4qivdj8s0ek2ljf; fingerprint=cddb19fb0c283f0f5b358780b106caf9; CookieControl={\"necessaryCookies\":[],\"optionalCookies\":{},\"statement\":{},\"consentDate\":1671518634080,\"consentExpiry\":90,\"interactedWith\":true,\"user\":\"E8CE0238-5286-463C-9FEF-4AFA267177DF\"}; __cf_bm=yMFVCrEod8JxnShzKf1aT1moxUO3ijrgovjADoGXW2c-1671608101-0-ATvaMwVlZ7L2L75RZfnvW50ivqRgmRs2R55I3yo/zTnGB4C+9lg6WYtIiiZsdysxKpxNwjDXnxyoTuBmm7zBSiegEcPlBwov3p1bxaR6MUhLpzJyZPOAa71ky/cw5IBPiLhJ8l/gG+RYk4j967k2Ztk=; _ga_LKXLC782E6=GS1.1.1671608180.1.0.1671608180.0.0.0; _ga=GA1.2.43836936.1671608180; _gid=GA1.2.815579910.1671608180; _gat_gtag_UA_57891313_1=1"
    },
    "body": null,
    "method": "GET"
    })

    return res
}

async function fetchPlayer(id){
    var res = await request(`https://fminside.net${id}`, {
    "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "max-age=0",
        "cookie": "PHPSESSID=9isfhqbqrba4qivdj8s0ek2ljf; fingerprint=cddb19fb0c283f0f5b358780b106caf9; CookieControl={\"necessaryCookies\":[],\"optionalCookies\":{},\"statement\":{},\"consentDate\":1671518634080,\"consentExpiry\":90,\"interactedWith\":true,\"user\":\"E8CE0238-5286-463C-9FEF-4AFA267177DF\"}; __cf_bm=yMFVCrEod8JxnShzKf1aT1moxUO3ijrgovjADoGXW2c-1671608101-0-ATvaMwVlZ7L2L75RZfnvW50ivqRgmRs2R55I3yo/zTnGB4C+9lg6WYtIiiZsdysxKpxNwjDXnxyoTuBmm7zBSiegEcPlBwov3p1bxaR6MUhLpzJyZPOAa71ky/cw5IBPiLhJ8l/gG+RYk4j967k2Ztk=; _ga_LKXLC782E6=GS1.1.1671608180.1.0.1671608180.0.0.0; _ga=GA1.2.43836936.1671608180; _gid=GA1.2.815579910.1671608180; _gat_gtag_UA_57891313_1=1"
    },
    "body": null,
    "method": "GET"
    })

    return res
}

var listTeams =  JSON.parse(fs.readFileSync('src/data/tactics.json', 'utf-8'))
var list = Object.entries(listTeams).map(e=>`${e[1].id}-${e[0].replace(/\s+/g, '-').toLowerCase()}`).slice(97, 130)
var c = 0
startProcess(list[c])

async function startProcess(str) {
    var title = str.split("/").pop()
    var lineup = await fetchClub(str);
    lineup = lineup.split("<h2>Full Squad</h2>").pop();
    var header = title.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).slice(1).join(' ');
    const $cheerio = cheerio.load(lineup);

    // Create an array of promises for each player
    const playerPromises = $cheerio('ul.player').map(async (index, element) => {
    const href = $cheerio(element).find('.name a').attr('href');
      try {
        var html = await fetchPlayer(href);
        const $ = cheerio.load(html);
        const regex = /url\((\/\/.*?)\)/;
        const playerInfo = {};

        var type = $('#potential').attr('class')
        playerInfo.name = $('#player_info .key:contains("Name") + .value').text();
        playerInfo.normalName = accents.remove(playerInfo.name);
        playerInfo.id = $('#player_info .key:contains("Unique ID") + .value').text();
        playerInfo.rating = $('#ability').text()
        playerInfo.potential = $('#potential').text();
        playerInfo.age = $('#player_info .key:contains("Age") + .value').text();
        playerInfo.foot = $('#player_info .key:contains("Foot") + .value').text();
        playerInfo.club = accents.remove($('#player_info ul li:nth-child(1) .value')[0].children[0].data);
        playerInfo.clubLogoUrl = $('#player_info ul li:nth-child(1) .logo').css('background-image').replace("/small", "/normal").replace(/^url\(['"](.+)['"]\)$/, '$1').replace(regex, 'https:$1');;
        playerInfo.nation = $('#player_info ul li:nth-child(2) .value')[0].children[0].children[0].next?.data
        playerInfo.nationFlag = $('#player_info ul li:nth-child(2) img.flag').attr('src');//flag(playerInfo.nation)
        playerInfo.primaryPositions = [];
        playerInfo.secondaryPositions = [];
        $('#player_info .desktop_positions .position.natural').each((index, element) => {
          playerInfo.primaryPositions.push(translatePosition($(element).attr('position')));
        });
        $('#player_info .desktop_positions .position.decent').each((index, element) => {
          playerInfo.secondaryPositions.push(translatePosition($(element).attr('position')));
        });
        playerInfo.height = $('#player_info .key:contains("Length") + .value').text();
        if (parseInt(playerInfo.potential) > 99) playerInfo.potential = "99"
        if (!playerInfo.potential) playerInfo.potential = Math.min((parseInt(playerInfo.rating) + createPotential(type)), 99).toString();

        const statRows = $('#player_stats .stat');
        playerInfo.stats = {}

        //stats
        var stats = ["aerial reach", "handling", "kicking", "reflexes", "one on ones", "throwing", "communication", "command of area", "corners", "crossing", "dribbling", "finishing", "free kick", "heading", "long shots", "marking", "passing", "penalty", "tackling", "technique", "aggression", "decisions", "flair", "leadership", "positioning", "teamwork", "vision", "work rate", "acceleration", "agility", "balance", "jumping", "pace", "stamina", "strength"]
        statRows.each((index, row) => {
            var statName = row.parent.attribs.id
            statName = statName.replace(/-/g, ' ').replace('free kick taking', 'free kick').replace("penalty taking", "penalty").replace("jumping reach", "jumping")
            const statValue = row.children[0].data

            if (stats.includes(statName)) playerInfo.stats[statName] = statValue;
        });

        if (Number(playerInfo.rating) >= 50) {
          return playerInfo;
        }  

      } catch (error) {
        console.error('Error fetching player:', href);
        return null;
      }
    }).get();

    var playerResults = await Promise.all(playerPromises)
    playerResults = playerResults.filter(e=>e)
    var test = playerResults[0]
    var nationData =  JSON.parse(fs.readFileSync('src/data/nations.json', 'utf-8'))
    var teamData =  JSON.parse(fs.readFileSync('src/data/clubs.json', 'utf-8'))
    //var tacticsData =  JSON.parse(fs.readFileSync('src/data/tactics.json', 'utf-8'))
    /*
    tacticsData[test.club] = {
      league: 'Saudi League',
      id: parseInt(test.clubLogoUrl.match(/\/(\d+)\.png$/)[1]),
      tactics: {formation: '',height: 50,length: 50,width: 50,pressing: 'Balanced Pressure',marking: 'Zonal Marking',timeWasting: false,offsideTrap: false,offensiveStyle: '',transition: '',corners: 8,fullbacks: ''}
    }
    */
    var nations = removeDuplicates(playerResults.map(e=>({name: e.nation, logo: e.nationFlag})).concat(nationData))
    var clubs = removeDuplicates(playerResults.map(e=>({name: e.club, formation: "", stadiumURL: "", logo: e.clubLogoUrl, nation: "Saudi League"})).concat(teamData))

    playerResults = {[playerResults[0].club]: playerResults}

    // Log the players array
    writeArrayToJsonFile2(playerResults, "src/data/downloadedDatabase.json");
    writeArrayToJsonFile(nations, "src/data/nations.json");
    //writeArrayToJsonFile(clubs, "src/data/clubs.json");
    //fs.writeFileSync("src/data/tactics.json", `${JSON.stringify(tacticsData, null, 2)}`);
    console.log("Done uploading files")

    console.log(str + " - " + c + "/" + list.length)
    c++
    if (!list[c]) return process.exit(1)
    startProcess(list[c])
  }


function translatePosition(pos){
    if (pos == "st") return "ST"
    if (pos == "aml") return "LW"
    if (pos == "amr") return "RW"
    if (pos == "amc") return "AM"
    if (pos == "mr") return "RM"
    if (pos == "mr") return "LM"
    if (pos == "ml") return "LM"
    if (pos == "mc") return "CM"
    if (pos == "dm") return "DM"
    if (pos == "wbl") return "LWB"
    if (pos == "wbr") return "RWB"
    if (pos == "dr") return "RB"
    if (pos == "dl") return "LB"
    if (pos == "dc") return "CB"
    if (pos == "gk") return "GK"
}


function writeArrayToJsonFile2(array, filePath) {
  const jsonArray = JSON.stringify(array);

  if (fs.existsSync(filePath)) {
    fs.appendFileSync(filePath, `,\n${jsonArray.slice(1, -1)}`, 'utf8');
  } else {
    fs.writeFileSync(filePath, `${jsonArray.slice(1, -1)}`, 'utf8');
  }
}

function writeArrayToJsonFile(array, filePath) {
  const lines = array.map(element => JSON.stringify(element));
  const json = lines.join(',\n');

  fs.writeFileSync(filePath, `[${json}]`);
}

function createPotential(type){
    if (type == "card poor dynamic") return 3//40-60
    if (type == "card decent dynamic") return 6//50-70
    if (type == "card good dynamic") return 9//60-80
    if (type == "card excellent dynamic") return 12//70-90
    if (type == "card superstar dynamic") return 15 //80-100
}

function removeDuplicates(array) {
  return array.filter((item, index, self) =>
    index === self.findIndex((c) => c.name === item.name)
  );
}