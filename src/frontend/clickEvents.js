async function hearClicks(type){
    var totalCount = 0;
    stage.children.filter(e=>e.visible).forEach(function(layer) {layer.children.filter(e=>e.children).forEach(e=>totalCount += e.children.length);});
    console.log(type + ' - ' + totalCount)

    if (type == "up_arrow") scrollUp();
    else if (type == "bottom_arrow") scrollDown();
    else if (type == "squad_sort") squadSort();
    else if (type == "rating_sort") ratingSort();
    else if (type == "change_view") changeView();
    else if (type == "change_formation") formationGroup.visible(true);
    else if (type == "exit_formation") formationGroup.visible(false);
    else if (type == "filter_players_0") showSearchMenu(countries, 0);
    else if (type == "filter_players_1") showSearchMenu(clubsList, 1);
    else if (type == "filter_players_2") showDropMenu(positionList, filterPositionText, 0);
    else if (type == "filter_players_3") checkBoxStar();
    else if (type == "search_view") changePreview();
    else if (type == "back_page") backPage();
    else if (type == "next_page") nextPage();
    else if (type == "back_page2") backPage2();
    else if (type == "next_page2") nextPage2();
    else if (type == "next_club") drawKickOff(1, 0);
    else if (type == "previous_club") drawKickOff(-1, 0);
    else if (type == "next_league") drawKickOff(null, 1);
    else if (type == "previous_league") drawKickOff(null, -1);
    else if (type.startsWith("clear_filters")) clearFilters(type.split("_").pop())
    else if (type.startsWith("item")) {
        BLSPage = parseInt(type.split("").pop())
        checkPages(true);
        drawTabs();
    }
    else if (type.startsWith("squad_tabs")) {
        squadTab[BLSPage] = type.split("_").pop();
        checkPages();
        checkLayer();
        drawTabs();
    }
    else if (type.startsWith("set_formation")){
        formationGroup.visible(false);
        formation = type.split("_").pop();
        formationText.text(formation.split("").join("-"));
        formationText.x(790 - formationText.width() / 2);
        checkTactics(getTactics());
        drawLineup();
        shapeTactic1();
    }
    else if (type.startsWith("switch_defence")){
        var tactics = [["Drop Back", "Balanced Pressure", "Constant Pressure"], ["Zonal Marking", "Man Marking"], ["True", "False"], ["true", "false"]]
        var pointer = type.split("_")[2]
        var tactic = type.split("_")[3]
        var tacticArray = tactics.find(arr => arr.includes(tactic));
        var point = tactics.indexOf(tacticArray)
        var index = tacticArray.indexOf(tactic);
        pointer == 1 ? index -= 1 : index += 1
        if (index >= tacticArray.length) index = 0
        if (index < 0) index = tacticArray.length -1
        var nextTactic = tacticArray[index]
        
        if (nextTactic == "True" || nextTactic == "true") nextTactic = true
        else if (nextTactic == "False" || nextTactic == "false") nextTactic = false
        
        if (point == 0) pressureTactic = nextTactic
        if (point == 1) markingTactic = nextTactic
        if (point == 2) timeWasting = nextTactic
        if (point == 3) offsideTrap = nextTactic
        checkTactics(getTactics());
        defensiveTactic1(point);
    }
    else if (type.startsWith("switch_attack")){
        var tactics = [["Long Ball", "Possession", "Direct Passing", 'Wing Play'], ["Slow", "Medium", "Fast"], ["5", "6", "7", "8", "9", "10"], ["Defensive Full-Back", "Full-Back", "Inverted Wing-Back", "Wing-Back"]]
        var pointer = type.split("_")[2]
        var tactic = type.split("_")[3]
        var tacticArray = tactics.find(arr => arr.includes(tactic));
        var point = tactics.indexOf(tacticArray)
        var index = tacticArray.indexOf(tactic);
        pointer == 1 ? index -= 1 : index += 1
        if (index >= tacticArray.length) index = 0
        if (index < 0) index = tacticArray.length -1
        var nextTactic = tacticArray[index]
        
        if (point == 0) offensiveTactic = nextTactic
        if (point == 1) transitionTactic = nextTactic
        if (point == 2) cornerTactic = nextTactic
        if (point == 3) fullbackTactic = nextTactic
        checkTactics(getTactics());
        offensiveTactic1(point);
    }
    else if (type.startsWith("add_tosquad")){
        var r1 = type.split("_")[2]
        var r2 = type.split("_")[3]
        var r3 = type.split("_")[4]
        var obj = {id: r1, potInc: r2, c: r3}
        var res = await addPlayer(obj)
        if (res.error) return;
        playersSquad = getFullPlayers(res.players)
        sortFeature = ""
        checkTactics(getTactics());
        squadSort()
        showSquad(lastSearch)
        drawList();
        drawLineup();
    }
    else if (type.startsWith("remove_fromsquad")){
        var r1 = type.split("_")[2]
        var r2 = type.split("_")[3]
        var r3 = type.split("_")[4]
        var obj = {id: r1, potInc: r2, c: r3}
        var res = await removePlayer(obj)
        if (res.error) return;
        playersSquad = res.players.filter(e=>e.inSquad == true)
        startingPlayers.forEach((e, n)=>{
            if (!playersSquad.map(p=>p?.c).includes(e?.c)) startingPlayers[n] = null
        })
        playersSquad = getFullPlayers(playersSquad)
        sortFeature = ""
        checkTactics(getTactics());
        squadSort()
        showSquad(lastSearch)
        drawList();
        drawLineup();
        drawStats();
    }
    else if (type.startsWith("select_player")){
        playerGroup.visible(true)
        var r1 = type.split("_")[2]
        playerPreview(r1);
    }
    else if (type == "back_to_squad") {
        playerGroup.destroyChildren();
        playerGroup.visible(false)
        // ** ADMIN **
        if (isAdmin && !playerGroup.c){
            var data = findPlayer(playerGroup.playerID)
            await updateJSONFile('/update-json', data);
        }
        // ***********
        checkPages();
    }
    else if (type == "search_player") {
        lastSearch = textInput.value
        addSmallCards(lastSearch)
    }
    else if (type == "search_player2") {
        lastSearch = textInput.value
        showSquad(lastSearch)
    }
    else if (type == "open_upgradePage") openUpgradePage(playerGroup.c, playerGroup.perc);
    else if (type == "open_buyPage") openBuyPage(playerGroup.playerID)
    else if (type == "open_sellPage") openSellPage(playerGroup.c)
    else if (type == "buy_player"){
        var id = playerGroup.playerID
        var res = await buyPlayer(id)
        if (res.error) return;
        babaCoins -= res.value
        fullSquad = getFullPlayers(res.players)
        playerGroup.destroyChildren();
        addSmallCards(lastSearch)
        checkPages();
        showSquad("");
        drawList();
        drawLineup();
    }
    else if (type == "sell_player"){
        var id = playerGroup.playerID
        var perc = playerGroup.perc
        var c = playerGroup.c
        var res = await sellPlayer(id, parseFloat(perc), c)
        if (res.error) return;
        babaCoins += res.value
        fullSquad = getFullPlayers(res.players)
        playersSquad = fullSquad.filter(e=>e.inSquad)
        startingPlayers.forEach((e, n)=>{
            if (!playersSquad.map(p=>p?.c).includes(e?.c)) startingPlayers[n] = null
        })
        playerGroup.destroyChildren();
        sortFeature = ""
        checkTactics(getTactics());
        squadSort()
        showSquad(lastSearch)
        drawList();
        drawLineup();
        drawStats();
    }
    else if (type == "upgrade_player"){
        var perc = playerGroup.perc
        var id = playerGroup.playerID
        var c = playerGroup.c
        var data = await upgradePlayer(id, perc, c)
        if (data.error) return
        powerUps -= data.value
        fullSquad = getFullPlayers(data.players)
        playersSquad = fullSquad.filter(e=>e.inSquad)
        playerGroup.destroyChildren();
        sortFeature = ""
        squadSort()
        showSquad(lastSearch)
        playerPreview(c)
        drawList();
        drawLineup();
        drawStats();
    }
    else if (type.startsWith("config_")){
        var config = type.split("_")
        var id = playerGroup.playerID
        var stat = config[1]
        var sub = config[2]
        var player = findPlayer(id)
        var positions = ["LB", "CB", "RB", "LWB", "DM", "RWB", "LM", "CM", "RM", "LW", "AM", "RW", "ST"]
        if (stat == "rating"){
            var num = player.rating
            var diff = player.potential - player.rating
            player.rating = sub == "plus" ? (parseInt(num) + 1).toString() : (parseInt(num) - 1).toString()
            player.potential = parseInt(player.rating) + diff
        }
        else if (positions.includes(stat)){
            if (player.primaryPositions.includes(stat)) player.primaryPositions.splice(player.primaryPositions.indexOf(stat), 1)
            if (player.secondaryPositions.includes(stat)) player.secondaryPositions.splice(player.secondaryPositions.indexOf(stat), 1)
            if (sub == 2){
                player.primaryPositions.push(stat)
            }
            if (sub == 1){
                player.secondaryPositions.push(stat)
            }
        }else{
            var num = player.stats[stat]
            player.stats[stat] = sub == "plus" ? (parseInt(num) + 1).toString() : (parseInt(num) - 1).toString()
        }
        playerPreview(id)
    }
    else if (type.startsWith(`openMatch_`)){
        var num = type.split("_").pop()
        createGame(cachedMatches[num]);
    }
    else if (type == "start_kickoff_match" && !lockedKickOff){
        lockedKickOff = true
        const eventSource = new EventSource(`/simulate-kickOff?token=${userToken}&opponent=${selectedClubName}`);
        var t = 0
        eventSource.onmessage = function (event) {
            t++
            const data = JSON.parse(event.data);
            createGame(data)
            if (data.time == "FT") {
                lockedKickOff = false
                eventSource.close();
            }
        };

        eventSource.onerror = function (error) {
            lockedKickOff = false
            eventSource.close();
        };
    }
    else if (type == "start_seasons_match" && !lockedSeasonsPlay){
        lockedSeasonsPlay = true
        const eventSource = new EventSource(`/simulate-myMatch?token=${userToken}`);
        var t = 0
        eventSource.onmessage = async function (event) {
            t++
            const data = JSON.parse(event.data);
            if (!data.done) ;//createGame(data)
            else {
                eventSource.close();
                seasonsData = await getSeason();
                if (seasonsData.league == "Champions League") drawTournamentMatchday();
                else drawSeasonMatchday(seasonsData.league)
                lockedSeasonsPlay = false
                var res = await getCoins()
                babaCoins = res.data
                menuPage();
            }
        };

        eventSource.onerror = function (error) {
            lockedSeasonsPlay = false
            eventSource.close();
        };
    }
    else if (type == "delete_season") {
        var res = await deleteSeason();
        if (!res.deleted) return;
        seasonsData = await getSeason();
        seasonsGroup.children.forEach(e=>e.destroyChildren());
        isSeasonsOpen = false
        squadTab[0] = "game menu"
        checkLayer();
        drawTabs();
    }
    else if (type == "gameSelection_1") {
        if (!isKickOffOpen) kickOffSelection();
        else{
            squadTab[BLSPage] = "kick off"
            checkLayer()
            drawTabs();
        }
    }
    else if (type == "gameSelection_2") {
        if (!isSeasonsOpen && isSeasonsPopUpOpen) {
            var data = await createSeason(leaguesName[seasonsMenuPage])
            if (data.error) return;
            seasonsData = data
            isSeasonsPopUpOpen = false;
            seasonsMenuPage = 0;
            seasonsSelection();
        }
        else if (!seasonsData && !isSeasonsPopUpOpen){
            openPopUpSeasons();
        }
        else if (seasonsGroup.visible() == false && isSeasonsOpen){
            squadTab[BLSPage] = "seasons"
            checkLayer();
            drawTabs();
        }
        else {
            seasonsSelection();
        }
    }
}
