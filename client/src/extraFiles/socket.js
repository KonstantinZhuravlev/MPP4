import io from "socket.io-client";
import {serverAddress} from "./serverAddressInfo";

const socket = io(serverAddress);

export {socket};