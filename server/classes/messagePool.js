class MessagePool{
    size;
    messages;

    constructor(size){
        this.size = size;
        this.messages = [];
    }

    push = (message) => {
        if(this.messages.length >= this.size) 
            this.messages = this.messages.slice(1, this.messages.length);

        return this.messages.push(message)
    }

    expand = (newSize) => {
        if(newSize < 1) throw "Size of pull can't be lower than 1";

        this.size = newSize;
        return newSize;
    }

    getMessages = (startIndex) => {
        return this.messages.filter((msg) => {
            return (msg.index > startIndex);
        });
    }
}

module.exports.msgPool = new MessagePool(50);