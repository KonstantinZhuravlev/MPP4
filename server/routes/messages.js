const profileTableName = require("../constants/db.js").profileTableName;
const express = require("express");
const con = require("../index.js").con;
const messagePool = require("../classes/messagePool").msgPool;
const Response = require("../classes/Response.js").Response;
const messagesTableName = require("../constants/db.js").messagesTableName;
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const secret = require("../constants/secret.js").secret;
const cors = require("cors");

const messagesRouter = express.Router();
// messagesRouter.use(cors());
messagesRouter.use(cookieParser());
let lastMessageIndex;

con.query(`select count(*) as count from ${messagesTableName}`, (error, rows) => {
    lastMessageIndex = rows[0].count;
});

messagesRouter.post("/chat/messages/send", addHeaders, validateToken, (req, res) => {
    const message = req.query.msg;
    const id = parseInt(req.query.id);
    const insertQuery = `
        insert into ${messagesTableName}(text, file, source) values(?,?,?)`;

    con.query(insertQuery, [message, null, id], (error, rows) => {
        if(error){
            throw new Error(error.message);
        }

        if(rows.affectedRows !== 1) return res.status(500).json("internal error");

        ++lastMessageIndex;

        messagePool.push({
            index: lastMessageIndex,
            text: message,
            sender: {
                name: req.query.name,
                surname: req.query.surname
            },
            img: null,
        })

        return res.json(req.query);
    })

});

messagesRouter.get("/chat/messages", addHeaders, validateToken, (req, res) => {
    if(!req.query.msgIndex) return res.status(400).json(new Response("msgIndex must be defined!"))
    
    const messageIndex = parseInt(req.query.msgIndex);
    let requiredMessages = [];
    if(messageIndex !== 0) {
        requiredMessages = messagePool.getMessages(messageIndex);
    }

    return res.json(new Response("", {last_index: lastMessageIndex, messages: requiredMessages}));
});

module.exports.messagesRouter = messagesRouter;

function validateToken(req, res, next){
    const token = req.cookies.token;
    
    if(!token) return res.sendStatus(401);

    jwt.verify(token, secret, (err, user) => {
        if(err) return res.sendStatus(401);

        req.user = user;
        next(); 
    })
}

function addHeaders(req, res, next){
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();   
}
