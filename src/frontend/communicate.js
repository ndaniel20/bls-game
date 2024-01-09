var userAgent = navigator.userAgent

async function loadFile(jsonFile) {
    const url = jsonFile;
  
    var res = await fetch(url)
    var data = await res.json()
    return data
} 

async function getFileNames(){
  var res = await fetch("/fileNames", {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': userAgent,
    },
  })
  var data = await res.json()
  return data.names
}

async function updateJSONFile(path, data) {
    var res = await fetch(path, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'authorization': userToken,
        'Accept': 'application/json',
        'User-Agent': userAgent,
      },
      body: JSON.stringify(data),
    })
}

async function getUserData() {
  var res = await fetch("/get-userData", {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'authorization': userToken,
      'Accept': 'application/json',
      'User-Agent': userAgent,
    },
  })
  var data = await res.json()
  return data.data
}

async function upgradePlayer(id, perc, c) {
  var res = await fetch("/upgrade-player", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'authorization': userToken,
      'Accept': 'application/json',
      'User-Agent': userAgent,
    },
    body: JSON.stringify({id: id, perc: perc, c: c})
  })
  var data = await res.json()
  return data
}

async function buyPlayer(id) {
  var res = await fetch("/buy-player", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'authorization': userToken,
      'Accept': 'application/json',
      'User-Agent': userAgent,
    },
    body: JSON.stringify({id: id})
  })
  var data = await res.json()
  return data
}

async function sellPlayer(id, perc, c) {
  var res = await fetch("/sell-player", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'authorization': userToken,
      'Accept': 'application/json',
      'User-Agent': userAgent,
    },
    body: JSON.stringify({id: id, potInc: perc, c: c})
  })
  var data = await res.json()
  return data
}

async function addPlayer(obj) {
  var res = await fetch("/add-player", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'authorization': userToken,
      'Accept': 'application/json',
      'User-Agent': userAgent,
    },
    body: JSON.stringify(obj)
  })
  var data = await res.json()
  return data
}

async function removePlayer(obj) {
  var res = await fetch("/remove-player", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'authorization': userToken,
      'Accept': 'application/json',
      'User-Agent': userAgent,
    },
    body: JSON.stringify(obj)
  })
  var data = await res.json()
  return data
}

async function updateTactics(obj) {
  var res = await fetch("/update-tactics", {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'authorization': userToken,
      'Accept': 'application/json',
      'User-Agent': userAgent,
    },
    body: JSON.stringify(obj)
  })
  var data = await res.json()
  return data
}

async function createSeason(l){
  var res = await fetch("/create-season", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'authorization': userToken,
      'Accept': 'application/json',
      'User-Agent': userAgent,
    },
    body: JSON.stringify({league: l})
  })
  var data = await res.json()
  return data
}

async function deleteSeason(){
  var res = await fetch("/delete-season", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'authorization': userToken,
      'Accept': 'application/json',
      'User-Agent': userAgent,
    },
  })
  var data = await res.json()
  return data
}

async function getSeason(){
  var res = await fetch("/get-season", {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'authorization': userToken,
      'Accept': 'application/json',
      'User-Agent': userAgent,
    },
  })
  var data = await res.json()
  return data
}

async function getCoins(){
  var res = await fetch("/get-coins", {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'authorization': userToken,
      'Accept': 'application/json',
      'User-Agent': userAgent,
    },
  })
  var data = await res.json()
  return data
}

async function pauseMatch(){
  var res = await fetch(`/pause-game`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'authorization': userToken,
      'Accept': 'application/json',
      'User-Agent': userAgent,
    },
  });

  var data = await res.json()
  return data
}


async function resumeMatch(changes, time){
  var res = await fetch(`/resume-game`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'authorization': userToken,
      'Accept': 'application/json',
      'User-Agent': userAgent,
    },
    body: JSON.stringify({changes: changes, elapse: time})
  });

  var data = await res.json()
  return data
}