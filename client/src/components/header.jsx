/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
import logo from "../logo/logo.png";
import "../css/Header.css";

class Header extends Component {
    state = {  }
    render() { 
        return ( 
                <nav className="navbar navbar-default navbar-expand-lg navbar-dark bg-dark navbar-fixed-top">
                    <div className="container">
                        <a className="navbar-brand" href="#">
                            <img src={ logo } className="chat-logo" alt=""/>
                        </a>
                        <div className="collapse navbar-collapse" id="navbarNavDropdown">
                            <ul className="navbar-nav">
                                <li className="nav-item active">
                                    <a className="nav-link" href="#" 
                                        onClick={ () => { this.props.handleProfileLabelClick() } }>
                                        Profile
                                        <span className="sr-only">
                                        </span>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" onClick={ () => { this.props.handleChatLabelClick() } } 
                                        href="#">Chat
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
        );
    }
}
 
export default Header;