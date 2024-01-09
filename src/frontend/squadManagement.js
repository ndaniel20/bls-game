var sortFeature = "squad"
var formation;
var pressureTactic;
var markingTactic;
var timeWasting;
var offsideTrap;
var offensiveTactic;
var transitionTactic;
var cornerTactic;
var fullbackTactic;
var widthTactic;
var depthTactic;
var lineTactic;
var startingPlayers;
//
var pointerNum = 0; //keep track of where the list of players should be viewed at
var squadRating = 0; //total rating of the squad
var squadChem = 0;
var view = 0; //type of lineup view (nation, position, rating..)
var searchPage2 = 0;
var formationText = ""
var previousPosition = null;
var selectedPosition = null;
var selectedPlayer = null;
var saveText;
//
var formationLayer = new Konva.Group();
var shapeLayer = new Konva.Group();
var defenceLayer = new Konva.Group();
var attackLayer = new Konva.Group();
var listGroup = new Konva.Group();
var statGroup = new Konva.Group();
var lineupGroup = new Konva.Group();
var formationGroup = new Konva.Group();
var tactic1Group1 = new Konva.Group();
var tactic1Group2 = new Konva.Group();
var tactic2Group1 = new Konva.Group();
var tactic2Group2 = new Konva.Group();
var tactic3Group1 = new Konva.Group();
var tactic3Group2 = new Konva.Group();
//
var squadGroup = new Konva.Group();
var squadGroup2 = new Konva.Group();
//
formationLayer.add(statGroup);
formationLayer.add(listGroup);
formationLayer.add(lineupGroup);
formationLayer.add(formationGroup);
//
shapeLayer.add(tactic1Group2);
shapeLayer.add(tactic1Group1);
defenceLayer.add(tactic2Group2);
defenceLayer.add(tactic2Group1);
attackLayer.add(tactic3Group2);
attackLayer.add(tactic3Group1);
//
squadManagementLayer.add(formationLayer);
squadManagementLayer.add(shapeLayer);
squadManagementLayer.add(defenceLayer);
squadManagementLayer.add(attackLayer);
squadManagementLayer.add(squadGroup2);
//
BLSLayer.add(squadManagementLayer);

async function startSquadManagement(){
    saveText = drawText("", 470, 15, "gray", "Avantgarde", 18, "center", "middle", "black", 0.2, BLSLayer)
    playersSquad.sort((a,b)=> getPositionOrder(b.primaryPositions[0]) - getPositionOrder(a.primaryPositions[0]))
    miniLayer.add(squadGroup)
    formation = squadTactics.formation
    pressureTactic = squadTactics.pressing
    markingTactic = squadTactics.marking
    timeWasting = squadTactics.timeWasting
    offsideTrap = squadTactics.offsideTrap
    offensiveTactic = squadTactics.offensiveStyle
    transitionTactic = squadTactics.transition
    cornerTactic = squadTactics.corners
    fullbackTactic = squadTactics.fullbacks
    widthTactic = squadTactics.width;
    depthTactic = squadTactics.length;
    lineTactic = squadTactics.height;
    startingPlayers = squadTactics.startingXI;
    squadUI();
    showSquad("", 0);
    checkLayer();
    drawList();
    drawStats();
    drawLineup();
    changeFormation();
    checkDrag();
    shapeTactic1();
    shapeTactic2();
    defensiveTactic1(3);
    defensiveTactic2();
    offensiveTactic1(3);
    offensiveTactic2();
}

function drawLineup() {
    lineupGroup.destroyChildren();
    //add 
    addImageToCanvas("pitch.png", 100, 70, 489, 630, lineupGroup, 0.6, 15)
    addHover(addImageToCanvas("formationPreview.png", 510, 605, 50, 70, lineupGroup, 0.5), "change_formation")
    addHover(addImageToCanvas("viewPreview.png", 125, 615, 70, 47, lineupGroup, 0.5), "change_view")

    //add positions and players
    var positions = allFormations[formation]
    for (var i = 0; i < positions.length; i++) {
        var position = positions[i];
      
        var squareColor = "#484848"
        var strokeColor = "black"
        var player = playersSquad.find(p=>p.id == startingPlayers[i]?.id)
        var cut = 1
        if (startingPlayers[i] && player){
            var dist = getAlternates(position[2])
            dist = dist.map(e=>parseInt(player.stats[e])).reduce((a, b) => a + b)
            var cut = player.secondaryPositions.includes(position[2]) ? Math.min(Math.max(dist, 62)/68, 1) : Math.min(dist/68, 1) 
            if (player.primaryPositions.includes(position[2])) squareColor = "#3f652b", strokeColor = "#1b360d", cut = 1
            else if (player.secondaryPositions.includes(position[2])) squareColor = "#bf9000", strokeColor = "#7f6000"
            else squareColor = "#990000", strokeColor = "#660000", cut -= 0.2
        }
        if ((view == 2 || view == 3) && player) {
            if (view == 2) addImageToCanvas(`https://img.fminside.net/facesfm24/${player.id}.png`, position[0] + 72, position[1] + 10, 66, 77.5, lineupGroup);
            if (view == 3){
                addImageToCanvas(player.nationFlag, position[0] + 76, position[1] + 13, 58, 71, lineupGroup) 
                addImageToCanvas(player.clubLogoUrl, position[0] + 86, position[1] + 30, 38, 38, lineupGroup, 0.8);
            }
            var rect = drawRectangle(position[0] + 76, position[1] + 13, 3, "", strokeColor, 58, 71, lineupGroup)
            addHover(rect, `select_player_${player.c}`)
            rect.posID = i
            rect.playerID = player.id
            rect.C = player.c
            if (player.primaryPositions[0] == "GK") rect.isGK = true
            else rect.isGK = false
        }
        else {
            var group = new Konva.Group();
            group.add(drawRectangle(position[0] + 79, position[1] + 50, 3, squareColor, strokeColor, 50, 30, null, 10))
            if (view == 0 && player) group.add(drawText(position[2], 104 + position[0], 56 + position[1], "beige", "monaco", 22, "center", "middle", null, null))
            if (view == 1 && player) group.add(drawText(Math.max(Math.round(player.rating * cut), 12), 104 + position[0], 56 + position[1], "beige", "monaco", 22, "center", "middle", null, null))
            if (player) addHover(group, `select_player_${player.c}`)
            else addHover(group, "");
            lineupGroup.add(group)
            group.getChildren().forEach(e => e.posID = i)
            if (player) group.getChildren().forEach(e => {e.C = player.c;e.playerID = player.id; if (player.primaryPositions[0] == "GK") e.isGK = true;else e.isGK = false})
        }

        if (startingPlayers[i]){
            var foundPlayer = findPlayer(startingPlayers[i].id)
            drawText(findFirstName(foundPlayer.name), 106 + position[0], 91.5 + position[1], "rgba(0, 0, 0, 0.7)", "Impact", 18, "center", "middle", "black", 0, lineupGroup)
            drawText(findFirstName(foundPlayer.name), 104.5 + position[0], 90 + position[1], "yellow", "Impact", 18, "center", "middle", "black", 1.2, lineupGroup)
        }
    }

    blurRectangle(100, 70, 35, 630, "rgba(0, 0, 0, 0.55)", "black", 0, "rgba(0, 0, 0, 0.0)", true, lineupGroup, 15)
}

function drawList(){
    listGroup.destroyChildren();
    //add container 
    drawRectangle(578, 220, 0, "black", "black", 311, 630, listGroup)

    //add squad/rating header
    drawRectangle(599, 249, 2, "purple", "#674ea7", 282, 30, listGroup)
    addHover(drawText("Squad", 605, 258, sortFeature == "squad" ? "beige" : "#bcbcbc", "Arial Black", 16, "left", "middle", "black", 1, listGroup), "squad_sort")
        
    //add lists of players
    var listPlayers = playersSquad.filter(e=>!startingPlayers.map(e=>e?.id).includes(e.id))
    if (pointerNum + 12 > listPlayers.length) pointerNum = listPlayers.length - 12
    if (pointerNum < 0) pointerNum = 0
    var newPlayers = listPlayers.slice(pointerNum)
    var playerNameY = 280
    var playerNameWidth = 280
    var playerNameHeight = 30
    var playerNameMargin = 3;
    for (var i = 0; i < 13; i++) {
        if (!newPlayers[i]) continue;
        var playerName = newPlayers[i].name;
        var playerId = newPlayers[i].id;
        var potInc = newPlayers[i].potInc;
        var playerC = newPlayers[i].c;
        var mainPos = newPlayers[i].primaryPositions[0]
        var playerRating = convertRating(newPlayers[i].rating);
        var playerArea = findArea(mainPos);
        var isGoalie = mainPos == "GK"
        
        var group = new Konva.Group();
        var color = "#85c2fa";
        var el1 = drawRectangle(600, playerNameY, 0, color, 30, playerNameWidth, playerNameHeight);
        var el2 = drawRectangle(610, playerNameY + 5, 0, convertFromPosToColor(playerArea), "black", 30, playerNameHeight - 10)
        var el3 = drawText(newPlayers[i].primaryPositions[0].replace(/(R|L)WB/g, "WB"), 625, playerNameY + 8, "beige", "Arial Black", 16, "center", "middle", "black", 1)
        var el4 = drawText(playerName, 648, playerNameY + 10, "black", "Rockwell", 13, "left", "middle", "black", 0)
        group.add(el1, el2, el3, el4)
        el1.playerID = playerId;
        el2.playerID = playerId;
        el3.playerID = playerId;
        el4.playerID = playerId;
        el1.C = playerC;
        el2.C = playerC;
        el3.C = playerC;
        el4.C = playerC;
        el1.isGK = isGoalie;
        el2.isGK = isGoalie;
        el3.isGK = isGoalie;
        el4.isGK = isGoalie;
        addHover(group, `select_player_${playerC}`)
        listGroup.add(group)
        
        var fullStar = Math.ceil(playerRating)
        var starSize = 10;
        for (var j = 0; j < 5; j++) {
            var starX = (540 + playerNameWidth + j * (starSize + 2));
            var starY = playerNameY + playerNameHeight / 2;
            if (playerRating % 1 === 0.5 && j == fullStar - 1) drawStar(starX, starY, starSize, "yellow", true, listGroup);
            else if (fullStar > j) drawStar(starX, starY, starSize, "yellow", false, listGroup);
            else drawStar(starX, starY, starSize, "black", false, listGroup);
        }
        
        playerNameY += playerNameHeight + playerNameMargin;
    }

    //up arrow
    if (pointerNum > 0){
        addHover(drawRectangle(589, 220, 0, "rgba(0, 0, 0, 0.7)", "black",  playerNameWidth + 20, playerNameHeight - 1, listGroup), "up_arrow")
        addHover(drawArrow(585 + playerNameWidth/2, 225, 30, 15, "beige", listGroup), "up_arrow")
    }
    //bottom arrow
    if ((12 + pointerNum) < listPlayers.length){
        addHover(drawRectangle(589, 671, 0, "rgba(0, 0, 0, 0.7)", "black",  playerNameWidth + 20, playerNameHeight - 1, listGroup), "bottom_arrow")
        addHover(drawUpsideDownArrow(585 + playerNameWidth/2, 678, 30, 15, "beige", listGroup), "bottom_arrow")
    }
    blurRectangle(854, 70, 35, 630, "rgba(0, 0, 0, 0.0)", "black", 0, "rgba(0, 0, 0, 0.55)", false, listGroup, 15)
    addHover(drawText("Rating", 815, 258, sortFeature == "rating" ? "beige" : "#bcbcbc", "Arial Black", 16, "left", "middle", "black", 1, listGroup), "rating_sort")

    //listGroup.draw();
};

function drawStats(){
    statGroup.destroyChildren();
    var previousRating = squadRating;
    var totalRating = calculateSquadOverall()
    squadRating = Math.floor(Math.round(totalRating/11))
    var previousChem = squadChem;
    squadChem = 90;
    var radius = 50
    const centerX = 600 + radius;
    const centerY = 100 + radius;
    drawAnimatedCircle(centerX, centerY, radius, squadRating, "#484848", '#25FB00', 'rgba(40, 67, 135, 0.35)', previousRating, statGroup)
    drawText(squadRating, centerX, centerY - 35, "#25FB00", "Trattatello", 78, "center", "middle", "black", 2, statGroup);
    drawText(`Chemistry (${squadChem})`, centerX + 140, centerY - 55, "beige", "Optima", 17, "center", "middle", "black", 0, statGroup);
    drawAnimatedRectangle(centerX + 75, centerY - 32, 150, 20, "#25FB00", previousChem, squadChem, statGroup);
    drawText(`Formation`, centerX + 140, centerY + 5, "beige", "Optima", 17, "center", "middle", "black", 0, statGroup);
    formationText = drawText(formation.split("").join("-"), centerX + 140, centerY + 25, "gold", "Optima", 42, "center", "middle", "black", 0, statGroup);
    //statGroup.draw();
}

function changeFormation() {
    addHover(drawRectangle(0, 0, 0, "rgba(0, 0, 0, 0.7)", "black", stage.width(), stage.height(), formationGroup), "exit_formation", true)
    drawTrapezoid(360, 40, 175, 50, "#484848", "#25FB00", 2, formationGroup)
    drawText("Formation", 376.5, 51.5, "rgba(0, 0, 0, 0.7)", "Optima", 32, "left", "middle", "black", 0.3, formationGroup);
    drawText("Formation", 378, 50, "#25FB00", "Optima", 32, "left", "middle", "black", 0, formationGroup);
    coolRectangle(10, 90, 880, 525, "#6f816c", "#25FB00", 2, "#484848", formationGroup)
    var count = 0
    var yGap = 0

    for (var formation in allFormations){
        var group = new Konva.Group();
        var el1 = drawRectangle((count * 175) + 18, 100 + (yGap * 259), 4, "purple", "black", 165, 30)
        var el2 = drawPitch((count * 175) + 18, 100 + (yGap * 259) + 30, 165, 219, "#999999", "black", 4) //formation
        var el3 = drawText(formation.toString(), 18 + (count * 175) + 85, 100 + (yGap * 259) + 8, "beige", "monaco", 18, "center", "middle", null, null) //label
        var arr = allFormations[formation]
        var circles = []
        for (var i = 0; i < arr.length; i++){
            circles.push(drawCircle(18 + (count * 175) + (arr[i][0]/2.8) - 5, 100 + (yGap * 259) + (arr[i][1]/2.7) + 23, 4, "red", "black"))
        }
        count++
        if (count == 5) count = 0, yGap += 1
        group.add(el1, el2, el3, ...circles)
        formationGroup.add(group)
        addHover(group, `set_formation_${formation}`)
    }
}

function shapeTactic1() {
    tactic1Group1.destroyChildren();   
    //add positions and players
    var depth = 100 - depthTactic
    var width = 100 - widthTactic
    var line = 100 - lineTactic
    addPointerTriangle(270 + (widthTactic * 3.5), 95, Math.floor(widthTactic), 0, "Width", tactic1Group1)
    addPointerTriangle(208 + (depth * 3.5), -770, Math.floor(depthTactic), 90, "Length", tactic1Group1)
    addPointerTriangle(-658 + (lineTactic * 3.5), 220, Math.floor(lineTactic), 270, "Height", tactic1Group1)
    var positions = allFormations[formation]
    var defaultX = 1.2 + ((width * 0.25)/100)
    var defaultZ = line * 0.45
    var centerX = 277.5

    for (var i = 0; i < positions.length; i++) {
        var position = positions[i];
        var squareColor = "#484848"
        var strokeColor = "black"
        if (position[0] == 240) var x = (position[0]/1.2) + 277.5
        else var x = centerX + (position[0] / defaultX) + ((width/100) * 34.4827586)
        var y = position[1] + (((depth + 50) * ((550-position[1])/125))/2) + (defaultZ * 1.5)
        if (i == positions.length - 1) drawRectangle((position[0]/1.2) + 277.5, (position[1]/1.13) + 153, 3, squareColor, strokeColor, 35, 22, tactic1Group1, 5)
        else drawRectangle(x, Math.max(y, 200), 3, squareColor, strokeColor, 35, 22, tactic1Group1, 5)
    }
}

function shapeTactic2() {
    //add pitch
    addImageToCanvas("pitch.png", 300, 170, 389, 530, tactic1Group2) 
    blurRectangle(100, 70, 35, 630, "rgba(0, 0, 0, 0.55)", "black", 0, "rgba(0, 0, 0, 0.0)", true, tactic1Group2, 15)
    blurRectangle(854, 70, 35, 630, "rgba(0, 0, 0, 0.0)", "black", 0, "rgba(0, 0, 0, 0.55)", false, tactic1Group2, 15)
    //
    var slider1 = addHandler(310, 155, 370, "width")
    var slider2 = addHandler(700, 248, 370, "depth")
    var slider3 = addHandler(280, 248, 370, "line")
    //
    tactic1Group2.add(slider1)
    tactic1Group2.add(slider2)
    tactic1Group2.add(slider3)
}

function defensiveTactic1(point) {
    tactic2Group1.destroyChildren();   

    drawText(pressureTactic, 705, 350, "gold", "Arial Black", 27, "center", "middle", "black", 1.5, tactic2Group1);
    addHover(drawText("<", 545, 350, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, tactic2Group1), "switch_defence_1_" + pressureTactic);
    addHover(drawText(">", 860, 350, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, tactic2Group1), "switch_defence_2_" + pressureTactic);
    //
    drawLine(325, 410, 350, "#062f39", tactic2Group1)
    drawText(markingTactic, 705, 450, "gold", "Arial Black", 28, "center", "middle", "black", 1.5, tactic2Group1);
    addHover(drawText("<", 545, 450, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, tactic2Group1), "switch_defence_1_" + markingTactic);
    addHover(drawText(">", 860, 450, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, tactic2Group1), "switch_defence_2_" + markingTactic);
    //
    drawLine(325, 510, 350, "#062f39", tactic2Group1)
    drawText(timeWasting ? "Yes" : "No", 705, 550, "gold", "Arial Black", 30, "center", "middle", "black", 1.5, tactic2Group1);
    addHover(drawText("<", 545, 550, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, tactic2Group1), "switch_defence_1_" + capitalizeFirstCharacter(timeWasting.toString()));
    addHover(drawText(">", 860, 550, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, tactic2Group1), "switch_defence_2_" + capitalizeFirstCharacter(timeWasting.toString()));
    //
    drawLine(325, 610, 350, "#062f39", tactic2Group1)
    drawText(offsideTrap ? "Yes" : "No", 705, 650, "gold", "Arial Black", 30, "center", "middle", "black", 1.5, tactic2Group1);
    addHover(drawText("<", 545, 650, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, tactic2Group1), "switch_defence_1_" + offsideTrap);
    addHover(drawText(">", 860, 650, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, tactic2Group1), "switch_defence_2_" + offsideTrap);

    var main = allFormations["442"]
    var opposition = allFormations["433"]
    //
    if (point == 0) createPressAnimation(tactic2Group1, main, opposition, pressureTactic);
    if (point == 1) createZonalAnimation(tactic2Group1, main, opposition, markingTactic);
    if (point == 2) createTimeAnimation(tactic2Group1, main, opposition, timeWasting);
    if (point == 3) createOffsideAnimation(tactic2Group1, main, opposition, offsideTrap);
}

function defensiveTactic2() {
    drawRectangle(100, 70, 1, "#062f39", "black", 789, 257.5, tactic2Group2, 15)
    addImageToCanvas("font-view.png", 260, 97, 489, 230, tactic2Group2) 
    blurRectangle(100, 70, 35, 630, "rgba(0, 0, 0, 0.55)", "black", 0, "rgba(0, 0, 0, 0.0)", true, tactic2Group2, 15)
    blurRectangle(854, 70, 35, 630, "rgba(0, 0, 0, 0.0)", "black", 0, "rgba(0, 0, 0, 0.55)", false, tactic2Group2, 15)
    drawText("Team Pressing", 375, 350, "beige", "Optima", 30, "right", "middle", "black", 0, tactic2Group2);
    drawText("Team Marking", 375, 450, "beige", "Optima", 30, "right", "middle", "black", 0, tactic2Group2);
    drawText("Time Wasting", 375, 550, "beige", "Optima", 30, "right", "middle", "black", 0, tactic2Group2);
    drawText("Offside Trap", 375, 650, "beige", "Optima", 30, "right", "middle", "black", 0, tactic2Group2);
}

function offensiveTactic1(point) {
    tactic3Group1.destroyChildren();   

    drawText(offensiveTactic, 705, 350, "gold", "Arial Black", 28, "center", "middle", "black", 1.5, tactic3Group1);
    addHover(drawText("<", 545, 350, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, tactic3Group1), "switch_attack_1_" + offensiveTactic);
    addHover(drawText(">", 860, 350, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, tactic3Group1), "switch_attack_2_" + offensiveTactic);
    //
    drawLine(325, 410, 350, "#062f39", tactic3Group1)
    drawText(transitionTactic, 705, 450, "gold", "Arial Black", 30, "center", "middle", "black", 1.5, tactic3Group1);
    addHover(drawText("<", 545, 450, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, tactic3Group1), "switch_attack_1_" + transitionTactic);
    addHover(drawText(">", 860, 450, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, tactic3Group1), "switch_attack_2_" + transitionTactic);
    //
    drawLine(325, 510, 350, "#062f39", tactic3Group1)
    drawText(cornerTactic, 705, 546, "gold", "Arial Black", 38, "center", "middle", "black", 1.5, tactic3Group1);
    addHover(drawText("<", 545, 550, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, tactic3Group1), "switch_attack_1_" + cornerTactic);
    addHover(drawText(">", 860, 550, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, tactic3Group1), "switch_attack_2_" + cornerTactic);
    //
    drawLine(325, 610, 350, "#062f39", tactic3Group1)
    drawText(fullbackTactic.split(" ")[0], 705, 650, "gold", "Arial Black", 28, "center", "middle", "black", 1.5, tactic3Group1);
    addHover(drawText("<", 545, 650, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, tactic3Group1), "switch_attack_1_" + fullbackTactic);
    addHover(drawText(">", 860, 650, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, tactic3Group1), "switch_attack_2_" + fullbackTactic);

    var main = allFormations["442"]
    var opposition = allFormations["433"]
    //
    if (point == 0 && offensiveTactic == "Wing Play") createWingPlayAnimation(tactic3Group1, main, opposition);
    if (point == 0 && offensiveTactic == "Long Ball") createLongBallAnimation(tactic3Group1, main, opposition);
    if (point == 0 && offensiveTactic == "Possession") createPossessionAnimation(tactic3Group1, main, opposition)
    if (point == 0 && offensiveTactic == "Direct Passing") createDirectAnimation(tactic3Group1, main, opposition)
    if (point == 1) createTransitionAnimation(tactic3Group1, main, opposition, transitionTactic);
    if (point == 2) createCornerAnimation(tactic3Group1, main, opposition, parseInt(cornerTactic));
    if (point == 3) createFullbackAnimation(tactic3Group1, main, opposition, fullbackTactic);
}

function offensiveTactic2() {
    drawRectangle(100, 70, 1, "#062f39", "black", 789, 257.5, tactic3Group2, 15)
    addImageToCanvas("font-view.png", 260, 97, 489, 230, tactic3Group2) 
    blurRectangle(100, 70, 35, 630, "rgba(0, 0, 0, 0.55)", "black", 0, "rgba(0, 0, 0, 0.0)", true, tactic3Group2, 15)
    blurRectangle(854, 70, 35, 630, "rgba(0, 0, 0, 0.0)", "black", 0, "rgba(0, 0, 0, 0.55)", false, tactic3Group2, 15)
    drawText("Offensive Style", 375, 350, "beige", "Optima", 30, "right", "middle", "black", 0, tactic3Group2);
    drawText("Transition Speed", 375, 450, "beige", "Optima", 30, "right", "middle", "black", 0, tactic3Group2);
    drawText("Corners N°", 375, 550, "beige", "Optima", 30, "right", "middle", "black", 0, tactic3Group2);
    drawText("Full Backs", 375, 650, "beige", "Optima", 30, "right", "middle", "black", 0, tactic3Group2);
}

function squadUI(){
    drawRectangle(100, 70, 1, "#062f39", "black", 789, 57.5, squadGroup2, 15)
    var searchButton = new Konva.Group();
    drawRectangle(620, 85, 2, "#33717f", "black", 60, 30, searchButton, 5)
    addImageToCanvas("item3.png", 638, 87, 27, 26, searchButton, 0.75)
    addHover(searchButton, 'search_player2')  
    squadGroup2.add(searchButton)  
    blurRectangle(854, 70, 35, 630, "rgba(0, 0, 0, 0.0)", "black", 0, "rgba(0, 0, 0, 0.55)", false, squadGroup2, 15)
    blurRectangle(100, 70, 35, 630, "rgba(0, 0, 0, 0.55)", "black", 0, "rgba(0, 0, 0, 0.0)", true, squadGroup2, 15)
}

function showSquad(name, page){
    squadGroup.destroyChildren();
    var startingX = 0
    var startingY = 20
    var c = 0
    var JSONPlayers = [...fullSquad]
    JSONPlayers = JSONPlayers.filter(e=>e.normalName.toLowerCase().includes(name.toLowerCase()))
    var allC = playersSquad.map(e=>e.c)
    var allID = playersSquad.map(e=>e.id)
    
    JSONPlayers.sort((a, b)=>{
        if (allC.includes(a.c) && allC.includes(b.c)) return parseInt(b.rating) - parseInt(a.rating)
        if (allC.includes(a.c)) return -1
        if (allC.includes(b.c)) return 1
        return parseInt(b.rating) - parseInt(a.rating)
    })

    if (!page) {
        page = 0;
        searchPage2 = 0;
    }
    var maxCount = Math.min(JSONPlayers.length, 50 + page)

    for (var i = page; i < maxCount; i++){
        var card = drawCard(startingX, startingY, 270, 330, "#5032a8", "#8777b7", JSONPlayers[i], squadGroup, true, false)
        var player = JSONPlayers[i]
        addHover(card, `select_player_${player.c}`)
        card.scale({x: 0.45, y: 0.45})
        if (!allC.includes(player.c)){
            card.opacity(0.5);
            if (!allID.includes(player.id) && playersSquad.length <= 22) addHover(addImageToCanvas("plusSign.png", (startingX * 0.45) + 98, (startingY * 0.45) + 66, 20, 20, squadGroup), `add_tosquad_${player.id}_${player.potInc}_${player.c}`, true)
        }
        else{
            addHover(addImageToCanvas("minusSign.png", (startingX * 0.45) + 98, (startingY * 0.45) + 66, 20, 20, squadGroup), `remove_fromsquad_${player.id}_${player.potInc}_${player.c}`, true)
        }
        startingX += 320
        if ((i + 1) % 5 == 0){
            startingX = 0
            startingY += 360
        }
        if (i % 5 == 0) c++
    }
    var max = c * (148.5 + 13.5)
    var gap = 0

    if (JSONPlayers.length > 50){
        gap = 75
        if (maxCount > 50) addHover(drawTriangle(max + 20, -70, 40, 25, "rgba(6, 47, 57, 0.45)", "black", 2, squadGroup).rotation(90), `back_page2`)
        else drawTriangle(max + 20, -70, 40, 25, "rgba(6, 47, 57, 0.10)", "rgba(6, 47, 57, 0.30)", 2, squadGroup).rotation(90)
        if (JSONPlayers.length - maxCount > 0) addHover(drawTriangle(-max - 55, 630, 40, 25, "rgba(6, 47, 57, 0.45)", "black", 2, squadGroup).rotation(270), `next_page2`)
        else drawTriangle(-max - 55, 630, 40, 25, "rgba(6, 47, 57, 0.10)", "rgba(6, 47, 57, 0.30)", 2, squadGroup).rotation(270)
    }

    squadGroup.height(max + gap)
    checkPages();
}

function getTactics(){
    var tactics = {
      "startingXI": startingPlayers,
      "formation": formation,
      "height": Math.floor(lineTactic),
      "length": Math.floor(depthTactic),
      "width": Math.floor(widthTactic),
      "pressing": pressureTactic,
      "marking": markingTactic,
      "timeWasting": timeWasting,
      "offsideTrap": offsideTrap,
      "offensiveStyle": offensiveTactic,
      "transition": transitionTactic,
      "corners": parseInt(cornerTactic),
      "fullbacks": fullbackTactic
    }

    return tactics
}

function checkTactics(tactics){
    var saveTactic = [...tactics.startingXI]
    saveText.text("Saving...")
    setTimeout(async function () {
        var newTactics = getTactics()
        var isComplete = true
        for (t in tactics){
            if (t == "startingXI"){
                if (!newTactics[t].map(e=>e?.c).every((v, n) => saveTactic.map(e=>e?.c)[n] == v)) isComplete = false
            }else{
                if (tactics[t] != newTactics[t]) isComplete = false
            }
        }
        if (isComplete){
            var n = await updateTactics(newTactics)
            if (!n) return
            saveText.text("Saved ✓")
            setTimeout(function () {
                if (saveText.text() == "Saved ✓") saveText.text("")
            }, 1000)
        }
    }, 3000);
}