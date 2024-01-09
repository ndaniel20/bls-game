var categories = ["TOP SCORER", "TOP ASSISTS", "CLEAN SHEETS", "TOTW"]
const findMostOccurringElement = arr => Object.entries(arr.reduce((count, element) => (count[element] = (count[element] || 0) + 1, count), {})).reduce((a, [b, c]) => (c > a[1] ? [b, c] : a), [null, 0])[0];
var cachedMatches = []
const replacements = {
    "Manchester United": "Man United",
    "Manchester City": "Man City",
    "Newcastle United": "Newcastle",
    "Tottenham Hotspur": "Tottenham",
    "West Ham United": "West Ham",
    "Nottingham Forest": "Nottingham",
    "Wolverhampton": "Wolves",
    "Borussia Dortmund": "Dortmund",
    "Bayer Leverkusen": "Leverkusen",
    "TSG Hoffenheim": "Hoffenheim",
    "Eintracht Frankfurt": "Frankfurt",
    "Paris Saint-Germain": "PSG"
};
const regex = new RegExp(Object.keys(replacements).join("|"), "g");
var bestPlayerAwards = {}
var playerStatsPage = 0
//
var standingGroup = new Konva.Group();
var fullTableGroup = new Konva.Group();
var statsGroup = new Konva.Group();
var fixturesGroup = new Konva.Group();
var seasonsStatic = new Konva.Group();
var seasonsShadows = new Konva.Group();
var seasonsGroup = new Konva.Group();
var extraInput = new Konva.Group();
var seasonAwardGroup = new Konva.Group();
var nextMatchGroup = new Konva.Group();
var lockedSeasonsPlay = false
seasonsGroup.add(seasonsStatic)
seasonsGroup.add(nextMatchGroup)
seasonsGroup.add(fixturesGroup)
seasonsGroup.add(standingGroup)
seasonsGroup.add(statsGroup)
seasonsGroup.add(fullTableGroup)
seasonsGroup.add(seasonsShadows)
seasonsGroup.add(extraInput)
seasonsGroup.add(seasonAwardGroup)
gameMenuLayer.add(seasonsGroup)
fullTableGroup.visible(false)


function seasonsSelection(){
    isSeasonsOpen = true;
    squadTab[BLSPage] = "seasons"
    var leagueName = seasonsData.league
    checkLayer()
    drawTabs();
    drawSeasonsStatic();
    if (leagueName == "Champions League") drawTournamentMatchday();
    else drawSeasonMatchday(leagueName);
}

function drawTournamentMatchday(cup){
    fixturesGroup.visible(true)
    fixturesGroup.destroyChildren()
    extraInput.destroyChildren()
    var fixtures = seasonsData.fixtures
    var matchday = seasonsData.matchday

    var chunks = splitArrayIntoChunks(fixtures[0], 2)
    var filteredTeams = findArrayWithAsterisk(chunks)
    var groupNum = cup >= 0 ? cup : filteredTeams[1]
    if (cup >= 0) var filteredTeam = chunks[cup].flat(1)
    else var filteredTeam = filteredTeams[0]
    var table = organizeTable(fixtures.slice(0, 6), filteredTeam)
    drawRectangle(0, 40, 4, "rgba(7, 28, 39, 0.7)", "black", 385, 281.5, fixturesGroup)
    var banner = new Konva.Group()
    drawRectangle(0, 0, 4, "#4681a0", "black", 385, 40, banner) //standings
    addImageToCanvas(`championsleague.png`, 11.5, 5.3, 40, 30, banner);
    drawText("GROUP " + String.fromCharCode(97 + groupNum).toUpperCase(), 55, 11.3, "rgba(0, 0, 0, 0.4)", "Chalkduster", 20, "left", "middle", "", 0, banner)
    drawRectangle(257, 8, 0, "rgba(0,0,0,0.5)", "", 40, 26, banner, 4)
    drawText("PLD", 277, 13.7, "beige", "Trebuchet MS", 16, "center", "middle", "", 0, banner)
    drawRectangle(300, 8, 0, "rgba(0,0,0,0.5)", "", 40, 26, banner, 4)
    drawText("DIF", 320, 13.7, "beige", "Trebuchet MS", 16, "center", "middle", "", 0, banner)
    drawRectangle(343, 8, 0, "rgba(0,0,0,0.5)", "", 40, 26, banner, 4)
    drawText("PTS", 363, 13.7, "beige", "Trebuchet MS", 16, "center", "middle", "", 0, banner)
    fixturesGroup.add(banner)
    var gapY = 56 - (Object.keys(table).length * 1.5), n = 0
    var yourPosition = 1
    for (t in table){
        var team = table[t]
        var y = 50 + (gapY * n)
        var url = clubsList.find(e=>e.name == t)?.logo
        if (t.includes("*")) url = clubLogo, yourPosition = n + 1
        drawRectangle(10, y - 5.5, 0, n < 2 ? "#179878" : "#0c4157", "", 40, 22, fixturesGroup, 4)
        drawText((n + 1).toString(), 30, y - 1.2, n < 2 ? "#0c4157" : "#4abec6", "Trebuchet MS", 16, "center", "middle", "", 0, fixturesGroup)
        addImageToCanvas(url, 60, y - 5, 20, 20, fixturesGroup)
        drawText(t.includes("*") ? t.slice(0, -1) : t, 85, (y - 6.5) + 14, t.includes("*") ? "rgba(245, 245, 220, 1)" : "rgba(245, 245, 220, 0.65)", "Helvetica", 16, "left", "center", "", 0, fixturesGroup)
        drawRectangle(343, y - 5.5, 0, "#0c4157", "", 40, 22, fixturesGroup, 4)
        drawText(team.points, 363, y - 1.2, "#00efff", "Trebuchet MS", 16, "center", "middle", "", 0, fixturesGroup)
        drawRectangle(300, y - 5.5, 0, "#0c4157", "", 40, 22, fixturesGroup, 4)
        drawText((team.gf - team.ga).toString(), 320, y - 1.2, "#4abec6", "Trebuchet MS", 16, "center", "middle", "", 0, fixturesGroup)
        drawRectangle(257, y - 5.5, 0, "#0c4157", "", 40, 22, fixturesGroup, 4)
        drawText(team.played, 277, y - 1.2, "#4abec6", "Trebuchet MS", 16, "center", "middle", "", 0, fixturesGroup)
        drawLine(30, y + 30, 340, "rgba(255, 255, 255, 0.5)", fixturesGroup)
        n++
    }
    var list = []
    for (let i = 0; i < 8; i++){
        var x = 517 + (i * 45)
        var color = "#3a799a"
        var newGroup = new Konva.Group()
        drawRectangle(x, 400, 0, color, "black", 40, 25, newGroup, 7)
        drawText(String.fromCharCode(97 + i).toUpperCase(), (x + (x + 40))/2, 413.5, "#073d62", "Arial Black", 20, "center", "center", "black", 0.5, newGroup)
        extraInput.add(newGroup)
        addHover(newGroup, "")
        if (groupNum != i) newGroup.opacity(0.5)
        list.push(newGroup)
        newGroup.on('click', function() {
            drawTournamentMatchday(i)
        });
    }
    nextMatch(fixtures, matchday, yourPosition, seasonsData.league)
    if (!fixtures[matchday]) {
        var team = createTOTS(fixtures)
        bestPlayerAwards.team = createTOTW(team, true)
        matchday -= 1
    }
    if (matchday < 0) matchday = 0
    drawFixtures2(fixtures, matchday)
    drawPlayerStats(fixtures, matchday, "#4681a0")
    fixturesGroup.x(502)
    fixturesGroup.y(135)
}

function drawSeasonMatchday(leagueName){
    standingGroup.destroyChildren()
    var fixtures = seasonsData.fixtures
    var matchday = seasonsData.matchday
    var table = organizeTable(fixtures)
    drawRectangle(0, 40, 4, "rgba(7, 28, 39, 0.7)", "black", 400, 563, standingGroup)
    var banner = new Konva.Group()
    drawRectangle(0, 0, 4, "#660000", "black", 400, 40, banner) //standings
    addImageToCanvas(`${leagueName.split(" ").join("").toLowerCase()}.png`, 11.5, 5.3, 40, 30, banner);
    drawText(leagueName, 55, 11.3, "rgba(224, 218, 218, 0.4)", "Chalkduster", 20, "left", "middle", "", 0, banner)
    drawRectangle(271, 8, 0, "rgba(0,0,0,0.5)", "", 40, 26, banner, 4)
    drawText("PLD", 291, 13.7, "beige", "Trebuchet MS", 16, "center", "middle", "", 0, banner)
    drawRectangle(314, 8, 0, "rgba(0,0,0,0.5)", "", 40, 26, banner, 4)
    drawText("DIF", 334, 13.7, "beige", "Trebuchet MS", 16, "center", "middle", "", 0, banner)
    drawRectangle(357, 8, 0, "rgba(0,0,0,0.5)", "", 40, 26, banner, 4)
    drawText("PTS", 377, 13.7, "beige", "Trebuchet MS", 16, "center", "middle", "", 0, banner)
    standingGroup.add(banner)
    var gapY = 56 - (Object.keys(table).length * 1.5), n = 0
    var yourPosition = 1
    for (t in table){
        var team = table[t]
        var y = 50 + (gapY * n)
        var url = clubsList.find(e=>e.name == t)?.logo
        if (t.includes("*")) url = clubLogo, yourPosition = n + 1
        drawRectangle(10, y - 7, 0, "#0c4157", "", 40, 22, standingGroup, 4)
        drawText((n + 1).toString(), 30, y - 2.7, "#4abec6", "Trebuchet MS", 16, "center", "middle", "", 0, standingGroup)
        addImageToCanvas(url, 60, y - 5, 20, 20, standingGroup)
        drawText(t.includes("*") ? t.slice(0, -1) : t, 85, (y - 7) + 14, t.includes("*") ? "rgba(245, 245, 220, 1)" : "rgba(245, 245, 220, 0.65)", "Helvetica", 14, "left", "center", "", 0, standingGroup)
        drawRectangle(357, y - 7, 0, "#0c4157", "", 40, 22, standingGroup, 4)
        drawText(team.points, 377, y - 2.7, "#00efff", "Trebuchet MS", 16, "center", "middle", "", 0, standingGroup)
        drawRectangle(314, y - 7, 0, "#0c4157", "", 40, 22, standingGroup, 4)
        drawText((team.gf - team.ga).toString(), 334, y - 2.7, "#4abec6", "Trebuchet MS", 16, "center", "middle", "", 0, standingGroup)
        drawRectangle(271, y - 7, 0, "#0c4157", "", 40, 22, standingGroup, 4)
        drawText(team.played, 291, y - 2.7, "#4abec6", "Trebuchet MS", 16, "center", "middle", "", 0, standingGroup)
        n++
    }
    nextMatch(fixtures, matchday, yourPosition, seasonsData.league)
    drawFullTable(table, fixtures, matchday);
    if (!fixtures[matchday]) {
        var team = createTOTS(fixtures)
        bestPlayerAwards.team = createTOTW(team, true)
        matchday -= 1
    }
    if (matchday < 0) matchday = 0
    drawFixtures(fixtures, matchday)
    drawPlayerStats(fixtures, matchday)
    standingGroup.x(102)
    standingGroup.y(135)

    addHover(banner, ``)
    banner.on('click', function() {
        standingGroup.visible(false)
        fullTableGroup.visible(true)
    });

}


function drawFixtures(fixtures, matchday){
    fixturesGroup.destroyChildren();
    var fixture = fixtures[matchday] || []
    drawRectangle(400, 0, 4, "#660000", "black", 385, 40, fixturesGroup) //fixtures
    drawRectangle(400, 40, 4, "rgba(7, 28, 39, 0.7)", "black", 385, 281.5, fixturesGroup)
    drawText(`MATCHDAY ${matchday + 1}`, 592.5, 11.3, "rgba(224, 218, 218, 0.4)", "Chalkduster", 20, "center", "middle", "", 0, fixturesGroup)
    var gapY = 57.5 - ((fixture.length * 2) * 1.5)
    for (var i = 0; i < fixture.length; i++){
        var home = fixture[i][0]
        var away = fixture[i][1]
        var result = fixture[i][2]
        var url1 = clubsList.find(e=>e.name == home)?.logo
        var url2 = clubsList.find(e=>e.name == away)?.logo
        if (home.includes("*")) url1 = clubLogo
        if (away.includes("*")) url2 = clubLogo

        addImageToCanvas(url1, 535, 47 + (i * gapY), 22, 22, fixturesGroup)
        drawText(home.includes("*") ? home.slice(0, -1) : home.replace(regex, match => replacements[match]), 530, 58 + (i * gapY) + 2, home.includes("*") ? "rgba(245, 245, 220, 1)" : "rgba(245, 245, 220, 0.65)", "Verdana", 15, "right", "center", "black", 0.2, fixturesGroup)
        addImageToCanvas(url2, 630, 47 + (i * gapY), 22, 22, fixturesGroup)
        drawText(away.includes("*") ? away.slice(0, -1) : away.replace(regex, match => replacements[match]), 657, 58 + (i * gapY) + 2, away.includes("*") ? "rgba(245, 245, 220, 1)" : "rgba(245, 245, 220, 0.65)", "Verdana", 15, "left", "center", "black", 0.2, fixturesGroup)
        drawRectangle(565, 47 + (i * gapY), 0, "#0c4157", "", 55, 22, fixturesGroup, 4)
        if (result){
            drawText(`${result.goals[0]} - ${result.goals[1]}`, 592.5, 51 + (i * gapY), "#00efff", "Trebuchet MS", 16, "center", "middle", "black", 0.2, fixturesGroup)
            var rect = drawRectangle(565, 47 + (i * gapY), 0, "", "", 55, 22, fixturesGroup, 4)
            var num = (matchday + 1) * (i + 1)
            cachedMatches[num] = result
            addHover(rect, `openMatch_${num}`)
        }
    }
    var leftArrow = drawText("◄", 440, 7, "#360303", "Impact", 25, "left", "middle", "black", 0.5, fixturesGroup)
    addHover(leftArrow, ``)
    var rightArrow = drawText("►", 745, 7, "#360303", "Impact", 25, "right", "middle", "black", 0.5, fixturesGroup)
    addHover(rightArrow, ``)
    var num = 0
    leftArrow.on('click', function() {
        if (1 == (matchday + num + 1)) return;
        num--
        drawPlayerStats(fixtures, matchday + num)
        drawFixtures(fixtures, matchday + num)
    });
    rightArrow.on('click', function() {
        if ((matchday + num + 1) == fixtures.length) return;
        num++
        drawPlayerStats(fixtures, matchday + num)
        drawFixtures(fixtures, matchday + num)
    });
    fixturesGroup.x(102)
    fixturesGroup.y(135)
}

function drawFixtures2(fixtures, matchday){
    standingGroup.destroyChildren();
    var fixture = fixtures[matchday] || []
    drawRectangle(400, 0, 4, "#4681a0", "black", 400, 40, standingGroup) //fixtures
    drawRectangle(400, 40, 4, "rgba(7, 28, 39, 0.7)", "black", 400, 563, standingGroup)
    var title = "Group Stage", multiplier = 1
    if (matchday < 6) multiplier = 3.4
    else if (matchday < 8) title = "Round of 16"
    else if (matchday < 10) title = "Quarter Final"
    else if (matchday < 12) title = "Semi Final"
    else if (matchday < 14) title = "Final"
    drawText(`${title}`, 592.5, 11.3, "rgba(0, 0, 0, 0.4)", "Chalkduster", 20, "center", "middle", "", 0, standingGroup)
    var gapY = (57.5 - ((fixture.length * 2) * 1.5)) * multiplier
    for (var i = 0; i < fixture.length; i++){
        var home = fixture[i][0]
        var away = fixture[i][1]
        var result = fixture[i][2]
        var url1 = clubsList.find(e=>e.name == home)?.logo
        var url2 = clubsList.find(e=>e.name == away)?.logo
        if (home.includes("*")) url1 = clubLogo
        if (away.includes("*")) url2 = clubLogo

        addImageToCanvas(url1, 535, 47 + (i * gapY), 22, 22, standingGroup)
        drawText(home.includes("*") ? home.slice(0, -1) : home.replace(regex, match => replacements[match]), 530, 58 + (i * gapY) + 2, home.includes("*") ? "rgba(245, 245, 220, 1)" : "rgba(245, 245, 220, 0.65)", "Verdana", 15, "right", "center", "black", 0.2, standingGroup)
        addImageToCanvas(url2, 630, 47 + (i * gapY), 22, 22, standingGroup)
        drawText(away.includes("*") ? away.slice(0, -1) : away.replace(regex, match => replacements[match]), 657, 58 + (i * gapY) + 2, away.includes("*") ? "rgba(245, 245, 220, 1)" : "rgba(245, 245, 220, 0.65)", "Verdana", 15, "left", "center", "black", 0.2, standingGroup)
        drawRectangle(565, 47 + (i * gapY), 0, "#0c4157", "", 55, 22, standingGroup, 4)
        if (result){
            drawText(`${result.scorers[0].length} - ${result.scorers[1].length}`, 592.5, 51 + (i * gapY), "#00efff", "Trebuchet MS", 16, "center", "middle", "black", 0.2, standingGroup)
            var rect = drawRectangle(565, 47 + (i * gapY), 0, "", "", 55, 22, standingGroup, 4)
            var num = (matchday + 1) * (i + 1)
            cachedMatches[num] = result
            addHover(rect, `openMatch_${num}`)
        }
    }
    var leftArrow = drawText("◄", 440, 7, "#360303", "Impact", 25, "left", "middle", "black", 0.5, standingGroup)
    addHover(leftArrow, ``)
    var rightArrow = drawText("►", 745, 7, "#360303", "Impact", 25, "right", "middle", "black", 0.5, standingGroup)
    addHover(rightArrow, ``)
    var num = 0
    leftArrow.on('click', function() {
        if (1 == (matchday + num + 1)) return;
        num--
        drawPlayerStats(fixtures, matchday + num, "#4681a0")
        drawFixtures2(fixtures, matchday + num)
    });
    rightArrow.on('click', function() {
        if ((matchday + num + 1) == fixtures.length) return;
        num++
        drawPlayerStats(fixtures, matchday + num, "#4681a0")
        drawFixtures2(fixtures, matchday + num)
    });
    standingGroup.x(-298)
    standingGroup.y(135)
}


function drawPlayerStats(fixtures, matchday, color){
    statsGroup.destroyChildren();
    drawRectangle(400, 321.5, 4, color ? color : "#660000", "black", 385, 40, statsGroup) //stats
    drawRectangle(400, 361.5, 4, "rgba(7, 28, 39, 0.7)", "black", 385, 281.5, statsGroup)
    var arrow1 = drawText("◄", 440, 328.5, "#360303", "Impact", 25, "left", "middle", "black", 0.5, statsGroup)
    var arrow2 = drawText("►", 745, 328.5, "#360303", "Impact", 25, "right", "middle", "black", 0.5, statsGroup)
    if (fixtures[matchday]?.filter(e=>e[2]).length == 0) matchday = fixtures.filter(e=>e.some(n=>n[2])).length - 1
    if (playerStatsPage == 3) categories[playerStatsPage] = "TOTW " + (matchday + 1)
    if (playerStatsPage == 0) var stats = "scorers"
    if (playerStatsPage == 1) var stats = "assists"
    if (playerStatsPage == 2) var stats = "cleansheets"
    if (playerStatsPage == 3) var stats = "matchRatings"
    drawText(categories[playerStatsPage], 592.5, 332.8, color ? "rgba(0, 0, 0, 0.4)" : "rgba(224, 218, 218, 0.4)", "Chalkduster", 20, "center", "middle", "", 0, statsGroup)
    var top5 = []

    addHover(arrow1, "")
    addHover(arrow2, "")
    arrow1.on('click', function() {
        if (playerStatsPage == 0) playerStatsPage = categories.length;
        playerStatsPage--
        drawPlayerStats(fixtures, matchday, color)
    });
    arrow2.on('click', function() {
        if (playerStatsPage == categories.length - 1) playerStatsPage = -1;
        playerStatsPage++
        drawPlayerStats(fixtures, matchday, color)
    });

    statsGroup.x(102)
    statsGroup.y(135)
    
    if (playerStatsPage == 3){
        const counts = {};
        if (!fixtures[matchday]) return;
        fixtures[matchday].flat(3).filter(e=>e[stats]).forEach(e=>{
            e[stats].forEach((s,n)=>{
                var startingXI = e.startingXI[n]
                var startingXI2 = secondStartingXI([...startingXI], e.subIn[n].map(e=>e[0]), e.subOut[n].map(e=>e[0]))
                var formation = e.formation[n]
                s.forEach(p=>{
                    var id = p[0]
                    if (!p[1]) return;
                    if (!startingXI.includes(id) && !startingXI2.includes(id)) return;
                    var ob = `${e.teams[n].split(" ").join("_")}_${id}`
                    var index = startingXI.indexOf(id) >= 0 ? startingXI.indexOf(id) : startingXI2.indexOf(id)
                    var form = getPositionByFormation(index, formation)
                    counts[ob] = {num: p[1], position: form}
                })
            })
        })
        var entries = Object.entries(counts);
        entries.sort((a, b) => b[1].num - a[1].num);
        var team = getBestTeam(entries)[0]
        var group = createTOTW(team)
        statsGroup.add(group)
    }else{
        const counts = {};
        fixtures.flat(3).filter(e=>e[stats]).forEach(e=>{
            e[stats].forEach((s,n)=>{
                var team = e.teams[n]
                s.forEach(p=>{
                    var ob = `${team.split(" ").join("_")}_${p}`
                    counts[ob] = (counts[ob] || 0) + 1
                })
            })
        })
        const entries = Object.entries(counts);
        entries.sort((a, b) => b[1] - a[1]);
        top5 = entries.slice(0, 5);
    }

    top5.forEach((e, n)=>{
        var playerId = e[0].split("_").pop()
        var club = e[0].split("_").slice(0, -1).join(" ")
        var player = club.includes("*") ? findSquadPlayer(playerId, true) : findPlayer(playerId)
        if (!player) player = findPlayer(playerId)
        var url = player.clubLogoUrl
        if (club.includes("*")) url = clubLogo
        var group = new Konva.Group()
        drawRectangle(402, 361.5 + (n * 40.3), 2, "rgba(52, 105, 127, 0.25)", "black", 383, 40, group, 5)
        addImageToCanvas(url, 410, 368.5 + (n * 40.3), 25, 25, group)
        var image = addImageToCanvas(`https://img.fminside.net/facesfm24/${playerId}.png`, 440, 368.5 + (n * 40.3), 25, 25, group)
        image.crop({x: 20,y: 17,width: 220, height: 205});
        image.cornerRadius(80)
        drawText(findAbbrevationName(player.name), 475, 372.5 + (n * 40.3), "beige", "Helvetica", 18, "left", "middle", "", 0, group)
        drawRectangle(735, 362.5 + (n * 40.3), 0, "#0c4157", "", 50, 38, statsGroup, 10)
        drawText(e[1], 760, 372.5 + (n * 40.3), "#4abec6", "Trebuchet MS", 20, "center", "middle", "", 0, statsGroup)
        statsGroup.add(group)
        if (player.c) addHover(group, `select_player_${player.c}`)
        else addHover(group, `select_player_${playerId}`)
    })

}

function nextMatch(fixtures, matchday, yp, leagueName){
    nextMatchGroup.destroyChildren()
    var fixture = fixtures[matchday]
    
    if (!fixture){
        if (leagueName == "Champions League"){
            var indx = leaguesName.indexOf(leagueName)
            var prize = parseInt(prizes[indx].replace(/,/g, ''))
            var stage = findStage(fixtures)
            var placement = stage[0]
            var isWinner = stage[1]
            var multiplier = 0
            if (placement <= 6) multiplier = 0.05
            else if (placement <= 8) multiplier = 0.15
            else if (placement <= 10) multiplier = 0.25
            else if (placement <= 12 && isWinner) multiplier = 1
            else if (placement <= 12) multiplier = 0.35
            var output = (prize * multiplier)
        }else{
            var index = leaguesName.indexOf(leagueName)
            var prize = parseInt(prizes[index].replace(/,/g, ''))
            var output = (1/yp) * prize
        }
        var leaveSeasonBTN = new Konva.Group();
        var rect = drawRectangle(772, 71, 4, "#274e13", "black", 115, 64, leaveSeasonBTN)
        drawText("END", 787, 90, "gold", "Arial Black", 35, "left", "middle", "black", 0.4, leaveSeasonBTN)
        rect.cornerRadius([0, 15, 0, 0]);
        blurRectangle(854, 72, 35, 65, "rgba(0, 0, 0, 0.0)", "black", 0, "rgba(0, 0, 0, 0.55)", false, leaveSeasonBTN, 15)
        addHover(leaveSeasonBTN, `delete_season`)
        nextMatchGroup.add(leaveSeasonBTN)
        var clickAward = new Konva.Group()        
        var award = drawRectangle(140, 84, 2, "#660000", "#caf132", 140, 40, clickAward)
        drawText("Awards", (award.x() + (award.x() + award.width()))/2, (award.y() + (award.y() + award.height()))/2, "#caf132", "Trebuchet MS", 18, "center", "center", "", "", clickAward)
        var text = drawText(`Season Prize:`, (award.x() + award.width()) + 50, 106.5, "#caf132", "Arial", 28, "left", "center", "black", 0.5, nextMatchGroup)
        var text2 = drawText(`+${addCommas(output.toFixed(0))}`, 15 + (text.x() + text.width()), 106.5, "#caf132", "Arial Black", 28, "left", "center", "black", 0.8, nextMatchGroup)
        var img = addImageToCanvas("coins.png", (text2.x() + text2.width()) + 6, 89, 28, 28, nextMatchGroup)

        clickAward.opacity(0.5)
        nextMatchGroup.add(clickAward)
        addHover(clickAward, "")
        clickAward.on('mouseover', function () {
            clickAward.opacity(1)
        });
        clickAward.on('mouseout', function () {
            clickAward.opacity(0.5)
        });
        clickAward.on('click', function() {
            if (seasonAwardGroup.children.length == 0) drawSeasonAwards();
            else seasonAwardGroup.destroyChildren() 
        })
        return
    };

    var startMatchBTN = new Konva.Group();
    var rect = drawRectangle(772, 71, 4, "#274e13", "black", 115, 64, startMatchBTN)
    drawText("PLAY", 782, 90, "gold", "Arial Black", 35, "left", "middle", "black", 0.4, startMatchBTN)
    rect.cornerRadius([0, 15, 0, 0]);
    blurRectangle(854, 72, 35, 65, "rgba(0, 0, 0, 0.0)", "black", 0, "rgba(0, 0, 0, 0.55)", false, startMatchBTN, 15)
    addHover(startMatchBTN, `start_seasons_match`)
    nextMatchGroup.add(startMatchBTN)

    var game = fixture.filter(e=>e.slice(0, 2).some(m=>m.includes("*")))[0]
    if (!game) return;
    var team = game.slice(0,2).filter(e=>!e.includes("*"))[0]
    var form = []
    for (var i = Math.max(matchday - 5, 0); i < matchday; i++){
        var g = fixtures[i].filter(e=>e.slice(0, 2).some(m=>m.includes(team)) && e[2])[0]
        if (!g) continue
        if (g[2].goals[1] > g[2].goals[0] && g[1] == team || g[2].goals[0] > g[2].goals[1] && g[0] == team) form.push("W")
        else if (g[2].goals[0] == g[2].goals[1]) form.push("D")
        else form.push("L")
    }
    var url = clubsList.find(e=>e.name == team)?.logo
    var text = drawText(`Next Match:`, 140, 106.5, "#caf132", "Arial", 28, "left", "center", "black", 0.5, nextMatchGroup)
    var text2 = drawText(`${team.replace(regex, match => replacements[match])}`, 15 + (text.x() + text.width()), 106.5, "#caf132", "Arial Black", 28, "left", "center", "black", 0.8, nextMatchGroup)
    var img = addImageToCanvas(url, (text2.x() + text2.width()) + 6, 89, 28, 28, nextMatchGroup)
    var lastX = img.x() + img.width() + 15
    form.forEach((e, n)=>{
        if (e == "W") addImageToCanvas("win.png", lastX + (n * 28), 92, 25, 25, nextMatchGroup)
        if (e == "L") addImageToCanvas("loss.png", lastX + (n * 28), 92, 25, 25, nextMatchGroup)
        if (e == "D") addImageToCanvas("draw.png", lastX + (n * 28), 92, 25, 25, nextMatchGroup)
    })
}

function drawSeasonAwards(){
    seasonAwardGroup.destroyChildren();
    var scorers = bestPlayerAwards.scorers
    var assists = bestPlayerAwards.assists
    var cleansheets = bestPlayerAwards.cleansheets
    var BPA = bestPlayerAwards.BPA
    var YPA = bestPlayerAwards.YPA
    var team = bestPlayerAwards.team
    if (!team) return;
    //seasonAwardGroup
    drawRectangle(100, 135, 0, "#660000", "", 789, 630, seasonAwardGroup)
    drawRectangle(101.5, 370, 3, "#3f0101", "#2e0000", 786, 330, seasonAwardGroup)
    //tots
    var rectClone = team.clone();
    rectClone.scale({x: 1.5, y: 1.5})
    rectClone.position({x: 235, y: 420})
    drawText("Team Of The Season", 494.5, 400, "#bf9000", "Marker Felt", 25, "center", "center", "", "", seasonAwardGroup)
    seasonAwardGroup.add(rectClone)
    //
    var list = [[scorers, "Golden Boot"], [assists, "Best Assister"], [BPA, "Best Player"], [YPA, "Golden Boy"], [cleansheets, "Golden Glove"]].filter(e=>e[0])
    for (var i = 0; i < list.length; i++){
        var id = list[i][0].split("_").pop()
        var club = list[i][0].split("_").slice(0, -1).join(" ")
        var player = club.includes("*") ? findSquadPlayer(id, true) : findPlayer(id)
        if (!player) player = findPlayer(id)
        var url = player.clubLogoUrl
        if (club.includes("*")) url = clubLogo
        var playerGroup = new Konva.Group()
        var image = addImageToCanvas(`https://img.fminside.net/facesfm24/${id}.png`, 155 + (i * 155), i % 2 == 0 ? 190 : 240, 80, 80, playerGroup)
        var circle = drawCircle(image.x() + 40, image.y() + 40, 40, "", "#320909", 5, playerGroup)
        addImageToCanvas(`award${i + 1}.png`, image.x() - 16.5, (image.y() + image.height()) - 29, 33, 33, playerGroup)
        addImageToCanvas(url, (image.x() + image.width()) - 15, (image.y() + image.height()) - 30, 33, 33, playerGroup)
        image.crop({x: 20,y: 17,width: 220, height: 205});
        image.cornerRadius(80)
        var fakeText = drawText(list[i][1], (image.x() + (image.x() + image.width()))/2, image.y() - 30, "#bf9000", "Marker Felt", 17, "center", "", "", "")
        var txt = drawCurvedText(list[i][1], 0, 0, "#bf9000", "Marker Felt", 17, playerGroup)
        fakeText.width(fakeText.width() * 1.25)
        txt.y(fakeText.y() + 25);
        txt.x(fakeText.x() + 5);
        txt.data('M0,0 C' + (fakeText.width() / 2) + ',-30 ' + fakeText.width() + ',30 ' + fakeText.width() + ',0')
        drawText(findAbbrevationName(player.name), (image.x() + (image.x() + image.width()))/2, (image.y() + image.height()) + 15, "#d8bdbd", "Arial Black", 15, "center", "", "", "", playerGroup)
        seasonAwardGroup.add(playerGroup)
    }
    blurRectangle(854, 135, 35, 575, "rgba(0, 0, 0, 0.0)", "black", 0, "rgba(0, 0, 0, 0.55)", false, seasonAwardGroup)
    blurRectangle(100, 70, 35, 640, "rgba(0, 0, 0, 0.55)", "black", 0, "rgba(0, 0, 0, 0.0)", true, seasonAwardGroup, 15)

}

function drawSeasonsStatic(){
    drawRectangle(100, 70, 1, "#591c92", "black", 789, 73, seasonsStatic, 15)
    blurRectangle(854, 135, 35, 575, "rgba(0, 0, 0, 0.0)", "black", 0, "rgba(0, 0, 0, 0.55)", false, seasonsShadows)
    blurRectangle(100, 70, 35, 640, "rgba(0, 0, 0, 0.55)", "black", 0, "rgba(0, 0, 0, 0.0)", true, seasonsShadows, 15)
}

function createTOTW(team, isTOTS){
    var TOTWGroup = new Konva.Group()
    drawRectangle(0, 0, 2, "#11512d", "gray", 345, 185, TOTWGroup)
    for (var i = 0; i < 10; i++){
        if (i % 2 == 0) drawRectangle(0 + (i * 34.5), 0, 0, "rgba(132, 168, 112, 0.25)", "", 34.5, 185, TOTWGroup)
    }
    var arr = [[team[0][0], 5, 75], [team[1][0][0], 60, 100], [team[1][0][1], 60, 50], [team[1][1][0], 85, 5], [team[1][2][0], 85, 145], [team[2][0][0], 155, 100], [team[2][0][1], 155, 50], [team[2][1][0], 200, 5], [team[2][1][1], 200, 145], [team[3][0], 280, 100], [team[3][1], 280, 50]]

    for (var i = 0; i < arr.length; i++){
        var player = arr[i][0]
        var x = arr[i][1]
        var y = arr[i][2]
        var id = player[0]
        var rating = player[1]
        var clubURL = player[3]
        var club = player[4]
        var group = new Konva.Group()
        var image = addImageToCanvas(`https://img.fminside.net/facesfm24/${id}.png`, x, y, 35, 35, group)
        //drawText(findFirstName(name), (x + (x + 32))/2 + 2.5, (y + 32) + 5, "gold", "Trebuchet MS", 11, "center", "", "", 0, TOTWGroup)
        var squareColor = ratingToColor(rating)
        if (isTOTS) squareColor = "#7f6000"
        var r = drawRectangle((x + 35) - 10, (y + 35) - 13, 0.2, squareColor, "black", 17, 15, group, 3)
        drawText(rating, (r.x() + (r.x() + r.width()))/2, (r.y() + (r.y() + r.height()))/2, "white", "Impact", 11, "center", "center", "black", 0.5, group)
        image.crop({x: 20,y: 17,width: 220, height: 205});
        image.cornerRadius(80)
        addImageToCanvas(clubURL, (x + 35) - 10, y - 2, 17, 17, group)
        TOTWGroup.add(group)

        var plyr = club.includes("*") ? findSquadPlayer(id, true) : findPlayer(id)
        if (!plyr) plyr = findPlayer(id)
        if (plyr.c) addHover(group, `select_player_${plyr.c}`)
        else addHover(group, `select_player_${plyr.id}`)
    }

    TOTWGroup.x(422)
    TOTWGroup.y(370)
    return TOTWGroup
}

function getBestTeam(bestPlayers){
    var team = [[],[[],[],[]],[[],[]],[]]
    var c = 0, pCount = 0
    var youngestPlayer = null
    while ((pCount < 11 && bestPlayers[c]) || youngestPlayer == null && bestPlayers[c]){
        var id = bestPlayers[c][0].split("_").pop()
        var club = bestPlayers[c][0].split("_").slice(0, -1).join(" ")
        var num = bestPlayers[c][1].num
        var position = bestPlayers[c][1].position
        var player = club.includes("*") ? findSquadPlayer(id, true) : findPlayer(id)
        if (!player) player = findPlayer(id)
        pCount += 1
        if (parseInt(player.age) <= 21 && !youngestPlayer) youngestPlayer = bestPlayers[c][0]
        if (position == "GK" && team[0].length == 0) team[0].push([id, num, position, club.includes("*") ? clubLogo : player.clubLogoUrl, club])
        else if (position == "CB" && team[1][0].length < 2) team[1][0].push([id, num, position, club.includes("*") ? clubLogo : player.clubLogoUrl, club])
        else if (["LB", "LWB"].some(e=>position == e) && team[1][1].length == 0) team[1][1].push([id, num, position, club.includes("*") ? clubLogo : player.clubLogoUrl, club])
        else if (["RB", "RWB"].some(e=>position == e) && team[1][2].length == 0) team[1][2].push([id, num, position, club.includes("*") ? clubLogo : player.clubLogoUrl, club])
        else if (["DM", "CM"].some(e=>position == e) && team[2][0].length < 2) team[2][0].push([id, num, position, club.includes("*") ? clubLogo : player.clubLogoUrl, club])
        else if (["LM", "LW", "RM", "RW", "AM"].some(e=>position== e) && team[2][1].length < 2) team[2][1].push([id, num, position, club.includes("*") ? clubLogo : player.clubLogoUrl, club])
        else if (["ST"].some(e=>position == e) && team[3].length < 2) team[3].push([id, num, position, club.includes("*") ? clubLogo : player.clubLogoUrl, club])
        else pCount -= 1
        c++
    }
    return [team, youngestPlayer]
}

function createTOTS(fixtures){
    var obj = {}

    var n = 0
    for (stats of ["scorers", "assists", "cleansheets"]){
        var top5Obj = {}
        fixtures.flat(3).filter(e=>e[stats]).forEach(e=>{e[stats].forEach((s,n)=>{var team = e.teams[n];s.forEach(p=>{var ob = `${team.split(" ").join("_")}_${p}`;top5Obj[ob] = (top5Obj[ob] || 0) + 1})})})
        var top5Entry = Object.entries(top5Obj);
        top5Entry.sort((a, b) => b[1] - a[1]);
        top5Entry.slice(0, 5).forEach((e, n)=>obj[e[0]] = {count: (10 - (n*2))});
        bestPlayerAwards[stats] = top5Entry[0][0]
        n++
    }

    for (var i = 0; i < fixtures.length; i++){
        const counts = {};
        fixtures[i].flat(3).filter(e=>e.matchRatings).forEach(e=>{
            e.matchRatings.forEach((s,n)=>{
                var startingXI = e.startingXI[n]
                var startingXI2 = secondStartingXI([...startingXI], e.subIn[n].map(e=>e[0]), e.subOut[n].map(e=>e[0]))
                var formation = e.formation[n]
                s.forEach(p=>{
                    var id = p[0]
                    if (!p[1]) return
                    if (!startingXI.includes(id) && !startingXI2.includes(id)) return;
                    var rating = parseFloat(p[1])
                    var ob = `${e.teams[n].split(" ").join("_")}_${id}`
                    var index = startingXI.indexOf(id) >= 0 ? startingXI.indexOf(id) : startingXI2.indexOf(id)
                    var form = getPositionByFormation(index, formation)
                    if (!obj[ob]) obj[ob] = {}
                    obj[ob].rating = ((obj[ob]?.rating || rating) + rating)/2
                    obj[ob].position = (obj[ob]?.position ?? []).concat([form])
                    counts[ob] = {num: rating, position: form}
                })
            })
        })
        var entries = Object.entries(counts);
        entries.sort((a, b) => b[1].num - a[1].num);
        var team = getBestTeam(entries)[0]
        var arr = [team[0][0], team[1][0][0], team[1][0][1], team[1][1][0], team[1][2][0], team[2][0][0], team[2][0][1], team[2][1][0], team[2][1][1], team[3][0], team[3][1]]
        arr.forEach((e, n)=> {
            var id = e[0]
            var name = e[4]
            var str = `${name.split(" ").join("_")}_${id}`
            obj[str].count = (obj[str]?.count || 0) + 1
        })
    }
    var entries = Object.entries(obj);
    entries = entries.filter(e=>e[1].count).sort((a, b) => {
        var count1 = b[1].count + ((b[1].rating - 7.5) * 5)
        var count2 = a[1].count + ((a[1].rating - 7.5) * 5)
        if (count1 == count2) return b[1].rating - a[1].rating
        return count1 - count2
    });
    entries = entries.filter(e=>e[1].rating).map(e=>[e[0], {num: e[1].rating.toFixed(1), position: findMostOccurringElement(e[1].position)}])
    var finalTeam = getBestTeam(entries)
    bestPlayerAwards.YPA = finalTeam[1]
    bestPlayerAwards.BPA = entries[0][0]

    return finalTeam[0]
}

function drawFullTable(table, fixtures, matchday){
    fullTableGroup.destroyChildren()
    drawRectangle(0, 40, 4, "rgba(7, 28, 39, 0.7)", "black", 400, 563, fullTableGroup)
    var banner = new Konva.Group()
    drawRectangle(0, 0, 4, "#660000", "black", 400, 40, banner) //standings
    drawRectangle(99, 8, 0, "rgba(0,0,0,0.5)", "", 40, 26, banner, 4)
    drawText("PLD", 119, 13.7, "beige", "Trebuchet MS", 16, "center", "middle", "", 0, banner)
    drawRectangle(142, 8, 0, "rgba(0,0,0,0.5)", "", 40, 26, banner, 4)
    drawText("W", 162, 13.7, "beige", "Trebuchet MS", 16, "center", "middle", "", 0, banner)
    drawRectangle(185, 8, 0, "rgba(0,0,0,0.5)", "", 40, 26, banner, 4)
    drawText("D", 205, 13.7, "beige", "Trebuchet MS", 16, "center", "middle", "", 0, banner)
    drawRectangle(228, 8, 0, "rgba(0,0,0,0.5)", "", 40, 26, banner, 4)
    drawText("L", 248, 13.7, "beige", "Trebuchet MS", 16, "center", "middle", "", 0, banner)
    drawRectangle(271, 8, 0, "rgba(0,0,0,0.5)", "", 40, 26, banner, 4)
    drawText("GF", 291, 13.7, "beige", "Trebuchet MS", 16, "center", "middle", "", 0, banner)
    drawRectangle(314, 8, 0, "rgba(0,0,0,0.5)", "", 40, 26, banner, 4)
    drawText("GA", 334, 13.7, "beige", "Trebuchet MS", 16, "center", "middle", "", 0, banner)
    drawRectangle(357, 8, 0, "rgba(0,0,0,0.5)", "", 40, 26, banner, 4)
    drawText("PTS", 377, 13.7, "beige", "Trebuchet MS", 16, "center", "middle", "", 0, banner)
    fullTableGroup.add(banner)
    var gapY = 56 - (Object.keys(table).length * 1.5), n = 0
    
    for (t in table){
        var team = table[t]
        var y = 50 + (gapY * n)
        var url = clubsList.find(e=>e.name == t)?.logo
        if (t.includes("*")) url = clubLogo
        var form = []
        for (var i = Math.max(matchday - 5, 0); i < matchday; i++){
            var g = fixtures[i].filter(e=>e.slice(0, 2).some(m=>m.includes(t)) && e[2])[0]
            if (!g) continue
            if (g[2].goals[1] > g[2].goals[0] && g[1] == t || g[2].goals[0] > g[2].goals[1] && g[0] == t) form.push("W")
            else if (g[2].goals[0] == g[2].goals[1]) form.push("D")
            else form.push("L")
        }
        form.forEach((e, n)=>{
            if (e == "W") addImageToCanvas("win.png", 10 + (n * 11), y - 2.7, 16, 16, fullTableGroup)
            if (e == "L") addImageToCanvas("loss.png", 10 + (n * 11), y - 2.7, 16, 16, fullTableGroup)
            if (e == "D") addImageToCanvas("draw.png", 10 + (n * 11), y - 2.7, 16, 16, fullTableGroup)
        })
        addImageToCanvas(url, 75, y - 5, 20, 20, fullTableGroup)
        drawRectangle(357, y - 7, 0, "#0c4157", "", 40, 22, fullTableGroup, 4)
        drawText(team.points, 377, y - 2.7, "#00efff", "Trebuchet MS", 16, "center", "middle", "", 0, fullTableGroup)
        drawRectangle(314, y - 7, 0, "#0c4157", "", 40, 22, fullTableGroup, 4)
        drawText(team.ga, 334, y - 2.7, "#4abec6", "Trebuchet MS", 16, "center", "middle", "", 0, fullTableGroup)
        drawRectangle(271, y - 7, 0, "#0c4157", "", 40, 22, fullTableGroup, 4)
        drawText(team.gf, 291, y - 2.7, "#4abec6", "Trebuchet MS", 16, "center", "middle", "", 0, fullTableGroup)
        drawRectangle(228, y - 7, 0, "#0c4157", "", 40, 22, fullTableGroup, 4)
        drawText(team.loss, 248, y - 2.7, "#4abec6", "Trebuchet MS", 16, "center", "middle", "", 0, fullTableGroup)
        drawRectangle(185, y - 7, 0, "#0c4157", "", 40, 22, fullTableGroup, 4)
        drawText(team.draw, 205, y - 2.7, "#4abec6", "Trebuchet MS", 16, "center", "middle", "", 0, fullTableGroup)
        drawRectangle(142, y - 7, 0, "#0c4157", "", 40, 22, fullTableGroup, 4)
        drawText(team.win, 162, y - 2.7, "#4abec6", "Trebuchet MS", 16, "center", "middle", "", 0, fullTableGroup)
        drawRectangle(99, y - 7, 0, "#0c4157", "", 40, 22, fullTableGroup, 4)
        drawText(team.played, 119, y - 2.7, "#4abec6", "Trebuchet MS", 16, "center", "middle", "", 0, fullTableGroup)
        n++
    }
    fullTableGroup.x(102)
    fullTableGroup.y(135)
    addHover(banner, ``)

    banner.on('click', function() {
        standingGroup.visible(true)
        fullTableGroup.visible(false)
    });
}

function getPositionByFormation(n, formation){
    return allFormations[formation][n][2]
}

function secondStartingXI(XI, subIn, subOut){
    subOut.forEach((e, n)=>{
        var index = XI.indexOf(subIn[n])
        XI[index] = e
    })

    return XI
}

function organizeTable(fixtures, filteredTeams){
    var table = {}
    for (var i = 0; i < fixtures.length; i++){
        var matchdayGames = fixtures[i]
        for (var g = 0; g < matchdayGames.length; g++){
            var game = matchdayGames[g]
            var team1 = game[0]
            var team2 = game[1]
            var stats = game[2]
            if (filteredTeams && !(filteredTeams.includes(team1) || filteredTeams.includes(team2))) continue;
            if (!table[team1]) table[team1] = {played: 0, loss: 0, draw: 0, win: 0, ga: 0, gf: 0, points: 0}
            if (!table[team2]) table[team2] = {played: 0, loss: 0, draw: 0, win: 0, ga: 0, gf: 0, points: 0}
            if (stats){
                var result = stats.goals
                if (result[0] > result[1]){
                    table[team1].points += 3
                    table[team1].win += 1
                    table[team2].loss += 1
                }
                if (result[0] < result[1]){
                    table[team1].loss += 1
                    table[team2].points += 3
                    table[team2].win += 1
                }
                if (result[0] == result[1]){
                    table[team1].draw += 1
                    table[team1].points += 1
                    table[team2].draw += 1
                    table[team2].points += 1
                }
    
                table[team1].gf += result[0]
                table[team1].ga += result[1]
                table[team2].gf += result[1]
                table[team2].ga += result[0]
                table[team1].played += 1 
                table[team2].played += 1 
            }
        }

    }
    const teamEntries = Object.entries(table).sort((a, b) => {
        if (b[1].points == a[1].points) return (b[1].gf - b[1].ga) - (a[1].gf - a[1].ga)
        return b[1].points - a[1].points
    });
    const sortedTeams = Object.fromEntries(teamEntries);

    return sortedTeams
}

function splitArrayIntoChunks(array, chunkSize) {
    return Array.from({ length: Math.ceil(array.length / chunkSize) }, (_, index) =>
      array.slice(index * chunkSize, index * chunkSize + chunkSize)
    );
}

function findArrayWithAsterisk(arr) {
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr[i].length; j++) {
        for (let p = 0; p < 2; p++) {
            if (arr[i][j][p].includes("*")) {
                return [arr[i].flat(1), i];
            }
        }
      }
    }
    return null;
}

function findStage(fixtures){
    var pos = 0
    var isWinner = false
    for (let i = 0; i < fixtures.length; i++){
        var fixture = fixtures[i]
        var isFound = false
        for (let x = 0; x < fixture.length; x++){
            var team1 = fixture[x][0]
            var team2 = fixture[x][1]
            var scores = fixture[x][2].goals
            if (team1.includes("*") || team2.includes("*")) isFound = true
            if (i == fixtures.length - 1){
                if (team1.includes("*") && scores[0] > scores[1]) isWinner = true
                if (team2.includes("*") && scores[1] > scores[0]) isWinner = true
            }
        }
        if (isFound) pos += 1
    }
    return [pos, isWinner]
}