const request = require("request-promise");
const fs = require('fs');

async function findStadiumPicture(apiKey, country, page){
    var data = await request(`https://www.thesportsdb.com/api/v1/json/${apiKey}/search_all_teams.php?l=French%20Ligue%201`)
    data = JSON.parse(data)
    console.log(data.teams.map(e=>e.strTeam + " - " + e.strStadiumThumb))
    //var clubsJson =  JSON.parse(fs.readFileSync('src/data/tactics.json', 'utf-8'))
    //fs.writeFileSync("src/data/clubs.json", `${JSON.stringify(clubsJson, null)}`);
}


async function findPlayer(term){
  var body = await request(`https://apigw.fotmob.com/searchapi/suggest?term=${term}`, {
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
  console.log(parsed.origin.teamName)
  return parsed.origin.teamName
}

findPlayer('Celta Vigo')
//findStadiumPicture(3, "England")