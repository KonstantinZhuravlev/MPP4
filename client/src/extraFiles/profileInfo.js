import { tsParenthesizedType } from "@babel/types";

export default class ProfileInfo{
    id
    name
    surname
    birthday
    regDate
    email

    constructor(id, name, surname, birthday, regDate, email, login, img){
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.birthday = birthday;
        this.regDate = regDate;
        this.email = email;
        this.login = login
        this.img = img
    }
}