function ProfileInfo (id, name, surname, birthday, image, regDate, email, login, img){
    this.id = id;
    this.name = name;
    this.surname = surname;
    this.birthday = birthday;
    this.image = image;
    this.regDate = regDate;
    this.email = email;
    this.login = login;
    this.img = img;
}

module.exports = {
    ProfileInfo: ProfileInfo
};