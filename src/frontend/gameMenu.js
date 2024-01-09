
var gameMenuGroup = new Konva.Group();
var leaguePNG;
var seasonsMenuPage = 0
var leagues = ["laliga.png", "premierleague.png", "seriea.png", "ligue1.png", "bundesliga.png", "championsleague.png"]
var leaguesName = ["LaLiga", "Premier League", "Serie A", "Ligue 1", "Bundesliga", "Champions League"]
var prizes = ["85,000", "105,000", "75,000", "50,000", "62,000", "120,000"]
//
gameMenuLayer.add(gameMenuGroup)
BLSLayer.add(gameMenuLayer)


function drawGameMenu(){
    drawRectangle(487, 378, 0, "black", "black", 15, 15, gameMenuGroup, 15)
    drawTriangle(483, 70, 22, 15, "black", "", 0, gameMenuGroup)
    drawTriangle(487, 70, 15, 15, "black", "", 0, gameMenuGroup)
    drawTriangle(376, -889, 20, 15, "black", "", 0, gameMenuGroup, 90)
    drawTriangle(-505, -700, 22, 15, "black", "", 0, gameMenuGroup, 180)
    drawTriangle(-394, 99.8, 20, 18, "black", "", 0, gameMenuGroup, 270)
    blurRectangle(854, 70, 35, 630, "rgba(0, 0, 0, 0.0)", "black", 0, "rgba(0, 0, 0, 0.70)", false, gameMenuGroup, 15)
    blurRectangle(100, 70, 35, 630, "rgba(0, 0, 0, 0.95)", "black", 0, "rgba(0, 0, 0, 0.0)", true, gameMenuGroup, 15)
    blurRectangle(459.5, 70, 35, 630, "rgba(0, 0, 0, 0.0)", "black", 0, "rgba(0, 0, 0, 0.60)", false, gameMenuGroup, 15)
    blurRectangle(494.5, 70, 35, 630, "rgba(0, 0, 0, 0.60)", "black", 0, "rgba(0, 0, 0, 0.0)", true, gameMenuGroup, 15)

    for (var i = 0; i < 4; i++){
        var imagePanelGroup = new Konva.Group();
        if (i == 0) {
            var x = 102, y = 72.2
            var w = 392.5, h = 313
            drawRectangle(x, y, 4, "", "black", w, h, imagePanelGroup, 15)
            addImageToCanvas("banner3.png", x + 2, y + 1, 388.5, 310, imagePanelGroup, 0.35, 15)
            addImageToCanvas("onlineIcon.png", x + 25, y + 15, 35, 43, imagePanelGroup)
            drawText("Friendly", (x + (x + w))/2, (y + (y + h))/2 + 20, "beige", "Impact", 48, "center", "middle", "#ffc000", 1, imagePanelGroup)
        }
        if (i == 1) {
            var x = 494.5, y = 72.3
            var w = 392.5, h = 313
            drawRectangle(x, y, 4, "", "black", w, h, imagePanelGroup, 15)
            addImageToCanvas("banner2.png", x + 1, y + 1, 388.5, 310, imagePanelGroup, 0.35, 15)
            addImageToCanvas("offlineIcon.png", x + 25, y + 15, 35, 43, imagePanelGroup)
            drawText("Kick Off", (x + (x + w))/2, (y + (y + h))/2 + 20, "beige", "Impact", 48, "center", "middle", "#ffc000", 1, imagePanelGroup)
            addHover(imagePanelGroup, `gameSelection_1`)
        }
        if (i == 2) {
            var x = 102, y = 385
            var w = 392.5, h = 313
            drawRectangle(x, y, 4, "", "black", w, h, imagePanelGroup, 15)
            addImageToCanvas("banner1.png", x + 2, y + 1.5, 388.5, 310, imagePanelGroup, 0.35, 15)
            addImageToCanvas("offlineIcon.png", x + 25, y + 15, 35, 43, imagePanelGroup)
            drawText("Seasons", (x + (x + w))/2, (y + (y + h))/2 + 20, "beige", "Impact", 48, "center", "middle", "#ffc000", 1, imagePanelGroup)
            addHover(imagePanelGroup, `gameSelection_2`)
        }
        if (i == 3) {
            var x = 494.5, y = 385
            var w = 392.5, h = 313
            drawRectangle(x, y, 4, "", "black", w, h, imagePanelGroup, 15)
            addImageToCanvas("banner4.png", x + 1, y + 1.5, 388.5, 310, imagePanelGroup, 0.35, 15)
            addImageToCanvas("onlineIcon.png", x + 25, y + 15, 35, 43, imagePanelGroup)
            drawText("Tournament", (x + (x + w))/2, (y + (y + h))/2 + 20, "beige", "Impact", 48, "center", "middle", "#ffc000", 1, imagePanelGroup)
        }
        addMouseOver(imagePanelGroup);
        gameMenuGroup.add(imagePanelGroup)
    }
}


function addMouseOver(group) {
    var x = group.children[0].x()
    var y = group.children[0].y()
    group.on('mouseover', function() {
      scaleImagePanelGroup(group, 1.1, x, y, 1); // Scale factor when hovered
    });
  
    group.on('mouseout', function() {
      scaleImagePanelGroup(group, 1, x, y, 0.35); // Restore the original scale
    });

    group.on('mousedown', function() {
        scaleImagePanelGroup(group, 1, x, y, 0.35); // Restore the original scale
    });
  
}

function scaleImagePanelGroup(group, scale, x, y, opacity) {
    var index = gameMenuGroup.children.indexOf(group)
    var elementToMove = gameMenuGroup.children.splice(index, 1)[0];
    gameMenuGroup.children.push(elementToMove);
    group.children[1].opacity(opacity)
    group.x((x - (x * scale)) - (scale == 1 ? 1 : 20))
    group.y(y - (y * scale) - (scale == 1 ? 1 : 20))
    group.scale({x: scale, y: scale});
}

function openPopUpSeasons(){
    isSeasonsPopUpOpen = true;
    var popUpGroup = new Konva.Group();
    var x = 248.25, y = 178.7, w = 498.25, h = 428.7
    var blackedOut = drawRectangle(100, 70, 0, "rgba(0, 0, 0, 0.65)", "black", 789, 630, popUpGroup, 15)
    gradientRectangle(x, y, w, h, "#6f816c", "black", 3, "#484848", popUpGroup, 15)
    drawText("Pick a competition", (x + (x + w))/2, y + 30, "gold", "Trebuchet MS", 38, "center", "middle", "black", 0.3, popUpGroup)
    var leftArrow = drawText("◄", (x + (x + w))/2 - 200, y + 180, "#eeeeee", "Impact", 76, "left", "middle", "black", 0.5, popUpGroup)
    var rightArrow = drawText("►", (x + (x + w))/2 + 200, y + 180, "#eeeeee", "Impact", 76, "right", "middle", "black", 0.5, popUpGroup)
    var submitGroup = new Konva.Group();
    var rr = drawRectangle((x + (x + w))/2 - 120, y + 360, 2, "purple", "black", 240, 50, submitGroup)
    drawText("Submit", (rr.x() + (rr.x() + rr.width()))/2, y + 370, "#bd8fe8", "Trebuchet MS", 34, "center", "middle", "black", 0.3, submitGroup)
    popUpGroup.add(submitGroup)
    addHover(submitGroup, `gameSelection_2`)
    addHover(leftArrow, '')
    addHover(rightArrow, '')
    seasonsPrize = drawText(`Prize: ${prizes[seasonsMenuPage]}`, (rr.x() + (rr.x() + rr.width()))/2, y + 335, "beige", "Trebuchet MS", 21, "center", "middle", "black", 0.3, popUpGroup)
    leaguePNG = addImageToCanvas(leagues[seasonsMenuPage], (x + (x + w))/2 - 100, y + 130, 200, 162, popUpGroup)
    gameMenuLayer.add(popUpGroup)

    blackedOut.on('click', function() {
        isSeasonsPopUpOpen = false
        popUpGroup.destroy()
    });
    leftArrow.on('click', function() {
        showPopUpLeagues(-1)
    });
    rightArrow.on('click', function() {
        showPopUpLeagues(1)
    });
}

function showPopUpLeagues(num){
    seasonsMenuPage += num
    if (seasonsMenuPage < 0) seasonsMenuPage = leagues.length - 1
    if (seasonsMenuPage >= leagues.length) seasonsMenuPage = 0
    leaguePNG.image(imageCache[leagues[seasonsMenuPage]])
    seasonsPrize.text(`Prize: ${prizes[seasonsMenuPage]}`)
}