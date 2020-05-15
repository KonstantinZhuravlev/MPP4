const profileTableName = require("../constants/db.js").profileTableName;
const express = require("express");
const registrationRouter = express.Router();
const con     = require("../index.js").con;
const multer  = require("multer");
const storage = require("../index.js").storage;
const upload  = multer({ storage: storage }).single('file');

registrationRouter.post("/registrate", async (req, res) => {
    checkIfLoginExists(con, req, res, createUserProfile);
})

createUserProfile = (con, req, res) => {
    upload(req, res, (err) => {

        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
        } else if (err) {
            return res.status(500).json(err)
        }

        const profileInfo = req.query;
        const profileImage = req.file;
        const regDate = new Date();
        const regDateStr = regDate.getFullYear()+'-'+regDate.getMonth()+'-'+regDate.getDay();
        const queryStr = `INSERT INTO ${ profileTableName } 
            (login, password, name, surname, email, birthday, date_of_reg, photo)
            VALUES(?,?,?,?,?,?,?,?);`;

        con.query(queryStr, [profileInfo.login, profileInfo.password,profileInfo.name, profileInfo.surname, profileInfo.email,
            profileInfo.birthday, regDateStr, profileImage.buffer],(err, rows) => {
            if(err) throw err;

            if(rows.affectedRows > 0){
                return res.status(200).json({ result: req.file });
            }
            else {
                return res.status(500).json({message: "Opps. Internal error was occured. Server is not working"});
            }
        })
    })
}

checkIfLoginExists = (con, req, res, callBack) => {
    const queryStr = `select * from ${ profileTableName }
    where login='${ req.query.login }';`
    con.query(queryStr, (err, rows) => {
        if(err) throw err;

        if(rows.length > 0){
            return res.status(400).json({ message: "This login is used by another user" });
        }

        callBack(con, req, res);
    })
}

module.exports.registrationRouter = registrationRouter;