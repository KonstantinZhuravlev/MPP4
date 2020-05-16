import React, { Component } from 'react';
import "../css/UserProfile.css";
import ProfileInfo from "../extraFiles/profileInfo.js";
import Converter from "../extraFiles/converter.js";

class Profile extends Component {
    state = { 
        profileInfo: this.props.userInfo,
    }

    render() { 
        return ( 
            <div className="user-profile">
                <div className="user-profile-col">
                    <div className="user-profile-image">
                        <img id="profileImage" 
                            src={`data:image/jpg;base64,${Converter.arrayBufferToBase64(this.props.currentUser.img)}`} 
                            alt="" className="img-rounded"
                        />
                    </div>
                </div>
                <div className="user-profile-col">
                    <div className="user-profile-info"> 
                        <div className="user-profile-col-highlighted">
                            <div className="user-profile-row">
                                <span>Login</span>
                            </div>
                            <div className="user-profile-row">
                                <span>Full name</span>
                            </div>
                            <div className="user-profile-row">
                                <span>Birthday</span>
                            </div>
                        </div>
                        <div className="user-profile-col">
                            <div className="user-profile-row">
                                <span>{this.props.currentUser.login}</span>
                            </div>
                            <div className="user-profile-row">
                                <span>{`${this.props.currentUser.surname} ${this.props.currentUser.name}`}</span>
                            </div>
                            <div className="user-profile-row">
                                <span>{ Converter.dateToNormalDate(this.props.currentUser.birthday) }</span>
                            </div>
                        </div>
                    </div>
                </div>
                    
            </div>
        );
    }
}
 

// style="width:50px;"
export default Profile;
