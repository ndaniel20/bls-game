const mongoose = require("mongoose");
var schema = new mongoose.Schema({}, { strict: false });
const playerDatas = mongoose.model("playerdatas", schema);
const tacticDatas = mongoose.model("tacticdatas", schema);
const clubDatas = mongoose.model("clubdatas", schema);
const userDatas = mongoose.model("userdatas", schema);
const leagueDatas = mongoose.model("leaguedatas", schema);

module.exports = {
  getAccount: async function (username, password) {
    try {
        var collection = await userDatas.findOne({ username: username, password: password })
        return collection?.token
    } catch (error) {
        console.error("Error finding userData:", error);
    }
  },
  storeImages: async function (buffer) {
    try {
        await imageDatas.findOneAndUpdate({}, { $push: { buffers: buffer } }, { upsert: true, new: true })
    } catch (error) {
        console.error("Error finding userData:", error);
    }
  },
  getImages: async function () {
    try {
        var data = await imageDatas.findOne({_id: "64b2b0dacdd12a54c4a85162"})
        return data
    } catch (error) {
        console.error("Error finding userData:", error);
    }
  },
  findElement: async function (token) {
    try {
        var data = await userDatas.findOne({ token: token})
        return data
    } catch (error) {
        console.error("Error finding userData:", error);
    }
  },
  addBalance: async function (token, data) {
    try {
        var newData = await userDatas.updateOne({ token: token},{ $inc: { coins: data } }, { upsert: true })
    } catch (error) {
        console.error("Error finding userData:", error);
    }
  },
  buyPlayer: async function (token, data) {
    try {
        var newData = await userDatas.updateOne({ token: token},{ $push: { players: data } }, { upsert: true })
    } catch (error) {
        console.error("Error finding userData:", error);
    }
  },
  addPlayer: async function (token, data) {
    try {
        await userDatas.updateOne({ token: token },{ $set: { "players.$[elem].inSquad": true } },{ arrayFilters: [{ "elem.c": data }] },);
    } catch (error) {
        console.error("Error finding userData:", error);
    }
  },
  removePlayer: async function (token, data) {
    try {
        await userDatas.updateOne({ token: token },{ $set: { "players.$[elem].inSquad": false } },{ arrayFilters: [{ "elem.c": data }] },);
    } catch (error) {
        console.error("Error finding userData:", error);
    }
  },
  setPlayers: async function (token, data) {
    try {
        await userDatas.updateOne({ token: token}, { $set: { players: data } })
    } catch (error) {
        console.error("Error finding userData:", error);
    }
  },
  setTactics: async function (token, data) {
    try {
        await userDatas.updateOne({ token: token}, { $set: { tactics: data } })
    } catch (error) {
        console.error("Error finding userData:", error);
    }
  },
  kickPlayer: async function (token, data) {
    try {
      await userDatas.updateOne({ token: token}, { $set: { 'tactics.startingXI': data } })
    } catch (error) {
        console.error("Error finding userData:", error);
    }
  },
  getTeamName: async function (token, data) {
    try {
      var info = await userDatas.findOne({ token: token})
      return info.teamName
    } catch (error) {
        console.error("Error finding userData:", error);
    }
  },
  setSeason: async function (token, data) {
    try {
        await leagueDatas.updateOne({ token: token}, { $set: data }, { upsert: true })
    } catch (error) {
        console.error("Error updating season data:", error);
    }
  },
  deleteSeason: async function (token, data) {
    try {
        var oldLeague = await leagueDatas.deleteOne({ token: token})
        return oldLeague
    } catch (error) {
        console.error("Error updating season data:", error);
    }
  },
  getSeason: async function (token, data) {
    try {
        var league = await leagueDatas.findOne({ token: token})
        return league
    } catch (error) {
        console.error("Error updating season data:", error);
    }
  },
  setFixture: async function(token, matchday, arr){
    try {
        var f = await leagueDatas.findOneAndUpdate({ token: token}, { $set: { [`fixtures.${matchday}`]: arr } }, {new: true})
        return f.fixtures
    } catch (error) {
        console.error("Error updating season data:", error);
    }
  },
  addMatchday: async function(token){
    try {
        var mtch = await leagueDatas.findOneAndUpdate({ token: token}, { $inc: { matchday: 1 } }, {new: true})
        return mtch.matchday
    } catch (error) {
        console.error("Error updating season data:", error);
    }
  },
  setDatabase: async function(data){
    try {
        await playerDatas.deleteMany({});
        var r = await playerDatas.insertMany(data)
        return r
    } catch (error) {
        console.error("Error updating season data:", error);
    }
  },
  setConfigurations: async function(data){
    try {
        await tacticDatas.deleteMany({});
        var r = await tacticDatas.insertMany(data)
        return r
    } catch (error) {
        console.error("Error updating season data:", error);
    }
  },
  setClubs: async function(data){
    try {
        await clubDatas.deleteMany({});
        var r = await clubDatas.insertMany(data)
        return r
    } catch (error) {
        console.error("Error updating season data:", error);
    }
  }
};
