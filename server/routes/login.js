const profileInfo = require("../classes/profileInfo.js");
const ProfileInfo = profileInfo.ProfileInfo;
const express = require('express');
const con = require("../index.js").con;
const router = express.Router();
const secret = require("../constants/secret.js").secret;

router.get("/login", (req, res) => {
    const login    = req.query.login;
    const password = req.query.password; 
    const queryStr = `select * from user_profile where login='${login}' and password='${password}';`;
    con.query(queryStr, (err, rows) => {
        if(err) {
            // console.log("Error: ", err.sqlMessage);
            return res.status(400).json({message: "Smth wrong"});
        }
        
        if(rows.length === 0) {
            return res.status(400).json({ message: "Wrong login or password"}); // change this message to constant message
        }

        const result = new ProfileInfo( 
            rows[0].id,
            rows[0].name, 
            rows[0].surname,
            rows[0].birthday,
            rows[0].photo,
            rows[0].date_of_reg,
            rows[0].email
        );

        res.json(result);
    })
})

module.exports.loginRouter = router;