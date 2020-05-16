/* eslint-disable no-duplicate-case */
/* eslint-disable default-case */
import React, { Component } from 'react';
import '../css/AuthorizationForm.css';
import { inputsNames } from '../extraFiles/constants.js';
import { serverAddress } from '../extraFiles/serverAddressInfo.js';
import axios from "axios";
import {ValidationResult, validator} from '../extraFiles/profileInfoValidator';
import QueryResult from '../extraFiles/queryResult';
import logo from "../logo/logo.png";

class AuthorizationForm extends Component {
    constructor(props){
        super(props);
        this.validationResult = validator.validateProfileInfo(this.authorizationData);
    }
    state = { 
        authorizationData:{
            login: "",
            password: "",
            name: "",
            surname: "",
            birthday: "",
            email: "",
            profileImage: null,
        }, 
        
        registrationButtonWasClicked: false,
        queryResult: new QueryResult(),
        validationResult: new ValidationResult(),
    }

    componentDidMount(){
        const socket = this.props.socket;
        socket.on("r_registration", (data) => {
            console.log(data)    
            const newState = this.state
            if(data.queryResult.status < 300 && data.queryResult.status >= 200){
                newState.registrationButtonWasClicked = false;
            }

            newState.queryResult = data.queryResult

            this.setState(newState)
        })
    }

    render() { 
        return ( 
            <div className='AuthorizationForm'>
                <div className="container">
                    <div className="d-flex justify-content-center h-100">
                        <div className="card">
                            <div className="card-header">
                                <img src={ logo } height="100" widht="100" alt=""/>
                            </div>
                            <div className="card-body">
                                { this.renderBackButton() }
                                { this.renderRegistrationAttemptFailedLabel() }
                                <form encType="multipart/form-data">
                                    { this.renderFailedLoginAttemptLabel()}
                                    { this.renderDefiningError(inputsNames.login) }
                                    <div className="input-group input-group-lg">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text">
                                                Login
                                            </span>
                                        </div>
                                        <input type="text" className="form-control" 
                                            name={ inputsNames.login } onChange={ this.handleProfileInfoChange }/>
                                    </div>
                                    { this.renderDefiningError(inputsNames.password) }      
                                    <div className="input-group input-group-lg">   
                                        <div className="input-group-prepend">       
                                            <span className="input-group-text">
                                                Password
                                            </span>
                                        </div>  
                                        <input type="password" className="form-control" 
                                            name={ inputsNames.password } onChange={ this.handleProfileInfoChange }/>
                                    </div>
                                    { this.renderLoginButton() }
                                    { this.renderRegistrationFullInfoComponents() }
                                </form>
                            </div>
                            <div className="card-footer">
                                <div className="d-flex justify-content-center links">  
                                    { this.renderDontHaveAccount() }
                                    { this.renderRegistrationLabel() }   
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderDontHaveAccount = () => {
        if(!this.state.registrationButtonWasClicked)
            return (
                <span>Don't have an account?</span>
            );
    }

    renderLoginButton = () => {
        if(this.state.registrationButtonWasClicked) return;

        if(!this.state.validationResult.loginIsValid()){
            return(
                <div className="form-group">
                    <input type='button' 
                        value='Log in'
                        disabled
                        className="btn float-right login_btn"
                        onClick={ () => { 
                                this.props.logInButtonClick(this.state.authorizationData.login, this.state.authorizationData.password); 
                            } 
                        }/>
                </div>
            );
        }

        return (
            <div className="form-group">
                <input type='button' 
                    className="btn float-right login_btn"
                    value='Log in' 
                    onClick={ () => { 
                            this.props.logInButtonClick(this.state.authorizationData.login, this.state.authorizationData.password)
                        } 
                    }/>
            </div>
        )
    }

    renderRegistrationLabel = () => {
        if(!this.state.registrationButtonWasClicked){
            return <a href="#" onClick={ this.handleRegistrateLabelClick }>Registrate account</a>;
        }
    }
//
    renderRegistrationFullInfoComponents = () => {
        if(this.state.registrationButtonWasClicked){
            return (
                <div className="profileComponents">
                    { this.renderNameInputField() }
                    { this.renderDefiningError(inputsNames.surname) }
                    <div className="input-group input-group-lg">
                        <div className="input-group-prepend">
                            <span className="input-group-text">
                                Surname
                            </span>
                        </div>
                        <input type="text" className="form-control" name={ inputsNames.surname } 
                            onChange={ this.handleProfileInfoChange }/>
                    </div>
                    { this.renderDefiningError(inputsNames.email) }
                    <div className="input-group input-group-lg">
                        <div className="input-group-prepend">
                            <span className="input-group-text">
                                Email   
                            </span>
                        </div>
                        <input type="email" className="form-control" name={ inputsNames.email } 
                            onChange={ this.handleProfileInfoChange }/>
                    </div>
                    { this.renderDefiningError(inputsNames.birthday) }
                    <div className="input-group input-group-lg">
                        <div className="input-group-prepend">
                            <span className="input-group-text">Birthday</span>
                        </div>
                        <input type="date" className="form-control" name={ inputsNames.birthday } onChange={ this.handleProfileInfoChange }/>
                    </div>
                    { this.renderDefiningError(inputsNames.profileImage) }
                    <div className="input-group input-group-lg">
                        <div className="input-group-prepend">
                            <span className="input-group-text">Photo image</span>
                        </div>
                        <input type="file" className="form-control" name={ inputsNames.profileImage } onChange={ this.handleProfileInfoChange }/>
                    </div>
                    { this.renderRegistrateAccountButton() }
                </div>
            )
        }
    }

    renderNameInputField = () => {
        return (
            <div>
                { this.renderDefiningError(inputsNames.name) }
                <div className="input-group input-group-lg">
                    <div className="input-group-prepend">
                        <span className="input-group-text">
                            Name
                        </span>
                    </div>
                    <input type="text" className={ "form-control is-valid"} name={ inputsNames.name } 
                        onChange={ this.handleProfileInfoChange }/>
                </div>
            </div>
        )
    }

    renderBackButton = () => {
        if(this.state.registrationButtonWasClicked)
            return (
                <input type="button" className="reg_btn" value="Back" onClick={ this.handleBackButtonClick }/>
            );
    }

    renderRegistrateAccountButton = () => {
        if(!this.state.validationResult.regAvaliable){
            return (
                <div className="reg-form-control">
                    <input type="button"
                        className="btn float-right reg_btn"
                        value="Registrate account" 
                        disabled 
                        onClick={ this.handleRegistrateButtonClick }/>
                </div>
            );
        }

        return (
            <div className="reg-form-control">
                <input type="button"
                    className="btn float-right login_btn"
                    value="Registrate account" 
                    onClick={ this.handleRegistrateButtonClick }/>
            </div>
        );
    }

    renderFailedLoginAttemptLabel = () => {
        // console.log(this.props.requestRes);
        if(this.state.registrationButtonWasClicked) return;

        if(this.props.requestRes.status === 400){
            return (
                <h2>{ this.props.requestRes.data.message }</h2>
            );
        }
    }

    renderDefiningError = (inputName, classValidStr = "valid") => {
        let message = "";
        this.state.validationResult.fields.forEach(element => {
            if(element.fieldName === inputName){
                message = element.message;
            }   
        });

        if(message.length !== 0){
            return (
                <div className="defining-error">
                    <span>{message}</span>
                </div>
            );
        }
    }

    renderRegistrationAttemptFailedLabel = () => {
        if(this.state.queryResult.status >= 400 && this.state.queryResult.status < 600) {
            return (
                <div className="alert alert-danger" role="alert">
                    <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
                    <span>
                        { this.state.queryResult.message }
                    </span>
                </div>
            );
        }
    }

    handleRegistrateButtonClick = () => {
        const registrationData = {
            login: this.state.authorizationData.login,
            password: this.state.authorizationData.password,
            name: this.state.authorizationData.name,
            surname: this.state.authorizationData.surname,
            email: this.state.authorizationData.email,
            birthday: this.state.authorizationData.birthday,
            img: this.state.authorizationData.profileImage
        }

        console.log("registration")
        this.props.socket.emit("registration", registrationData)

    }

    handleRegistrateLabelClick = () => {
        const newState = this.state;
        newState.registrationButtonWasClicked = true;
        this.setState(newState);
    }

    handleBackButtonClick = () => {
        const newState = this.state;
        newState.registrationButtonWasClicked = false;
        this.setState(newState);
    }

    handleProfileInfoChange = (event) => {
        const elem = event.target;
        const newState = this.state;

        switch(elem.name){
            case inputsNames.login:
                newState.authorizationData.login = elem.value;
                break;
            case inputsNames.password:
                newState.authorizationData.password = elem.value;
                break;
            case inputsNames.name:
                newState.authorizationData.name = elem.value;
                break;
            case inputsNames.surname:
                newState.authorizationData.surname = elem.value;
                break;
            case inputsNames.birthday:
                newState.authorizationData.birthday = elem.value;
                break;
            case inputsNames.profileImage:
                newState.authorizationData.profileImage = elem.files[0];
                break;
            case inputsNames.email:
                newState.authorizationData.email = elem.value;
                break;
        }

        validator.validateProfileInfo(newState.authorizationData, this.state.registrationButtonWasClicked);
        newState.validationResult = validator.getLastValidationResult();

        this.setState(newState);
    }
}
 
export default AuthorizationForm;