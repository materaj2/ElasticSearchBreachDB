const express = require('express');
const app = express();
const elasticsearch= require('elasticsearch');
const path = require('path');
fs = require('fs');
const port = 5555;

app.use(express.static(path.join(__dirname, 'public')));

const client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'error',
    apiVersion: '7.2', // use the same version of your Elasticsearch instance
});

const checkSearchSize = (searchSize, res) => {
    if (searchSize == 5 || searchSize == 100 || searchSize == 10000) {
        return true;
    }
    res.send('<h1>Error. Size must be 5, 100, or 10000.</h1>');
    return false;
}

const checkInputSize = (input, res) => {
  if (input.length > 100 || input.length <= 0) {
    res.send('RANGE-ERROR');
    console.log('FAILED');
    return false;
  }
  return true;
};

async function queryByEmail(email, searchSize) {
   let answer = '';
   let jsonFile = '';
    const response = await client.search({
        index: 'breach*',
        type: '_doc',
        body: {
          size: searchSize,
          query: {
            match_phrase_prefix: {
              "Email" : email
            }
          }
        }
      })

      for (const document of response.hits.hits) {
       // console.log(document["_source"]["Password"]);
        document["_source"]["Password"] = "Replaced for DEMO";
        jsonFile += JSON.stringify(document) + '\n';
      }
      answer = response.hits.hits;
      //console.log("HITS: " + response.hits.hits.length);
      fs.writeFile('JSONResults.txt', jsonFile, function (err) {
        if (err) return console.log(err);
      });
      return answer;
}

async function queryByUsername(username, searchSize) {
    let answer = '';
     const response = await client.search({
         index: 'breach*',
         type: '_doc',
         body: {
           size: searchSize,
           query: {
             match: {
               "Username" : username
             }
           }
         }
       })

       console.log('RESPONSE: ' + JSON.stringify(response.hits.hits));
 
       for (const document of response.hits.hits) {
         //console.log('Hitttttt: ', document);
         //console.log(document["_source"]["Password"]);
         document["_source"]["Password"] = "Replaced for DEMO";
       }
       answer = response.hits.hits;
       console.log("HITS: " + response.hits.hits.length);
       return answer;
 }

 async function queryByIP(ip, searchSize) {
    let answer = '';
     const response = await client.search({
         index: 'breach*',
         type: '_doc',
         body: {
           size: searchSize,
           query: {
             match: {
               "IP Address" : ip
             }
           }
         }
       })
 
       for (const document of response.hits.hits) {
         //console.log('Hit: ', document);
         //console.log(document["_source"]["Password"]);
         document["_source"]["Password"] = "Replaced for DEMO";
        // answer += JSON.stringify(document) + "\n";
       }
       answer = response.hits.hits;
       console.log("HITS: " + response.hits.hits.length);
       return answer;
 }

app.get('/queryByEmail', async (req, res) => {
    let email = req.query.email;
    let size = req.query.size;
    if (checkSearchSize(size, res) && checkInputSize(email, res)) {
        let esResponse = await queryByEmail(email, size);
        res.send(esResponse);
    }
});

app.get('/queryByUsername', async (req, res) => {
    let username = req.query.username;
    let size = req.query.size;
    if (checkSearchSize(size, res) && checkInputSize(username, res)) {
      let esResponse = await queryByUsername(username, size);
      res.send(esResponse);
    }
});

app.get('/downloadJSON', (req, res) => {
    console.log(__dirname + "\\" + "JSONResults.txt");
    res.sendFile(path.join(__dirname, "JSONResults.txt"));
});

app.get('/queryByIP', async (req, res) => {
    let ip = req.query.ip;
    let size = req.query.size;
    if (checkSearchSize(size, res) && checkInputSize(ip, res)) {
        let esResponse = await queryByIP(ip, size);
        res.send(esResponse);
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
});