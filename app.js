const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

//get team Deatails
app.get('/players/', async (request, response) => {
  const cricketTeam = `
  SELECT 
    *
  FROM
    cricket_team`
  const playerArray = await db.all(cricketTeam)
  const ans = playerList => {
    return {
      playerId: playerList.player_id,
      playerName: playerList.player_name,
      jerseyNumber: playerList.jersey_number,
      role: playerList.role,
    }
  }
  response.send(playerArray.map(eachPlayer => ans(eachPlayer)))
})

//create a playerdetails
app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayer = `
  INSERT INTO 
    cricket_team (player_name,jersey_number,role)
  VALUES (
        '${playerName}',
        ${jerseyNumber},
        '${role}'
  );`
  await db.run(addPlayer)
  response.send('Player Added to Team')
})

//Required player details
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerId = `
  SELECT 
    * 
  FROM 
    cricket_team
  WHERE 
    player_id=${playerId};`
  const playerObject = await db.get(getPlayerId)
  const ans = playerList => {
    return {
      playerId: playerList.player_id,
      playerName: playerList.player_name,
      jerseyNumber: playerList.jersey_number,
      role: playerList.role,
    }
  }
  response.send(ans(playerObject))
})

//update player details
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetail = request.body
  const {playerName, jerseyNumber, role} = playerDetail
  const updatePlayerDetails = `
  UPDATE 
    cricket_team 
  SET
    player_name='${playerName}',
    jersey_number= ${jerseyNumber},
    role= '${role}'
  WHERE 
    player_id=${playerId};`
  await db.run(updatePlayerDetails)
  response.send('Player Details Updated')
})

//delete player
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
  DELETE FROM 
    cricket_team
  WHERE 
    player_id=${playerId}`
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
