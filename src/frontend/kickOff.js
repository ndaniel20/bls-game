var clubSelectionPage = 0;
var leagueSelectionPage = 0;
var selectedClubName;
var lockedKickOff = false
//
var kickOffGroup = new Konva.Group();
var kickOffVariable = new Konva.Group();
var kickOffStatic = new Konva.Group();
kickOffGroup.add(kickOffStatic)
kickOffGroup.add(kickOffVariable)
gameMenuLayer.add(kickOffGroup)


function kickOffSelection(){
    isKickOffOpen = true;
    squadTab[BLSPage] = "kick off"
    checkLayer()
    drawTabs();
    drawStaticPart();
    drawKickOff(0, 0);
}

function drawKickOff(num, num2){
    kickOffVariable.destroyChildren()

    var leagues = ["Spain", "England", "Germany", "Italy", "France", "Others"]
    leagueSelectionPage += num2
    if (leagueSelectionPage >= leagues.length) leagueSelectionPage = 0
    if (leagueSelectionPage < 0) leagueSelectionPage = leagues.length - 1
    var league = leagues[leagueSelectionPage]
    var flag = countries.find(e=>e.name == league)?.logo
    if (!flag) drawRectangle(472.5, 649.5, 0, "gray", "", 50, 35, kickOffVariable)
    else addImageToCanvas(flag, 472.5, 649.5, 50, 35, kickOffVariable)

    var list = clubsList.filter(e=>e.nation == league)
    if (num == null) clubSelectionPage = 0, num = 0
    clubSelectionPage += num
    if (clubSelectionPage >= list.length) clubSelectionPage = 0
    if (clubSelectionPage < 0) clubSelectionPage = list.length - 1
    var club = list[clubSelectionPage]

    if (!club) return console.log("NO club found");
    selectedClubName = club.name
    var formation = club.formation
    var playerList = buildTeam(club.name, formation)
    var formations = allFormations[formation]
    var img = addImageToCanvas(club.logo, 395, 75, 50, 50, kickOffVariable)
    var yZone = 88
    drawText(club.name, 470, yZone - 7, "beige", "Verdana", 21, "left", "middle", "black", 1, kickOffVariable)
    var ratings = playerList.map(e=>parseInt(findPlayer(e).rating)).reduce((a, b) => a + b)/10
    var playerRating = convertRating(ratings);
    var fullStar = Math.ceil(playerRating);
    var starSize = 20;
    var xWidth = 479.5
    for (var j = 0; j < 5; j++) {
        var starX = xWidth + (j * 30);
        var starY = yZone + 30;

        if (playerRating % 1 === 0.5 && j === fullStar - 1) {
            drawStar(starX - 2.5, starY - 0.5, starSize + 2, "black", false, kickOffVariable);
            drawStar(starX, starY, starSize, "yellow", true, kickOffVariable);
        } else if (fullStar > j) {
            drawStar(starX - 2.5, starY - 0.5, starSize + 2, "black", false, kickOffVariable);
            drawStar(starX, starY, starSize, "yellow", false, kickOffVariable);
        } else {
            drawStar(starX, starY - 2, starSize + 2, "black", false, kickOffVariable);
        }
    }
    for (var i = 0; i < playerList.length; i++){
        var playerId = playerList[i]
        var x = (formations[i][0] * 1.3) + 143
        var y = (formations[i][1]/1.35) + 36
        if (formations[i][2] == "LM" && (formation == "4231" || formation == "4141")) x += 23
        if (formations[i][2] == "RM" && (formation == "4231" || formation == "4141")) x -= 20
        if (formations[i][2] == "LW") x = 270, y += 20
        if (formations[i][2] == "RW") x = 641, y += 20
        if (formations[i][2] == "ST") y += 44
        var adds = (y/22)
        var plyr = addImageToCanvas(`https://img.fminside.net/facesfm24/${playerId}.png`, x + (i == 10 ? 0 : (21/adds) * 2.5), y, 54 + adds, 65.5 + adds, kickOffVariable)
        addHover(plyr, `select_player_${playerId}`)
    }

}


function drawStaticPart(){
    drawRectangle(100, 70, 1, "#071b1f", "black", 789, 630, kickOffStatic, 15)
    drawRectangle(100, 135, 1, "#062f39", "black", 789, 500, kickOffStatic)
    var soccerField = new Konva.Group();
    drawTrapezoid(79, 0, 240, 200, "#086c45", "gray", 2, soccerField)
    drawTrapezoid(161, 175, 75, 25, "", "rgba(206, 222, 210, 0.25)", 2, soccerField, 6)
    drawTrapezoid(123, 150, 150, 50, "", "rgba(206, 222, 210, 0.25)", 2, soccerField, 4)
    drawSemiCircle(198, 150, 25, 15, "", "rgba(206, 222, 210, 0.25)", 2, soccerField, 180)
    drawSemiCircle(198, 0, 35, 25, "", "rgba(206, 222, 210, 0.25)", 2, soccerField, 0)
    soccerField.scale({x: 1.6, y: 1.8})
    soccerField.x(176)
    soccerField.y(185)
    kickOffStatic.add(soccerField)

    var tStart = new Konva.Group
    var t1 = drawRectangle(404.5, 570, 2, "purple", "black", 180, 50, tStart)
    var t2 = drawText("Start", 494.5, 578, "#bf95cf", "Marker Felt", 40, "center", "middle", "black", 1.5, tStart)
    addHover(tStart,`start_kickoff_match`)
    kickOffStatic.add(tStart)
    addHover(drawText("<", 250, 88, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, kickOffStatic), "previous_club");
    addHover(drawText(">", 745, 88, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, kickOffStatic), "next_club");
    addHover(drawText("<", 350, 655, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, kickOffStatic), "previous_league");
    addHover(drawText(">", 645, 655, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, kickOffStatic), "next_league");

    blurRectangle(854, 70, 35, 630, "rgba(0, 0, 0, 0.0)", "black", 0, "rgba(0, 0, 0, 0.55)", false, kickOffStatic, 15)
    blurRectangle(100, 70, 35, 630, "rgba(0, 0, 0, 0.55)", "black", 0, "rgba(0, 0, 0, 0.0)", true, kickOffStatic, 15)
}