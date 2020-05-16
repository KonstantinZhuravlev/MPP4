import React, { Component } from 'react';
import "../css/ChatField.css";
import Header from './header.jsx';
import DataField from './dataField.jsx';

class ChatField extends Component {
    state = { 
        profileLabelWasClicked: false,
        currentWindow: "chat",
        currentUser: this.props.currentUser,
        token: "",
    }

    render() { 
        return ( 
            <div className="chat-field">
                { this.renderHeader() }
                { this.renderDataField() }
            </div>
        );
    }

    renderHeader = () => {
        return (
            <Header handleProfileLabelClick={ () => { this.handleProfileLabelClick() }}
                handleChatLabelClick={ () => { this.handleChatLabelClick() }}/>
        );    
    }

    renderDataField = () => {
        return (
            <DataField socket={this.props.socket}
                getMessageRequest= { this.props.getMessageRequest }
                currentWindow={ this.state.currentWindow }
                currentUser={ this.state.currentUser }
                unauthorizedCodeWasReceived={ this.props.unauthorizedCodeWasReceived }/>
        );
    }

    handleProfileLabelClick = () => {
        this.setState({
            currentWindow: "profile",
            currentUser: this.props.currentUser
        })
    }

    handleChatLabelClick = () => {
        this.setState({
            currentWindow: "chat",
        })
    }
}
 
export default ChatField;