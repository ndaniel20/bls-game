var stage = new Konva.Stage({
    container: 'canvasContainer',  
    width: 900,
    height: 700,
});

const htmlElements = document.createElement('div');
htmlElements.classList.add("html-content")
document.querySelector("#canvasContainer").appendChild(htmlElements)
var textInput = document.createElement('input');
var miniStage;
const userToken = getCookie("login")
var clubName;
var clublogo;
var clubStadium;
//
const itemsPNG = ["item1.png", "item2.png", "item3.png", "item4.png", "item5.png", "item6.png"]
const positionList = ['ST', 'LW', 'RW', 'RM', 'LM', 'AM', 'CM', 'DM', 'RWB', 'LWB', 'RB', 'LB', 'CB', 'GK'];
var babaCoins;
var powerUps;
var isAdmin;
var squadTab = {0: "game menu", 1: "formation", 2: "transfer market"}
var backgrounds = []
var database = [];
var BSLDB = {}
var fullSquad = [];
var playersSquad = [];
var squadTactics = {}
var countries = [];
var clubsList = [];
var allFormations = [];
var imageCache = {};
var basePrice = {};
var lastSearch = ""
var isKickOffOpen = false
var isSeasonsOpen = false
var isSeasonsPopUpOpen = false;
var seasonsData;
var mainDiv = document.querySelector("#canvasContainer > div")
//
var BLSLayer = new Konva.Layer();
var miniLayer = new Konva.Layer();
var tabsGroup = new Konva.Group();
var searchLayer = new Konva.Group();
var backgroundLayer = new Konva.Group();
var menuLayer = new Konva.Group();
var squadManagementLayer = new Konva.Group();
var playerGroup = new Konva.Group();
var squadGroup = new Konva.Group();
var cardGroup = new Konva.Group();
var gameMenuLayer = new Konva.Group();
var gameLayer = new Konva.Group();
var layers = [gameMenuLayer, squadManagementLayer, searchLayer]
//
var BLSPage = 0
BLSLayer.add(backgroundLayer)
BLSLayer.add(menuLayer);
BLSLayer.add(tabsGroup);
stage.add(BLSLayer);

coolRectangle(0, 0, 900, 700, "#6f816c", "black", 0, "#484848", backgroundLayer)
//coolRectangle(0, 0, 900, 700, "#45818e", "black", 0, "#0b5394", menuLayer)


startPage();
async function startPage(){
    BSLDB = await loadFile("src/data/database.json");
    database = Object.values(BSLDB).flat().reduce((result, currentArray) => result.concat(currentArray), []);

    var userData = await getUserData();
    isAdmin = userData.isAdmin
    fullSquad = userData.players
    squadTactics = userData.tactics
    babaCoins = parseInt(userData.coins)
    powerUps = parseInt(userData.powerUps)
    fullSquad = getFullPlayers(fullSquad)
    playersSquad = fullSquad.filter(e=>e.inSquad)
    clubName = userData.teamName
    clubLogo = userData.teamLogo
    clubStadium = userData.stadiumURL

    basePrice = createBasePrice()
    backgrounds = await getFileNames()
    allFormations = await loadFile("src/data/formations.json");
    countries = await loadFile("src/data/nations.json");
    clubsList = await loadFile("src/data/clubs.json");
    clubsList.sort((a, b) => a.name.localeCompare(b.name))
    var playerFaces = database.map(e=>`https://img.fminside.net/facesfm24/${e.id}.png`)
    var playerFlags = countries.map(e=>e.logo)
    var clubLogos = clubsList.map(e=>e.logo)
    var stadiumBackgrounds = clubsList.map(e=>e.stadiumURL)
    const allImageURLs = backgrounds.concat(playerFaces, playerFlags, clubLogos, stadiumBackgrounds, clubLogo, clubStadium);
    console.log("Loading")
    await preloadImages(allImageURLs)
    document.querySelector('.loading-container').style.display = 'none';
    console.log("Loaded")

    seasonsData = await getSeason();

    var trapezoid = drawTrapezoid(-40, 0, 400, 83, "#444444", "black", 2, null, -2)
    backgroundLayer.add(trapezoid)
    addImageToCanvas(`paintBackground.png`, 0, 0, 900, 730, backgroundLayer, 0.15)
    drawText("BLS 2023 ✰", 20, 10, "beige", "Trattatello", 62, "left", "middle", "black", 0, backgroundLayer)
    drawLine(320, 83.5, 700, "black", backgroundLayer)
    drawRectangle(0, 0, 0, "rgba(0, 0, 0, 0.3)", "black", stage.width(), stage.height(), backgroundLayer)
    createHTMLDiv();
    miniStage = new Konva.Stage({container: 'scroll-players',width: 700,height: 700,});
    miniStage.add(miniLayer)

    startSquadManagement();
    startSearch();
    drawGameMenu();
    checkPages(true);
    drawTabs();
    BLSLayer.add(playerGroup)
}

function menuPage(){
    menuLayer.destroyChildren();
    var group = new Konva.Group({x: 800,y: 10, });
    var maxWidth = 70
      
    var volume = addImageToCanvas("volume.png", -90, -7, 25, 30, group);
    var bell = addImageToCanvas("bell.png", -53, -5, 25, 25, group);
    var coin = addImageToCanvas("coins.png", -14, -2.5, 22, 22, group);
    var coinText = drawText(addCommas(babaCoins), 12.5, 2.5, "black", "Trebuchet MS", 15, "left", "middle", "black", 0.3, group);
    var coinText = drawText(addCommas(babaCoins), 11, 2, "beige", "Trebuchet MS", 15, "left", "middle", "black", 0.3, group);
    var lightning = addImageToCanvas("lightning.png", coinText.width() + 14, -2.5, 29, 22, group);
    var lightningText = drawText(addCommas(powerUps), coinText.width() + 39.5, 2.5, "black", "Trebuchet MS", 15, "left", "middle", "black", 0.3, group);
    var lightningText = drawText(addCommas(powerUps), coinText.width() + 38, 2, "beige", "Trebuchet MS", 15, "left", "middle", "black", 0.3, group);
    var totalWidth = lightningText.x() + lightningText.width()
    if (totalWidth > maxWidth) {
        var left = totalWidth - maxWidth
        group.x(group.x() - left)
    }

    menuLayer.add(group);
    for (var i = 0; i < 6; i++){
        var collection = new Konva.Group();
        if (i == BLSPage) {
            drawRectangle(0, 85 + (i * 102.5), 6, "", "rgba(0, 0, 0, 0.4)", 100, 102.5, collection)
            addImageToCanvas(itemsPNG[i], 10, 85 + (i * 102.5) + 10, 80, 80, collection, 1)
        }
        else {
            drawRectangle(0, 85 + (i * 102.5), 1, "", "rgba(0, 0, 0, 0.2)", 99, 102.5, collection)
            addImageToCanvas(itemsPNG[i], 10, 85 + (i * 102.5) + 10, 80, 80, collection, 0.35)
            
        }
        addHover(collection, `item${i}`, true)
        menuLayer.add(collection);
    }

}


function drawTabs() {
    tabsGroup.destroyChildren();
    if (BLSPage == 0) {
        var arr = ["Game Menu"]
        if (isKickOffOpen) arr.push("Kick Off")
        if (isSeasonsOpen) arr.push("Seasons")
    }
    if (BLSPage == 1) var arr = ["Squad", "Formation", "Shape", "Defence", "Attack"]
    if (BLSPage == 2) var arr = ["Transfer Market"]
    var values = Object.values(squadTab)
    var reorderedArray = arr
    var x = 750/reorderedArray.length;
    var later;

    for (var i = reorderedArray.length - 1; i >= 0; i--){
        var group = new Konva.Group();
        var bool = values.includes(reorderedArray[i].toLowerCase())
        var start = 125 + (i * x)
        drawTrapezoid(start + 5, 43, x - 10, 28, "rgba(0, 0, 0, 0.3)", "black", 0, tabsGroup)
        group.add(drawTrapezoid(start, 46, x - 10, bool ? 25 : 23, bool ? "#833095" : "#6e2a7d", "black", 2, tabsGroup))
        group.add(drawText(capitalizeFirstCharacter(reorderedArray[i]), ((start + (start + (x-10)))/2) + 1, 51, "#black", "Trebuchet MS", 17, "center", "middle", "black", 0, tabsGroup))
        group.add(drawText(capitalizeFirstCharacter(reorderedArray[i]), (start + (start + (x-10)))/2, 50, bool ? "#edc7fb" : "rgba(237, 199, 251, 0.5)", "Trebuchet MS", 17, "center", "middle", "black", 0.1, tabsGroup))
        addHover(group, `squad_tabs_${reorderedArray[i].toLowerCase()}`)
        if (bool == false) tabsGroup.add(group)
        else later = group
    }
    if (later) tabsGroup.add(later)
    gradientRectangle(100, 70, 789, 630, "#4d296f", "black", 0, "#114652", tabsGroup, 15)
}

function checkPages(reset){
    layers.forEach(function(layer) {layer.visible(false)});
    layers[BLSPage].visible(true)
    if (reset == true){
        textInput.value = ""
        lastSearch = ""
        if (BLSPage == 1) textInput.style.left = "380px"
        if (BLSPage == 2) textInput.style.left = "468px"
    }
    if (BLSPage == 2){
        squadGroup.visible(false)
        cardGroup.visible(true)
        miniStage.height(cardGroup.height())
        htmlElements.style.display = "block"
    }
    else if (squadTab[1] == "squad" && BLSPage == 1) {
        cardGroup.visible(false)
        squadGroup.visible(true)
        miniStage.height(squadGroup.height())
        htmlElements.style.display = "block"
    }
    else htmlElements.style.display = "none"
    menuPage();
}

function checkLayer(){
    layers.forEach(e=>e.children.forEach(function(layer) {layer.visible(false);}));
    tabsGroup.visible(true);
    var values = Object.values(squadTab)
    if (values.includes("formation")) {formationLayer.visible(true);formationGroup.visible(false);}
    if (values.includes("shape")) shapeLayer.visible(true);
    if (values.includes("defence")) defenceLayer.visible(true);
    if (values.includes("attack")) attackLayer.visible(true);
    if (values.includes("game menu")) gameMenuGroup.visible(true);
    if (values.includes("transfer market")) searchBackground.visible(true);
    if (values.includes("kick off")) kickOffGroup.visible(true);
    if (values.includes("seasons")) seasonAwardGroup.destroyChildren(),seasonsGroup.visible(true);
    if (values.includes("squad")) squadGroup2.visible(true);
}

function initializeInput(){
    textInput.type = 'text';
    textInput.classList.add('text-input');
    textInput.placeholder = 'Type a player name...';
    htmlElements.appendChild(textInput);

    textInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            var name = textInput.value
            lastSearch = textInput.value
            if (BLSPage == 2) addSmallCards(name)
            if (squadTab[1] == "squad" && BLSPage == 1) showSquad(name)
        }
    });
}

function getCookie(cookieName) {
    const name = cookieName + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    
    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i].trim();
        
        if (cookie.startsWith(name)) {
            return cookie.substring(name.length, cookie.length);
        }
    }
    return null;
}
