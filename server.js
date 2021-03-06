const express = require("express");
const cors = require("cors");
const app = express();
const mysql = require("mysql");
const openid = require("openid");
const path = require("path");
const request = require("request");


const apiKey = "BD496BFA7696FD5DE7D3FF190B371B1B";

//Mysql database
const connection = mysql.createPool({
    host:"localhost",
    user:"skidi",
    password:"mercury88",
    database:"dota2inventory"
});


//OpenID settings
const relyingParty = new openid.RelyingParty(
    "https://Dota2Inventory.com/verify",
    "https://Dota2Inventory.com",
    true,
    true,
    []
);

//Cross origin settings
app.use(cors({
    'allowedHeaders': ['sessionId', 'Content-Type'],
    'exposedHeaders': ['sessionId'],
    'origin': '*',
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'preflightContinue': false
}));

app.use(express.static(path.join(__dirname, 'dist')));

//Authenticate OpenId
app.get("/auth", (req, res) => {    
    relyingParty.authenticate('https://steamcommunity.com/openid', false, (err, authUrl)=>{
        if(err){
            console.log(err);
            res.write("Authentication failed: " + err);
        }
        if(!authUrl){
            res.write("AUthentication failed.");
        }
        else{
            res.writeHead(301, {"location": authUrl});
        }
        res.end();
    })
});

//Verify OpenId
app.get("/verify", (req, res) => {
    relyingParty.verifyAssertion(req, (err, result)=> {
        if(err){
            console.log(err);
            res.end("error.");
        }
        else if(!result || !result.authenticated) {
            res.end("failed to authenticate.");
        }
        else {
           steamId = result.claimedIdentifier.replace('https://steamcommunity.com/openid/id/', '');           
           res.redirect('/'+ steamId);
        }
    })
})

//retrieve dota2items from mysql DB
app.get("/mysql", (req, res) => {
    let sanitized = parseInt(req.query.itemIndex);
    connection.query("Select * from dota2items WHERE id = " + sanitized, (err, result)=>{
        if(err) throw err;
        res.send(result);               
    });          
})

app.get("/getDetails", (req, res) => {
    let steamId = req.query.steamId;
    let url = "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=" + apiKey + "&steamids=" + steamId;
    request({
        uri: url
    }, (err, resp, body)=> {
        if (!err && resp.statusCode === 200) {
            res.send(body);
          } else {
            res.json(err);
          }
    })

});
app.get("/getInventory", (req, res) => {
    let steamId = req.query.steamId;
    let url = "http://api.steampowered.com/IEconItems_570/GetPlayerItems/v0001/?key=" + apiKey + "&steamid=" + steamId;
    request({
        uri: url
    }, (err, resp, body)=> {
        if (!err && resp.statusCode === 200) {
            res.send(body);
          } else {
            res.json(err);
          }
    })

});
app.get("/getFriendList", (req, res) => {
    let steamId = req.query.steamId;
    let url = "http://api.steampowered.com/ISteamUser/GetFriendList/v1/?key=" + apiKey + "&steamid=" + steamId;
    request({
        uri: url
    }, (err, resp, body)=> {
        if (!err && resp.statusCode === 200) {
            res.send(body);
          } else {
            res.json(err);
          }
    })

});

//check items that contain string
app.get("/checkString", (req, res)=> {  
    let escaped = req.query.itemString.replace(/[^\w\s]/g, '');
            
    connection.query("Select * from dota2items WHERE name LIKE " + "'%" + escaped + "%'", (err, response) => {
        if(err) throw err;
        res.send(response);
    });    
    
})

app.get("*", (req, res)=> {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
})


//create server;
const port = 3000;
app.listen(port, () => console.log("Node server running on port: " + port));