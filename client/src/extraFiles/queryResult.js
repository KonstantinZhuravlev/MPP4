import { throwStatement } from "@babel/types";

class QueryResult{
    message;
    status;

    constructor(){
        this.status = 0;
        this.message = "";
    }
}

export default QueryResult;