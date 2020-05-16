const connection = require("../index").con
const messagesTableName = require("../constants/db").messagesTableName
const profileTableName = require("../constants/db").profileTableName
const profileInfo = require("../classes/profileInfo.js");
const ProfileInfo = profileInfo.ProfileInfo;

let {
    GraphQLString,
    GraphQLList,
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLSchema,
    GraphQLInt
} = require("graphql")

const messagePool = require("../classes/messagePool").msgPool
let lastMessageIndex = 0
// messagePool.push({
//     index: 1,
//     name: "Pasha",
//     surname: "Yakovelvich",
//     msg: "Hello"
// })
// lastMessageIndex++

// messagePool.push({
//     index: 2,
//     name: "Sasha",
//     surname: "Yakovelvich",
//     msg: "HI"
// })
// lastMessageIndex++

// messagePool.push({
//     index: 3,
//     name: "Kakasha",
//     surname: "Yakovelvich",
//     msg: "Zdarova"
// })
// lastMessageIndex++;


const insertMessage = (connection, queryStr, params) => new Promise((resolve, reject) => {
    connection.query(queryStr, [params.message, null, params.id], (error, rows) => {
        if(error){
            throw new Error(error.message);
        }

        if(rows.affectedRows !== 1) return reject(null);

        lastMessageIndex++ 

        messagePool.push({
            index: lastMessageIndex,
            name: params.name,
            surname: params.surname,
            msg: params.message,
        })

        return resolve(messagePool.messages[lastMessageIndex-1])
    })
})

const insertProfileInfo = (connection, queryStr, args) => new Promise((resolve, reject) => {
    const checkQueryStr = `select * from ${ profileTableName }
                        where login='${ args.login }';`
    connection.query(checkQueryStr, (err, rows) => {
        if(err) throw err;
        
        if(rows.length > 0){
            return resolve({ error: "This login is used by another user" });
        }
        
        connection.query(queryStr, [args.login, args.password, args.name, args.surname, args.email,
            args.birthday, args.regDateStr, [1]],(err, rows) => {
            if(err) {
                throw err;
            }
            if(rows.affectedRows > 0){
                resolve({
                    login: args.login, 
                    password: args.password
                })
            }
            else {
                reject ({ message: "Opps. Internal error was occured. Server is not working" });
            }
        })
    })
    
})


const selectAccountInfo = (connection, queryStr, args) => new Promise((resolve, reject) => {
    connection.query(queryStr, (err, rows) => {
        if(err) {
            return resolve({error: "Smth wrong"});
        }
        
        if(rows.length === 0) {
            return resolve({ error: "Wrong login or password"}); 
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

        resolve(result);
    })
})

const MessageType = new GraphQLObjectType({
    name: "Message",
    fields: () => ({
        index: {type: GraphQLInt},
        name: {type: GraphQLString},
        surname: {type: GraphQLString},
        msg: {type: GraphQLString},
        error: {type: GraphQLString}
    })
})

const AccountInfoType = new GraphQLObjectType({
    name: "AccountInfo",
    fields: () =>({
        id: {type: GraphQLInt}, 
        login: {type: GraphQLString}, 
        password: {type: GraphQLString}, 
        name: {type: GraphQLString}, 
        surname: {type: GraphQLString}, 
        email: {type: GraphQLString}, 
        birthday: {type: GraphQLString}, 
        regDate: {type: GraphQLString},
        error: {type: GraphQLString}
    })
})

const Mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        sendMessage: {
            type: MessageType,
            args: {
                id: {type: GraphQLInt},
                name: {type: GraphQLString},
                surname: {type: GraphQLString},
                msg: {type: GraphQLString}
            },

            resolve: async(parent, args) => {
                const message = args.msg;
                const id = parseInt(args.id);
                const insertQuery = `
                    insert into ${messagesTableName}(text, file, source) values(?,?,?)`;

                await insertMessage(connection, insertQuery, {id: id, message: message, name: args.name, surname: args.surname})
                .then(data => {
                    lastMessageIndex++
                    return data
                })

                return messagePool.messages[--lastMessageIndex]
            }
        },

        registrateAccount: {
            type: AccountInfoType,
            args: {
                login: {type: GraphQLString},
                password: {type: GraphQLString},
                name: {type: GraphQLString},
                surname: {type: GraphQLString},
                email: {type: GraphQLString},
                birthday: {type: GraphQLString},
                data_of_reg: {type: GraphQLString},
            },

            resolve: async (parent, args) => {
                const regDate = new Date();
                const regDateStr = regDate.getFullYear()+'-'+regDate.getMonth()+'-'+regDate.getDay();
                const queryStr = `INSERT INTO ${ profileTableName } 
                    (login, password, name, surname, email, birthday, date_of_reg, photo)
                    VALUES(?,?,?,?,?,?,?,?);`;

                args.regDateStr = regDateStr

                let result;
                console.log(args)
                await insertProfileInfo(connection, queryStr, args)
                .then(data => result = data)

                console.log(result)
                return result
                
            }
        }
    }
})

// (login, password, name, surname, email, birthday, date_of_reg, photo)

const Query = new GraphQLObjectType({
    name: "Query",
    fields: {
        login: {
            type: AccountInfoType,
            args: {
                login: {type: GraphQLString},
                password: {type: GraphQLString},
            },
            resolve: async (parent, args) => {
                const login    = args.login;
                const password = args.password; 
                const queryStr = `select * from user_profile where login='${login}' and password='${password}';`;
                let result = null;
                await selectAccountInfo(connection, queryStr, args)
                .then(data => result = data)

                console.log(result)
                return result
            }
        },

        messages: {
            type: new GraphQLList(MessageType),
            args: { id: {
                    type: GraphQLInt
                }
            },
            resolve(parent, args){
                console.log("messages")
                console.log(lastMessageIndex)
                return messagePool.getMessages(args.id)
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: Query,
    mutation: Mutation
})