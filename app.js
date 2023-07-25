const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const app = express();
app.use(express.json());
const path = require("path");

let db = null;
const pathFix = path.join(__dirname, "covid19India.db");
const conArray = async () => {
  try {
    db = await open({
      filename: pathFix,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("This Server running at http://localhost:3001");
    });
  } catch (e) {
    console.log(`DB ERROR ${e.message}`);
  }
};

conArray();

const Convert = (obj) => {
  return {
    stateId: obj.state_id,
    stateName: obj.state_name,
    population: obj.population,
  };
};

//get all states
app.get("/states/", async (request, response) => {
  const getStates = `
    SELECT
    *
    FROM
    state;`;
  const AllStates = await db.all(getStates);
  response.send(AllStates.map((each) => Convert(each)));
});

//get states based on ID
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getState = `
    SELECT
    *
    FROM
    state
    WHERE 
    state_id=${stateId};`;
  const Stat = await db.get(getState);
  response.send(Convert(Stat));
});

//create a district in dist table
app.post("/districts/", async (request, response) => {
  const req = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = req;
  const CreateDist = `
  INSERT INTO
  district (district_name,state_id,cases,cured,active,deaths)
  VALUES 
  ('${districtName}',
  ${stateId},
  ${cases},
  ${cured},
  ${active},
  ${deaths});
  `;
  await db.run(CreateDist);
  response.send("District Successfully Added");
});

//get dist based on ID

const Con = (obj) => {
  return {
    districtId: obj.district_id,
    districtName: obj.district_name,
    stateId: obj.state_id,
    cases: obj.cases,
    cured: obj.cases,
    active: obj.active,
    deaths: obj.deaths,
  };
};

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDist = `
    SELECT
    *
    FROM
    district
    WHERE 
    district_id=${districtId};`;
  const Dist = await db.get(getDist);
  response.send(Con(Dist));
});

//delete dist based on ID
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const delDist = `
  DELETE
  FROM
  district
  WHERE 
  district_id=${districtId};`;
  await db.run(delDist);
  response.send("District Removed");
});

//updates dist details based on ID
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const req = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = req;
  const updateDist = `
  UPDATE
  district
  SET
  district_name='${districtName}',
  state_id=${stateId},
  cases=${cases},
  cured=${cured},
  active=${active},
  deaths=${deaths}
  WHERE
  district_id=${districtId};
  `;
  await db.run(updateDist);
  response.send("District Details Updated");
});

//get cases,cured,active,deaths based on stateID

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const stateDETails = `
    SELECT 
    SUM(cases) as totalCases,
    SUM(cured) as totalCured,
    SUM(active) as totalActive,
    SUM(deaths) as totalDeaths
    FROM
    state LEFT JOIN district 
    ON state.state_id=district.district_id
    WHERE 
    district_id=${stateId};
    `;
  const stateDET = await db.get(stateDETails);
  response.send(stateDET);
});

//get dist details based on ID

const con = (obj) => {
  return { stateName: obj.state_name };
};

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const staTails = `
    SELECT state_name
    FROM
    state LEFT JOIN district ON state.state_id=district.state_id
    WHERE 
    district_id=${districtId};
    `;
  const stateN = await db.get(staTails);
  response.send(con(stateN));
});

module.exports = app;
