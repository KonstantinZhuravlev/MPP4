import React, { Component } from 'react';
import Profile from './profile';
import '../css/DataField.css';
import { serverAddress } from '../extraFiles/serverAddressInfo';
import Converter from "../extraFiles/converter.js";
import { throwStatement } from '@babel/types';
import { EventEmitter } from 'events';

const globalChat = {
    id: 1,
    name: 'GLOBAL'
}

class DataField extends Component {
    state = { 
        dialogs: [],
        messages: [],    
        onlineUsers: [],   
        lastMessageIndex: 0,
        messageText: "",
        getMessagesInterval: null,
        getOnlineUsersInterval: null,
        onlineUsersSearchValue: "",
        dialogsBoxesList: [globalChat],
        currentDialog: globalChat,
    }


    componentDidMount(){  
        const socket = this.props.socket;

        socket.on("r_create_dialog", (data) => {
            socket.emit("dialogs", {})
        })
        
        socket.on("r_message", (data) => {
            const dialogId = data.destination
            const dialog = this.state.dialogs.filter((dialog) => {
                return dialog.id === dialogId
            })[0]

            dialog.messages.push({
                index: data.index,
                img: data.img,
                sender: data.sender,
                text: data.text
            })

            if(dialog.id !== this.state.currentDialog.id){
                dialog.checked = false
                dialog.newMessagesCount++
            }
            
            this.setState({dialogs: this.state.dialogs});
        })
        
        socket.on("invited_to_dialog", (data) => {

            const requiredDialog = this.state.dialogs.filter((dialog) => {
                return dialog.id === data.id
            })[0]


            if(!requiredDialog){
                this.state.dialogs.push({
                    id: data.id,
                    name: data.name,
                    checked: false,
                    newMessagesCount: 0,
                    messages: [],
                    members: data.members
                })

                this.state.dialogsBoxesList.push({
                    id: data.id,
                    name: data.name
                })
            } else {
                requiredDialog.members = data.members
            }

            this.setState({})
        })

        socket.on("user_connected", (data) => {
            this.state.onlineUsers.push(data)
            this.setState({onlineUsers: this.state.onlineUsers})
        })

        socket.on("user_disconnected", (data) => {
            this.setState({onlineUsers: this.state.onlineUsers.filter((user) => {
                return user.id !== data.id
            })})
        })

        socket.on("r_dialogs", (data) => {
            data.forEach((item) => {
                let checked = false;
                if(this.state.currentDialog.id === item.id){
                    checked = true;
                }
                
                this.state.dialogs.push({
                    id: item.id,
                    name: item.name,
                    checked: checked,
                    newMessagesCount: 0,
                    messages: [],
                    members: item.members
                })
            })
            
            this.setState({
                dialogsBoxesList: data,
                currentDialog: this.state.dialogs[0]
            })
        })

        socket.on("r_get_online_users", (data) => {
            this.setState({onlineUsers: data})
        })

        socket.emit("dialogs", {})
        socket.emit("get_online_users", {})
    }

    render() { 
        return ( 
            <div className="data-field">
                <div className="chat-items">
                    { this.renderOnlineUsersListBox() }
                    { this.renderUserProfile() }
                    { this.renderMessagesListBox() }
                    { this.renderDialogsListBox() }
                </div>
                { this.renderMessageInputBox() }
            </div>
        );
    }

    renderDialogsListBox = () => {
        return (
            <div className="dialogs-list">
                <div className="dialogs-list-title">
                    <span>Dialogs</span>
                </div>
                <div className="create-dialog-block">
                    <form>
                        <div className="create-dialog-input-name">
                            <input type="text" className="form-control" name="create_dialog" onChange={this.handleChangeNewDialogNameInput}
                                value={this.state.createDialogNameText}
                            />
                        </div>
                        <div className="create-dialog-btn">
                            <input type="button" className="btn btn-dark" value="Create dialog" onClick={this.handleCreateDialogButtonClick}/>
                        </div>
                    </form>
                </div>
                <div className="dialogs-ul">
                    <ul>
                        {this.renderDialogsBoxes() }
                    </ul>
                </div>
                {/* <div className="scroolbar-block">
                    <div className="scrollbar scrollbar-lady-lips">
                        <div className="force-overflow">
                            <ul>
                                <li className="">

                                </li>
                            </ul>
                        </div>
                    </div>
                </div> */}
            </div>
        )
    }

    renderDialogsBoxes = () => {
        if(this.state.dialogs.length === 0) return

        return this.state.dialogsBoxesList.map((dialogBox) => {
            let dialogBoxClassName = "dialog-list-item";

            if(dialogBox.id === this.state.currentDialog.id){
                dialogBoxClassName += "-highlited"
            }

            const dialog = this.state.dialogs.filter((innerDialog) => {
                return innerDialog.id === dialogBox.id
            })[0]
        
            return (
                <li className={dialogBoxClassName} key={dialog.id} id={dialog.id} onClick={ this.handleDialogBoxClick }>
                    <div className="dialog-list-item-name" onClick={ this.handleDialogBoxClick }>
                        <span id={dialog.id} onClick={ this.handleDialogBoxClick }>{dialog.name}</span>
                    </div>
                    <div className="dialog-list-item-notification-bag">
                        {this.renderNewMessagesCountSpan(dialog)}
                        
                    </div>
                </li>
            )
        })
    }

    renderNewMessagesCountSpan = (dialog) => {
        if(dialog.newMessagesCount > 0 && !dialog.checked)
            return <span>{dialog.newMessagesCount}</span>
    }

    renderOnlineUsersListBox = () => {
        return (
            <div className="online-users-list">
                <div className="users-list-title">
                    <span>Online users</span>
                </div>
                <div className="users-search-line">
                    <form>
                        <input type="text" className="form-control" 
                            placeholder="nickname" name="user_nickname"
                            onChange={this.handleSearchOnlineUserChange}
                        />
                    </form>
                </div>
                <div className="users-ul">
                    <ul>
                        {this.renderOnlineUsers() }
                    </ul>
                </div>
            </div>
        )
    }

    renderOnlineUsers = () => {
        const filteredOnlineUsersList = this.state.onlineUsers.filter((item) => {
            return item.login.startsWith(this.state.onlineUsersSearchValue)
        })

        return filteredOnlineUsersList.map((user) => {
            return (
                <li className="users-list-item" key={user.id} id={user.id} onClick={ this.handleOnlineUserWasClicked }>
                    <div className="users-list-item-photo">
                        <img alt="" src='https://images.pexels.com/photos/33109/fall-autumn-red-season.jpg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'/>  
                    </div>
                    <div className="users-list-item-name">
                        <span>{user.login}</span>
                    </div>
                    <div className="users-list-item-send-msg" onClick={this.handleOnlineUserBoxClick}>
                        <form>
                            {this.renderInviteButton(user)}
                        </form>
                    </div>
                </li>
            )
        })
    }

    renderInviteButton = (user) => {
        if(this.state.currentDialog.id === 1) return // if it's global dialog

        const usersInDialogWithSpecifedId = this.state.currentDialog.members.filter(member => {
            return member.id === user.id
        })

        if(usersInDialogWithSpecifedId.length === 0)
            return <button type="button" className="btn btn-warning" onClick={() => this.handleInviteButtonClick(user.id)}>Invite</button>
    }

    renderMessageInputBox = () => {
        if(this.props.currentWindow === "chat") 
            return (
                <div className="send-msg-area">
                    <form>
                        <div className="send-msg-input">
                            <input className="form-control" 
                                type="text" name="message_text"
                                value={this.state.messageText} onChange={ this.handleMsgTextChange }/>
                        </div>
                        <div className="send-msg-btn">
                            <input type="button" 
                                className="btn btn-dark" value="Send" 
                                name="message_send_btn" onClick={ this.handleSendMsgButtonClick }/>
                        </div>
                    </form>
                </div>
            );
    }

    renderUserProfile = () => {
        if(this.props.currentWindow === "profile"){
            return (
                <Profile currentUser={ this.props.currentUser }/>
            );
        }
    }

    renderMessagesListBox = () => {
        if(this.props.currentWindow === "chat"){
            return (
                <div className="message-list-box">
                    <div className="message-list-area">
                        { this.renderMessagesList() }
                    </div>
                </div>
            );
        }
    }

    renderMessagesList = () => {
        return (
            <ul>
                {this.renderListItems()}
                <li key={"100000"}className="dummy-msb-box" ref={(el) => { this.messagesEnd = el; }}>
                </li>
            </ul>
        );
    }

    renderListItems = () => {
        if(this.state.dialogs.length === 0) return

        console.log(this.state.currentDialog.members)
        return this.state.currentDialog.messages.map( (message) => {
            return (
                <li key={message.index}>
                    <div className="message-box">
                        <div className="message-content">
                            <div className="card bg-light mb-3">
                                <div className="card-header">
                                    <div className="message-sender-avatar">
                                        <img alt=""  src={`data:image/jpg;base64,${Converter.arrayBufferToBase64(message.sender.img)}`}/>
                                        {/* <img alt="" src='https://images.pexels.com/photos/33109/fall-autumn-red-season.jpg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'/> */}
                                    </div>
                                    <span>{this.prepareSenderName(message)}</span>
                                </div>
                                <div className="card-body">
                                    <div className="card-text">
                                        <span>{message.text}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </li>
            );
        })
    }

    prepareSenderName = (message) => {
        if(message.sender.id === this.props.currentUser.id){
            return "you"
        }

        return message.sender.login
    }

    handleInviteButtonClick = (userId) => {
        this.props.socket.emit("invite_user_to_dialog", {userId: userId, dialogId: this.state.currentDialog.id})
    }
    
    handleDialogBoxClick = (event) => {
        const id = parseInt(event.target.getAttribute("id"))
        const dialog = this.state.dialogs.filter((innerDialog) => {
            return innerDialog.id === id
        })[0]
        // dialog.checked = true;
        // dialog.newMessagesCount = 0;
        dialog.checked = true
        dialog.newMessagesCount = 0

        this.setState({currentDialog: dialog})
    }

    handleOnlineUserBoxClick = (event) => {
        const clickedUsersBoxId =  event.target.getAttribute("id")
        // create dialog with this user
    }

    handleSearchOnlineUserChange = (event) => {
        this.setState({onlineUsersSearchValue: event.target.value})
    }

    handleMsgTextChange = (event) => {
        this.setState({messageText: event.target.value});
    }

    handleChangeNewDialogNameInput = (event) => {
        this.setState({createDialogNameText: event.target.value})
    }

    handleCreateDialogButtonClick = () => {
        this.props.socket.emit("create_dialog", {
            userId: this.props.currentUser.id,
            name: this.state.createDialogNameText,
        })

        this.setState({createDialogNameText: ""})
    }

    handleSendMsgButtonClick = () => {
        if(this.state.messageText.length === 0) return;
        
        this.props.socket.emit("message", {
            id: this.props.currentUser.id,
            name: this.props.currentUser.name,
            surname: this.props.currentUser.surname,
            message: this.state.messageText,
            login: this.props.currentUser.login,
            img: this.props.currentUser.img,
            destination: this.state.currentDialog.id
        })

        this.setState({
            messageText: "",
        })
    };
    
}

export default DataField;