const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];

export default class Converter{
    static arrayBufferToBase64 = function (buffer) {
        let binary = '';
        let bytes = new Uint8Array(buffer);
        let len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }

        return window.btoa(binary);
    }

    static dateToNormalDate = function (date) {
        const regExp = /\d{4}\-\d{2}\-\d{2}/g;
        let dateMainPart = [...date.matchAll(regExp)][0][0];
        let mainDateParts = [...dateMainPart.matchAll(/(\d+)/g)];
        return `${mainDateParts[2][0]} ${months[parseInt(mainDateParts[1][0])-1]} ${mainDateParts[0][0]}`;
    }
}