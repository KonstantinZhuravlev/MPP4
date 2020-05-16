class OnlineUser{
    constructor(socketId, profileInfo){
        this.socketId = socketId
        this.profileInfo = profileInfo
    }
}

module.exports = {onlineUser: OnlineUser}