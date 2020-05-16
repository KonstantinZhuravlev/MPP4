const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const logger = require("morgan");
const mysql = require('mysql');
const multer = require("multer");
const messagesTableName = require("./constants/db").messagesTableName;
const usersDialogsTableName = require("./constants/db").usersDialogsTableName;
const dialogsTableName = require("./constants/db").dialogsTableName;
const profileInfo = require("./classes/profileInfo.js");
const ProfileInfo = profileInfo.ProfileInfo;
const profileTableName = require("./constants/db.js").profileTableName;
const messagePool = require("./classes/messagePool").msgPool;
const OnlineUser = require('./classes/OnlineUser').onlineUser
const GLOBAL = 1;

const app = express();

const http = require("http").createServer(app);

const io = require("socket.io")(http);

io.on("connection", newConnection);

const dbName = 'YChat';

const whiteList = [
  "http://localhost:3000"
]

const corsOption = {
	origin: function(origin, cb){
		if(whiteList.indexOf(origin) !== -1){
			cb(null, true);
		} else {
			cb(new Error("Not allowed by cors"));
		}
	},
};

app.use(cors(corsOption));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'QAZWSXEDC',
  database: dbName,
  multipleStatements: true
});

connection.connect((error) => {
  if (error) throw error;
  console.log('Connection with database was established!');
});

let allUsers = [];

connection.query(`select * from ${profileTableName}`, (err, rows) => {
  if(err) throw err
  allUsers = rows
})

let lastMessageIndex = 0;

// connection.query(`select count(*) as count from ${messagesTableName}`, (error, rows) => {
//   lastMessageIndex = rows[0].count;
// });

module.exports.con = connection;

const loginRouter = require('./routes/login.js').loginRouter;
const registrateRouter = require('./routes/registrate.js').registrationRouter;
const messagesRouter = require('./routes/messages.js').messagesRouter;

app.use(logger('dev'));
app.use(loginRouter);
app.use(registrateRouter);
app.use(messagesRouter);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname )
    }
})

module.exports.storage = storage;

const port = process.env.PORT || 3005;
let onlineUsers = [];

// onlineUsers.push(new OnlineUser("eLuMMlOWT-nGSuWmAAAF", new ProfileInfo(100,"test","test","test","test","test","test","test")))
// onlineUsers.push(new OnlineUser("gRFYup4meNhf1xmOAAAN", new ProfileInfo(101,"test2","test2","test2","test2","test2","test2","test2")))

module.exports.app = app;

function newConnection(socket){
  console.log(`New connection: ${socket.id}`);
  console.log("________________________________________")
  socket.emit("r_socket_id", {
    socketId: socket.id
  })

// ****************************************************************************************************************  

  // socket.on("new_message", (data) => {
  //   // const insertQuery = `
  //       // insert into ${messagesTableName}(text, file, source) values(?,?,?)`;
  //   // messagePool.push({
  //   //   index: lastMessageIndex,
  //   //   text: data.message,
  //   //   sender: {
  //   //       name: data.name,
  //   //       surname: data.surname
  //   //   },
  //   //   img: null,
  //   // })

  //   socket.broadcast.emit()

  // });
// ****************************************************************************************************************  

  function getDialogCompanionsInfo(destId, srcId, message, callBack){
    const getAllCompanionsIdsQuery = `select user_id from ${usersDialogsTableName} where dialog_id=? and user_id<>?`
    connection.query(getAllCompanionsIdsQuery, [destId, srcId], (err, rows) => {
      if(err) throw err

      if(rows.length !== 0){
        callBack(rows, message);
      }
    })
  }

  function getAllConnectedSockets(){
    const sockets = io.sockets.sockets
    const connectedSockets = []
    for (socketId in sockets){
      const socket = sockets[socketId]
      connectedSockets.push(socket)
    }

    return connectedSockets;
  }


  function sendInviteToDialogNotification(data){
    const userId = data.userId
    const dialogId = data.dialogId
    const sockets = getAllConnectedSockets()

    const userProfile = onlineUsers.filter(user => {
      return user.profileInfo.id === userId
    })[0]

    const userSocket = sockets.filter((socket) => socket.id === userProfile.socketId)[0]
    
    connection.query(`select * from ${dialogsTableName} where id=?`, [dialogId], async (err, rows) => {
      if(err) throw err

      const dialog = rows[0]
      dialog.members = []

      const getUsersInDialogQuery = `select * from ${usersDialogsTableName} where dialog_id=?`
      await getUsersInDialog(connection, getUsersInDialogQuery, {dialogId: dialogId})
      .then(res => {
        res.forEach((item) => {
          const dialogMember = allUsers.filter((user) => {
            return user.id === item.user_id
          })[0]
  
          dialog.members.push({id: dialogMember.id})
        })
        
      })
      
      io.sockets.emit("invited_to_dialog", dialog)
    })
  }

  function checkIfUserIsInDestinations(destinationIds, user){
    let result = false;
    destinationIds.forEach((dest) => {
      
      if(dest.user_id === user.profileInfo.id)
        result = true
    })

    return result
  }

  function checkIfSocketIsInDestinations(socket, usersProfiles){
    let result = false
    usersProfiles.forEach((user) => {
      if(user.socketId === socket.id){
        result = true;
      }
    })

    return result;
  }

  function sendMessageToSpecifiedDestination(destinationIds, message){
    const connectedSockets = getAllConnectedSockets()

    const requiredUsersProfiles = onlineUsers.filter((user) => {
      return checkIfUserIsInDestinations(destinationIds, user)
    })

    const requiredSockets = connectedSockets.filter((socket) => {
      return checkIfSocketIsInDestinations(socket, requiredUsersProfiles)
    })


    requiredSockets.forEach((socket) => {
      socket.emit("r_message", message)
    })
    // connectedSockets.forEach((socket) => {
    //   if(socket.id ===)
    // })
  }

  function regUserInGlobalDialog(login){
    getUsersIdQuery = `select id from ${profileTableName} where login=?`
    connection.query(getUsersIdQuery, [login], (err, rows) => {
      if(err) throw err

      const user_id = rows[0].id
      const regUserInGlobalDialogQuery = `insert into ${usersDialogsTableName}(user_id, dialog_id) values(?,?)`
      connection.query(regUserInGlobalDialogQuery, [user_id, GLOBAL], (err, rows) => {
        if(err) throw err

        console.log(`user with id=${user_id} was added to global chat`)
      })
    })
    
  }

  const getUsersInDialog = (connection, queryStr, params) => new Promise((resolve, reject) => {
    connection.query(queryStr, [params.dialogId], (err, rows) => {
      resolve(rows)
    })
  })

  function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
  }

  function returnDialogsWithUsers(socket, dialogsList){
    dialogsList.forEach(async (dialog, index, arr) => {
      dialog.members = []
      const getUsersInDialogQuery = `select * from ${usersDialogsTableName} where dialog_id=?`
      await getUsersInDialog(connection, getUsersInDialogQuery, {dialogId: dialog.id})
      .then(res => {
        res.forEach((item) => {
          console.log(item)
          const dialogMember = allUsers.filter((user) => {
            wait(1)
            return user.id === item.user_id
          })[0]
  
          dialog.members.push({id: dialogMember.id})
        })
        
      })

      if(index === arr.length - 1){
        socket.emit("r_dialogs", dialogsList)
      }
    })
  }

// ****************************************************************************************************************  
socket.on("disconnect", (data) => {
    if(onlineUsers.length === 0) return
    let disconnectedUserInfo = null;
    console.log(onlineUsers)
    onlineUsers = onlineUsers.filter((user) => {
      if(user.socketId === socket.id){
        disconnectedUserInfo = user.profileInfo;
        return false;
      }
      return true;
    })

    if(disconnectedUserInfo){
      console.log(disconnectedUserInfo.login + `:[${socket.id}]` +' leaves the chat')
      socket.broadcast.emit("user_disconnected", disconnectedUserInfo)
    }
  })

  socket.on("log_in", (data) => {
    const login    = data.login;
    const password = data.password; 
    const queryStr = `select * from user_profile where login='${login}' and password='${password}';`;
    connection.query(queryStr, (err, rows) => {
        if(err) {
            // console.log("Error: ", err.sqlMessage);
            // return res.status(400).json({message: "Smth wrong"});
        }
        let result = null

        if(rows.length !== 0) {
          result = new ProfileInfo( 
            rows[0].id,
            rows[0].name, 
            rows[0].surname,
            rows[0].birthday,
            rows[0].photo,
            rows[0].date_of_reg,
            rows[0].email,
            login,
            rows[0].photo
          );
        } 
		else { 
			return;
		}

        const newOnlineUser = new OnlineUser(socket.id, result);
        onlineUsers.push(newOnlineUser)

        socket.broadcast.emit("user_connected", newOnlineUser.profileInfo)

		console.log(`${socket.id}: loged as ${result.login}`)

        socket.emit("r_log_in", result);
    })
  })

  socket.on('get_online_users', () => {
    const filteredOnlineUsers = onlineUsers.filter((user) => {
      return user.socketId !== socket.id
    })

    socket.emit("r_get_online_users", filteredOnlineUsers.map((item) => {
      return({
          id: item.profileInfo.id,
          login: item.profileInfo.login
      })
    })
    )
  })

  socket.on("registration", (data) => {
    const queryStr = `select * from ${ profileTableName }
                        where login='${ data.login }';`
    connection.query(queryStr, (err, rows) => {
      if(err) throw err;
      
      if(rows.length > 0){
        return socket.emit("r_registration", {queryResult: {
          status: 400,
          message: "This login is used by another user"
        }});
      }

      const profileInfo = data;
      const regDate = new Date();
      const regDateStr = regDate.getFullYear()+'-'+regDate.getMonth()+'-'+regDate.getDay();
      const queryStr = `INSERT INTO ${ profileTableName } 
          (login, password, name, surname, email, birthday, date_of_reg, photo)
          VALUES(?,?,?,?,?,?,?,?);`;

      const dummy = [1]
      connection.query(queryStr, [profileInfo.login, profileInfo.password,profileInfo.name, profileInfo.surname, profileInfo.email,
          profileInfo.birthday, regDateStr, profileInfo.img],(err, rows) => {
          if(err) throw err;

          let result = null;
          if(rows.affectedRows > 0){
            result = {queryResult:{
              status: 200,
              message: "success"
            }};
          }

          socket.emit("r_registration", (result))

          regUserInGlobalDialog(profileInfo.login);

          
      })
    })
  })

  socket.on("last_messages", (data) => {
    // console.log(data);
    const messages = messagePool.getMessages(data.msgIndex)
    socket.emit("r_last_messages", {last_index: lastMessageIndex, messages: messages});
  })

  socket.on("message", (data) => {
    const newMessage =  {
      index: ++lastMessageIndex,
      text: data.message,
      sender: {
          id: data.id,
          name: data.name,
          surname: data.surname,
          login: data.login,
          img: data.img,
      },
      destination: data.destination,
    }

    socket.emit("r_message", newMessage)

    if(data.destination === GLOBAL){
      socket.broadcast.emit("r_message", newMessage)

    } else {
      const destId = data.destination
      getDialogCompanionsInfo(destId, data.id, newMessage, sendMessageToSpecifiedDestination)
    }
     

    //TODO: to add login and remove name and surname
    
    const insertMessageQuery = `insert into ${messagesTableName}(text,file,source,destination) values(?,?,?,?)`
    connection.query(insertMessageQuery, [data.message, null, data.id, data.destination], (err, rows) => {
      if(err) throw err
    })
  })

  // socket.on("users_online", (data) => {
  //     let onlineUsersProfileInfo = onlineUsers.filter((user) => {
  //       return user.socketId !== socket.id
  //     })

  //     onlineUsersProfileInfo = onlineUsersProfileInfo.map((user) => {
  //       return {  
  //         id: user.profileInfo.id,
  //         login: user.profileInfo.login
  //       }
  //     })

  //     socket.emit("r_users_online", onlineUsersProfileInfo)
  // })

  const selectCompanionName = (connection, queryStr, params) => new Promise((resolve, reject) => {
    connection.query(queryStr, [params.companionId], (err, rows) => {
      if(err) throw err;
      console.log(" select companion name resolve")
      resolve({
        id: params.dialogId,
        name: rows[0].login
      })
    })
  })

  const selectDialogCompanion = (connection, queryStr, params) => new Promise((resolve, reject) => {
    connection.query(queryStr, [params.dialogId, params.userId], async (err, rows) => {
      if(err) throw err

      const companionId = rows[0].user_id

      const getCompanionNameQuery = `select login from ${profileTableName} where id=?`

      params.companionId = companionId
      let result;
      await selectCompanionName(connection, getCompanionNameQuery, params)
      .then(res => result = res)

      resolve(result)
    })
  })

  const selectDialogs = (connection, queryStr, params) => new Promise((resolve, reject) => {
    connection.query(queryStr, [params.dialogId], (err, rows) => {
      if (err) throw err

      if(rows.length !== 0){
        if(rows[0].type === "1"){
          // const getDialogCompanionQuery = `select * from ${usersDialogsTableName} where dialog_id=? and user_id<>?`
          // let result
          // await selectDialogCompanion(connection, getDialogCompanionQuery, params)
          // .then(res => {
          //   resolve(res)
          //   result = res
          // })
          // resolve(result)
        } else {
          resolve(rows[0])
        }
      }

    })
  })

  socket.on("create_dialog", (data) => {
    const insertNewDialog = `insert into ${dialogsTableName}(name,type) values(?,?)`
    connection.query(insertNewDialog, [data.name, "0"], (err, rows) => {
      if(err) throw err;

      if(rows.affectedRows !== 1) return;

      const getNewDialogId = `select id from ${dialogsTableName} where name=?`
      connection.query(getNewDialogId, [data.name], (err, rows) => {
        if(err) throw err;

        const insertNewUsersDialog = `insert into ${usersDialogsTableName}(user_id,dialog_id) values(?,?)`
        connection.query(insertNewUsersDialog, [data.userId, rows[0].id], (err, rows) => {
          if(err) throw err;

          successfullyCreated = false;

          if(rows.affectedRows === 1){
            successfullyCreated = true;
          }
          
          socket.emit("r_create_dialog", successfullyCreated)
        })
      })
    })
  })
  
  socket.on("invite_user_to_dialog", (data) => {
    const insertUserIntoDialog = `insert into ${usersDialogsTableName}(user_id,dialog_id) values(?,?)`

    connection.query(insertUserIntoDialog, [data.userId, data.dialogId], (err, rows) => {
      if(err) throw err

      if(rows.affectedRows === 1){
        sendInviteToDialogNotification(data)
      }
    })
  })

  socket.on("dialogs", (data) => {
    const userId = onlineUsers.filter((user) => {
      return user.socketId === socket.id
    })[0].profileInfo.id

    const getUserDialogsQuery = `select dialog_id from ${usersDialogsTableName} where user_id = ?`

    connection.query(getUserDialogsQuery, [userId], (err, rows) => {
      if (err) throw err;

      if(rows.length > 0){
        const requiredDialogs = []
        
        rows.forEach(async (elem, index, array) => {
          const dialogId = elem.dialog_id
          const getDialogQuery = `select * from ${dialogsTableName} where id = ?`
          let result;
          await selectDialogs(connection, getDialogQuery, {userId: userId, dialogId: dialogId})
          .then(dialog => {
            result = dialog
          })

          requiredDialogs.push(result)

          if(index === array.length-1){
            returnDialogsWithUsers(socket, requiredDialogs)
          }

          
        });

      }
    })
  })
}

http.listen(port, () => {
    console.log(`Server started at port: ${ port }`);
})







