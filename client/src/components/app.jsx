import React, { Component } from 'react';
import '../css/App.css';
import AuthorizationForm from './authorizationForm';
import ChatField from './chatField';
import ProfileInfo from '../extraFiles/profileInfo';
import {serverAddress, authServerAddress} from "../extraFiles/serverAddressInfo";
import io from "socket.io-client";
const socket = io('http://localhost:3005');

class App extends Component {
  state = { 
    authorized: false,
    responseBody: {
      status: 0,
      data: null
    },
	  token: null,
    currentUser: null,
    socketId: null,
  }

  componentDidMount(){
    socket.connect()

    socket.on("r_socket_id", (data) => {
      this.setState({socketId: data.socketId})
    })

    socket.on("r_log_in", (data) => {
      const newState = this.state;

      if(data !== null){
        newState.currentUser = new ProfileInfo(
          data.id,
          data.name,
          data.surname,
          data.birthday,
          data.regDate, 
          data.email,
          data.login,
          data.img
        );
        newState.authorized = true;
      }

      this.setState(newState);
    })
  }

  render() { 
    return ( 
      <div className="app">
          { this.renderAuthorizationForm() }
          { this.renderChatField() }
      </div>
    );
  }

  renderAuthorizationForm = () => {
    if(!this.state.authorized){
      return <AuthorizationForm requestRes={ this.state.responseBody } 
        logInButtonClick= { (login, password) => { this.handleLogInButtonClick(login, password) } }
        socket={socket}/>
    }
  }

  renderChatField = () => {
    if(this.state.authorized){
      return (
        <ChatField currentUser={ this.state.currentUser }
          getMessageRequest={ this.getMessageRequest }
		      unauthorizedCodeWasReceived={ this.unauthorizedCodeWasReceived }
          socket={socket}/>
      );
    }
  }

  handleLogInButtonClick = (login, password) => {
    socket.emit("log_in", {login: login, password: password});
  }

  unauthorizedCodeWasReceived = () => {
	  this.setState({authorized: false});
  }
}


export default App;