import {maxFileSizeMB, inputsNames} from "./constants.js"

const validator = {

    validationResults: [],

    getLastValidationResult: function(){
        if(this.validationResults.length === 0) return null;

        return this.validationResults[this.validationResults.length-1];
    },

    validateProfileInfo: function(profile, regEnabled){
        if(!profile) return false;

        const validationResult = new ValidationResult();
        let regAvaliable = false;
        let loginAvaliable = this.validateLogin(profile.login, validationResult);
        loginAvaliable &= this.validatePassword(profile.password, validationResult);

        if(regEnabled){
            regAvaliable = loginAvaliable;
            regAvaliable &= this.validateName(profile.name, validationResult);
            regAvaliable &= this.validateSurname(profile.surname, validationResult);
            regAvaliable &= this.validateEmail(profile.email, validationResult);
            regAvaliable &= this.validateDate(profile.birthday, validationResult);
            regAvaliable &= this.validateProfileImage(profile.profileImage, validationResult);

        }

        validationResult.regAvaliable   = regAvaliable   && true;
        validationResult.loginAvaliable = loginAvaliable && true;
        this.saveValidationResult(validationResult);        
    },

    saveValidationResult: function(validationResult){
        if(this.validationResults.length < 5){
            return this.validationResults.push(validationResult);
        }

        this.validationResults = this.validationResults.slice(1,this.validationResults.length-1)
        return this.validationResults.push(validationResult);
    },

    validateDate: function(dateStr, validationResult, dateRegExp = /^(\d{4}-\d{2}-\d{2})$/){
        const result = dateRegExp.test(dateStr);
        let message = "";
        if(!result){
            message = "something wrong with birthday...";
        }

        validationResult.fields.push(new ValidationMessage(inputsNames.birthday, message));
        return result;
    },

    validatePassword: function(password, validationResult, passwordRegExp = /^(\w{8,50})$/) {
        const result = passwordRegExp.test(password);
        let message = "";
        if(!result){
            // get error message
            message = "Something wrong with password. Check it for errors";
        }

        validationResult.fields.push(new ValidationMessage(inputsNames.password, message));
        return result;
    },

    validateEmail: function(email, validationResult, emailRegExp = /^([A-Za-z]{1}[\w\.]*@[A-Za-z]+\.[A-Za-z]+)$/) {
        const result = emailRegExp.test(email);
        let message = "";
        if(!result){
            message = "Something wrong with email. Check it for errors";
        }

        validationResult.fields.push(new ValidationMessage(inputsNames.email, message));
        return result;
    },

    validateProfileImage: function(file, validationResult) {
        const message = defineFileValidationError(file);
        const result = (message !== "") ? false : true;
        validationResult.fields.push(new ValidationMessage(inputsNames.profileImage, message))
        return result;
    },

    validateLogin: function(value, validationResult, regExp = /^([A-Za-z]{1}[A-Za-z\d]{3,50})$/) {
        const result = regExp.test(value);
        let message = "";
        if(!result) message = defineLoginValidationError(value);
        validationResult.fields.push(new ValidationMessage(inputsNames.login, message));

        return result;
    },

    validateName: function(name, validationResult){
        return this.validateNameSurname(name, validationResult, inputsNames.name);
    },

    validateSurname: function(surname, validationResult){
        return this.validateNameSurname(surname, validationResult, inputsNames.surname);
    },

    validateNameSurname: function(str, validationResult, fieldName, regExp = /^([A-Za-z]{2,50})$/){
        const result = regExp.test(str);
        let message = "";
        if(!result){
            message = defineNameSurnameValidationErrorMessage(str);
        }

        validationResult.fields.push(new ValidationMessage(fieldName, message));
        return result;
    }
}       

function defineNameSurnameValidationErrorMessage(value){
    if(value.match(/^(\w{1})$/)) return "Surname should contain more than 1 character";
    if(value.match(/^(\w{50}\w+)$/)) return "Surname can't be more than 50 charaters";
    if(value.match(/\d+/)) return "Surname can't contain digits";
    return "";
}

function defineLoginValidationError(value){
    if(value.length < 4){
        return "Login is to small('Should be more than 4 characters')";
    } else if(value.length > 50){
        return "Login is to big('Should be less than 50 characters')";
    } else if(value[0].match(/^(\d{1}\w*)$/)) {
        return "Login should not start with digit";
    } else {
        return "Login must contain only aplhabet characters and digits"
    }
}

function defineFileValidationError(file){
    if(!file) return "The file is't selected!";
    if(validImageFormats.indexOf(file.type) === -1) return "This format of file isn't supported!";

    const sizeInMB = file.size / 1024 / 1024;
    if(sizeInMB > maxFileSizeMB) return `Too large file. Max size: ${ maxFileSizeMB }`; 
    return "";
}

class ValidationResult{
    fields;
    regAvaliable;
    loginAvaliable;

    constructor(){
        this.fields = [];
        this.regAvaliable = false;
        this.loginAvaliable = false;
    }

    loginIsValid = function LoginIsValid() {
        return this.loginAvaliable;
    }
}

class ValidationMessage{
    message;
    fieldName;

    constructor(fieldName, message){
        this.message = message;
        this.fieldName = fieldName;
    }
}

const validImageFormats = [
    "image/jpeg",
    "image/jpg",
    "image/png",
]

export { ValidationResult, validator};