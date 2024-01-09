var searchCanvas;
var miniStage;
var filterClub = ""
var filterClubLogo;
var filterNation = ""
var filterNationLogo;
var filterPosition = ""
var filterPositionText;
var starCheckbox = false
var checkStarMark;
var ulElement;
var searchPage = 0;
var view2 = 0;
//
var searchBackground = new Konva.Group();
//
searchLayer.add(searchBackground)
BLSLayer.add(searchLayer)

function startSearch(){
    searchCanvas = document.getElementsByTagName("canvas")[3]
    miniLayer.add(cardGroup)
    drawRectangle(100, 70, 1, "#062f39", "black", 789, 57.5, searchBackground, 15)
    blurRectangle(854, 70, 35, 630, "rgba(0, 0, 0, 0.0)", "black", 0, "rgba(0, 0, 0, 0.55)", false, searchBackground, 15)
    blurRectangle(100, 70, 35, 630, "rgba(0, 0, 0, 0.55)", "black", 0, "rgba(0, 0, 0, 0.0)", true, searchBackground, 15)
    drawBackground();
    initializeInput();
    addSmallCards("");
}

function drawBackground(){
    var searchButton = new Konva.Group();
    drawRectangle(708, 85, 2, "#33717f", "black", 60, 30, searchButton, 5)
    addImageToCanvas("item3.png", 726, 87, 27, 26, searchButton, 0.75)
    addHover(searchButton, 'search_player')  
    searchBackground.add(searchButton)  
    var searchView = new Konva.Group();
    drawRectangle(782, 85, 2, "#33717f", "black", 45, 30, searchView, 5)
    addImageToCanvas("viewPreview.png", 787, 87, 37, 26, searchView, 0.75)
    addHover(searchView, 'search_view')
    searchBackground.add(searchView)
    
    var startingX = 150
    var startingY = 85
    var arr = ["Nation", "Club", "Position"]
    for (var i = 0; i < 3; i++){
        var filterGroup = new Konva.Group();
        drawText(arr[i], (startingX + 8 + (startingX + 8 + 35))/2, startingY - 12, "#33717f", "Arial Narrow", 10, "center", "middle", "black", 0.1, filterGroup)
        drawRectangle(startingX + 16, startingY, 2, "#d1dde0", 'black', 35, 30, filterGroup)
        drawRectangle(startingX, startingY, 2, "#8a9ca0", 'black', 16, 30, filterGroup)
        drawText("x", startingX + 8, startingY + 8, "#660000", "Arial Black", 14, "center", "middle", "black", 1, filterGroup)
        addHover(filterGroup, `clear_filters_${i}`)
        searchBackground.add(filterGroup)
        startingX += 70
    }
    filterNationLogo = addImageToCanvas(``, 166.75, 85.75, 33.5, 28.5, searchBackground)
    addHover(drawRectangle(166, 85, 0, "", '', 35, 30, searchBackground), `filter_players_0`, true)
    filterClubLogo = addImageToCanvas(``, 239.25, 85.75, 28.5, 28.5, searchBackground)
    addHover(drawRectangle(236, 85, 0, "", '', 35, 30, searchBackground), `filter_players_1`, true)
    filterPositionText = drawText("", 323.5, 87.75, "#3c3a3a", "Impact", 25, "center", "middle", "beige", 0.5, searchBackground)
    addHover(drawRectangle(306, 85, 0, "", '', 35, 30, searchBackground), `filter_players_2`, true)

    drawText("In-range", (376 + (411))/2, startingY - 12, "#33717f", "Arial Narrow", 10, "center", "middle", "black", 0.1, filterGroup)
    addHover(drawRectangle(376, 85, 3, "#d1dde0", 'black', 35, 30, searchBackground), `filter_players_3`)
    checkStarMark = drawText("✓", 393.5, 87, "#660000", "Arial Black", 32, "center", "middle", "black", 1, searchBackground)
    addHover(checkStarMark, `filter_players_3`)
    checkStarMark.visible(false)
}

function checkBoxStar(){
    if (starCheckbox == true) {
        starCheckbox = false
        checkStarMark.visible(false)
        addSmallCards(lastSearch);
    }
    else if (starCheckbox == false) {
        starCheckbox = true
        checkStarMark.visible(true)
        addSmallCards(lastSearch);
    }
}

function addSmallCards(name, page){
    cardGroup.destroyChildren();
    var startingX = 0
    var startingY = 20
    var c = 0
    var JSONPlayers = [...database]
    JSONPlayers = JSONPlayers.filter(e=>e.normalName.toLowerCase().includes(name.toLowerCase()))
    if (filterNation.length > 0) JSONPlayers = JSONPlayers.filter(e=>e.nation == filterNation)
    if (filterClub.length > 0) JSONPlayers = JSONPlayers.filter(e=>e.club == filterClub)
    if (filterPosition.length > 0) JSONPlayers = JSONPlayers.filter(e=>e.primaryPositions.includes(filterPosition) || e.secondaryPositions.includes(filterPosition))
    if (starCheckbox) JSONPlayers = JSONPlayers.filter(e => babaCoins >= calculatePrice(e))
    JSONPlayers.sort((a, b)=>{
        if (a.rating == b.rating) return calculatePrice(b) - calculatePrice(a)
        return parseInt(b.rating) - parseInt(a.rating)
    })
    if (!page) {
        page = 0;
        searchPage = 0;
    }
    var maxCount = Math.min(JSONPlayers.length, 50 + page)

    console.log(JSONPlayers.length)
    for (var i = page; i < maxCount; i++){
        if (view2 == 0) var card = drawCard(startingX, startingY, 270, 330, "#5032a8", "#8777b7", JSONPlayers[i], cardGroup, false, true)
        if (view2 == 1) var card = drawCard(startingX, startingY, 270, 330, "#5032a8", "#8777b7", JSONPlayers[i], cardGroup, false, false)
        if (view2 == 2) var card = drawCard(startingX, startingY, 270, 330, "#5032a8", "#8777b7", JSONPlayers[i], cardGroup, true, false)
        if (view2 == 3) var card = drawCard(startingX, startingY, 270, 330, "#5032a8", "#8777b7", JSONPlayers[i], cardGroup, true, true)
        addHover(card, `select_player_${JSONPlayers[i].id}`)
        card.scale({x: 0.45, y: 0.45})
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
        if (maxCount > 50) addHover(drawTriangle(max + 20, -70, 40, 25, "rgba(6, 47, 57, 0.45)", "black", 2, cardGroup).rotation(90), `back_page`)
        else drawTriangle(max + 20, -70, 40, 25, "rgba(6, 47, 57, 0.10)", "rgba(6, 47, 57, 0.30)", 2, cardGroup).rotation(90)
        if (JSONPlayers.length - maxCount > 0) addHover(drawTriangle(-max - 55, 630, 40, 25, "rgba(6, 47, 57, 0.45)", "black", 2, cardGroup).rotation(270), `next_page`)
        else drawTriangle(-max - 55, 630, 40, 25, "rgba(6, 47, 57, 0.10)", "rgba(6, 47, 57, 0.30)", 2, cardGroup).rotation(270)
    }

    cardGroup.height(max + gap)
    checkPages();
}

function showSearchMenu(arr, type) {
    const searchBox = document.createElement('input');
    searchBox.type = 'text';
    searchBox.classList.add('country-input');
    searchBox.placeholder = `Type a ${type == 0 ? "country" : "club"} name`;

    const resultsList = document.createElement('ul');
    resultsList.id = 'resultsList';
    var overlay = document.createElement('div');
    overlay.classList.add('overlay');

    htmlElements.appendChild(overlay);
    htmlElements.appendChild(searchBox);
    htmlElements.appendChild(resultsList); 

    overlay.addEventListener('click', function(event) {
        if (event.target === overlay) {
            htmlElements.removeChild(searchBox);
            htmlElements.removeChild(resultsList); 
            htmlElements.removeChild(overlay);
        }
    });

    resultsList.addEventListener('click', function(event) {
        if (event.target.tagName === 'LI') {
          var selectedItem = event.target.textContent;
          console.log('Selected item:', selectedItem);
          htmlElements.removeChild(searchBox);
          htmlElements.removeChild(resultsList); 
          htmlElements.removeChild(overlay);
          var item = arr.find(e=>e.name == selectedItem)
          if (type == 0){
            filterNation = selectedItem;
            filterNationLogo.attrs.image = imageCache[item.logo]
          }
          if (type == 1) {
            filterClub = selectedItem;
            filterClubLogo.attrs.image = imageCache[item.logo]
          }
          BLSLayer.batchDraw();
          addSmallCards(lastSearch);
        }
    });

    searchBox.addEventListener('input', function() {
        const searchTerm = searchBox.value.toLowerCase();
        const filtered = arr.filter(item =>
            item.name.toLowerCase().includes(searchTerm)
        );
        resultsList.innerHTML = '';
        for (let i = 0; i < filtered.length && i < 12; i++) {
            const listItem = document.createElement('li');
            listItem.textContent = filtered[i].name;
            resultsList.appendChild(listItem);
        }
    });
}
  
function showDropMenu(arr, text, type){
    ulElement = document.createElement('ul');
    ulElement.style.left = (297 + (type * 70)) + 'px';
    ulElement.id = 'positionsList';

    arr.forEach(function(position) {
        var liElement = document.createElement('li');
        liElement.textContent = position;
        ulElement.appendChild(liElement);
    });

    ulElement.addEventListener('mousedown', function(event) {
        if (event.target.tagName === 'LI') {
          var selectedItem = event.target.textContent;
          console.log('Selected item:', selectedItem);
          text.text(selectedItem);
          text.fontSize(30);
          var textWidth = text.width();
          var textHeight = text.height();
          
          var maxFontSize = Math.min(35 / textWidth, 30 / textHeight) * 25;
          text.fontSize(maxFontSize);
          var textX = (308.5 + (type * 70)) + (35 - textWidth * text.fontSize() / 25) / 2; 
          var textY = 87.75 + (30 - textHeight * text.fontSize() / 25) / 2; 
          
          text.position({ x: textX, y: textY });
          if (type == 0) filterPosition = selectedItem
          addSmallCards(lastSearch);
        }
    });

    htmlElements.appendChild(ulElement);
}

function clearFilters(type){
    if (type == 0){
        filterNation = ""; 
        filterNationLogo.attrs.image = ""
    }
    if (type == 1) {
        filterClub = "";
        filterClubLogo.attrs.image = ""
    }
    if (type == 2) {
        filterPosition = "";
        filterPositionText.attrs.text = ""
    }
    BLSLayer.batchDraw();
    addSmallCards(lastSearch);
}


function createHTMLDiv() {
    var cardContainer = document.createElement('div');
    cardContainer.id = "scroll-players";
    cardContainer.classList.add('card-container');
    htmlElements.appendChild(cardContainer);
}

document.querySelector("#canvasContainer").addEventListener('mousedown', function(event) {
    if (htmlElements.contains(ulElement)) {
        htmlElements.removeChild(ulElement)
    }
});