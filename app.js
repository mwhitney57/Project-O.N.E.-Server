//  General JS Imports
/** dotenv Import. (For Development) */
require('dotenv').config();
/** Express Import. */
const express = require('express');
/** Express App. */
const app = express();
/** HTTP Import. */
const http = require('http');
/** WebSocket Import. */
const WebSocket = require('ws');
/** Crypto Import. */
const crypto = require('crypto');

//  Custom JS Imports
/** P1Request Import. */
const P1Request = require('./js/P1Request');
/** SenderType Import. */
const SenderType = require('./js/SenderType');
/** MessageType Import. */
const MessageType = require('./js/MessageType');
/** CommandType Import. */
const CommandType = require('./js/CommandType');

//  Server Variables
/** A boolean for whether or not the system WebSocket client is ready to be saved. */
let systemClientReady = false;
/** The WebSocket client that controls the physical system. */
let systemClient = null;

//  Server Constants
/** The HTTP server used to create the WebSocket Server. */
const server = http.createServer();
/** The WebSocket Server. */
const wss = new WebSocket.Server({
    server: server,
    verifyClient: function(info, callback) {
        let queries = new URL(info.req.url, "http://" + info.req.headers.host).searchParams;
        let userToken = info.req.headers.token;
        let hashedUserToken = "";
        if(typeof userToken != "string") {
            userToken = info.req.headers["sec-websocket-protocol"];
            if(typeof userToken != "string") {
                callback(false);
            }
            else {
                userToken = userToken.replace("token", "");
                hashedUserToken = crypto.createHash('sha256').update(userToken).digest('hex');
            }
        }
        else {
            hashedUserToken = crypto.createHash('sha256').update(userToken).digest('hex');
        }

        if(hashedUserToken == process.env.TOKEN_SYSTEM) {
            systemClientReady = true;
            callback(true);
        }
        else if(hashedUserToken == process.env.TOKEN_CLIENT) {
            handleQueries(queries);
            callback(true);
        }
        else {
            callback(false);
        }
     }
});

//  Handle Server Events
//  Client Connected
wss.on('connection', function connection(ws) {
    if(systemClientReady) {
        systemClient = ws;
        systemClientReady = false;
        console.log(" > Local System connected.")
    }
    else {
        console.log(" > Standard Client connected.");
    }
        
    //  Message Received from Client
    ws.on('message', function incoming(message) {
        message = message.trim();

        //  Determine Sender Type
        let senderType = SenderType.CLIENT;
        if(ws===systemClient) {
            senderType = SenderType.SYSTEM;
        }

        //  Create P1Request Object
        const req = new P1Request(ws, senderType, message);
        
        //  Handle Request
        switch(req.msgType) {
            //  Broadcast Request Received
            case MessageType.BROADCAST:
                sendBroadcast(req);
                break;
            //  Command Received
            case MessageType.COMMAND:
                sendCommand(req);
                break;
            //  Ping/Pong
            case MessageType.PING:
                req.sender.send("#response=Pong!");
                break;
            //  Connection
            case MessageType.CONNECTION:
                req.sender.send("#connection=ACKNOWLEDGED");
                break;
            //  Keep-Alive
            case MessageType.KEEPALIVE:
                req.sender.send("#connection=keep-alive");
                break;
            //  Unhandled Message
            case MessageType.MESSAGE:
                console.log(" > " + req.senderType + " --> Message: " + req.msg);
                req.sender.send("#response=ACKNOWLEDGED");
                break;
        }
    });

    //  Client Disconnected
    ws.on('close', () => {
        if(ws===systemClient) {
            console.log(" > Local System disconnected.");
            systemClient = null;
        }
        else {
            console.log(" > Standard Client disconnected.");
        }
    });

    ws.send("#connection=CONNECTED");
});

//  General Functions
/**
 *  Handles the passed URL query search parameters and acting upon them if they are valid.
 *  Note: This method should be called _after_ authenticating the WebSocket client.
 */
function handleQueries(queryParams) {
    queryParams.forEach((value, key) => {
        // Determine query type.
        switch(key.toUpperCase()) {
            case "COMMAND":
            case "CMD":
                // The command to send to the system based on the query.
                let sysCMD = null;

                // Separate valid seconds argument from command (if command is OPEN).
                let seconds = value.match(/OPEN[1-9]/i);
                if(!seconds) {
                    // Default to 3 seconds.
                    seconds = "3";
                } else {
                    value = "OPEN";
                    seconds = seconds.toString().toUpperCase().replace("OPEN", "");
                }

                // Determine system command based on the query.
                switch(value.toUpperCase()) {
                    case "OPEN":
                        sysCMD = `#command=${CommandType.OPEN} ` + seconds;
                        value = value + " " + seconds;
                        break;
                    case "CLOSE":
                        sysCMD = "#command=" + CommandType.CLOSE;
                        break;
                    case "SYSUNLOCK":
                        sysCMD = "#command=" + CommandType.SYSTEM_UNLOCK;
                        break;
                    case "SYSLOCK":
                        sysCMD = "#command=" + CommandType.SYSTEM_LOCK;
                        break;
                    case "MUENABLE":
                        sysCMD = "#command=" + CommandType.MANUALUNLOCKS_ENABLE;
                        break;
                    case "MUDISABLE":
                        sysCMD = "#command=" + CommandType.MANUALUNLOCKS_DISABLE;
                        break;
                }

                // Ensure the system client is connected and active, then send the appropriate command based on the query.
                if(sysCMD && systemClient && systemClient.readyState === WebSocket.OPEN) {
                    systemClient.send(sysCMD);
                    console.log(` > Query --> ${key.toUpperCase()}: ${value}`);
                }
                break;
            case "BROADCAST":
                //  TODO [UNIMPLEMENTED] Reference P1Request. This part of code should work similarly. Broadcasts should not be sent back to the requester. QueryRequest.js?
                //  QueryRequest.js being a child of P1Request.js might be good. QueryRequest takes a single array of key:value queries instead of one msg string in constructor.
                //  At that point, redo above code (command section) to use sendCommand() to minimize the copies of the same code.
                break;
            case "LITERAL":
                //  [UNIMPLEMENTED]
                break;
        }
    });
}

/**
 * Broadcasts a message to every connected WebSocket client except for the sender of the passed P1Request.
 * @param {P1Request} request - the P1Request instance containing the request information, such as the sender, sender type, and message.
 */
function sendBroadcast(request) {
    console.log(" > " + request.senderType + " --> Broadcast: " + request.msgContent);
    request.sender.send("#response=ACCEPTED");
    wss.clients.forEach(function each(client) {
        if(client.readyState === WebSocket.OPEN && client !== request.sender) {
            client.send("#broadcast=" + request.msgContent);
        }
    });
}

/**
 * Sends a specific command to the system depending on the message sent within the passed P1Request.
 * @param {P1Request} request - the P1Request instance containing the request information, such as the sender, sender type, and message.
 */
function sendCommand(request) {
    //  Simplify Variable Access
    const sender = request.sender;
    const senderType = request.senderType;
    let msgContent = request.msgContent;

    //  Handle Command Based on CommandType
    switch(request.cmdType) {
        //  Door Close Request
        case CommandType.CLOSE: {
            console.log(" > " + senderType.toUpperCase() + " --> Close");
            sender.send("#response=ACCEPTED");
            
            //  Send command to interrupt any existing open door cycle and ensure that the solenoid is extended (door is locked).
            if(systemClient && systemClient.readyState === WebSocket.OPEN) {
                systemClient.send("#command=!security:lock");
            }
            break;
        }
        //  Door Open Request
        case CommandType.OPEN: {
            //  Determine Amount of Seconds
            let seconds = 3;
            if(msgContent.indexOf(" ")!=-1) {
                seconds = parseInt(msgContent.substring(msgContent.indexOf(" ") + 1));
                if(seconds<=0 || seconds>9 || isNaN(seconds)) {
                    seconds = 3;
                    request.send("#response=WARNING:NumberNotValid");
                }
            }
            
            console.log(" > " + senderType.toUpperCase() + " --> Open (" + seconds + " sec.)");
            sender.send("#response=ACCEPTED");

            //  Send command to start an open door cycle for the appropriate amount of seconds.
            if(systemClient && systemClient.readyState === WebSocket.OPEN) {
                systemClient.send("#command=!security:unlock " + seconds);
            }
            break;
        }
        //  System Lock Request
        case CommandType.SYSTEM_LOCK: {
            console.log(" > " + senderType.toUpperCase() + " --> System Lock");
            sender.send("#response=ACCEPTED");

            //  Send command to lock the system and prevent unauthorized users from unlocking the door.
            if(systemClient && systemClient.readyState === WebSocket.OPEN) {
                systemClient.send("#command=!security:system:lock");
            }
            break;
        }
        //  System Unlock Request
        case CommandType.SYSTEM_UNLOCK: {
            console.log(" > " + senderType.toUpperCase() + " --> System Unlock");
            sender.send("#response=ACCEPTED");

            //  Send command to unlock the system and allow anyone to unlock the door.
            if(systemClient && systemClient.readyState === WebSocket.OPEN) {
                systemClient.send("#command=!security:system:unlock");
            }
            break;
        }
        //  Disable Manual Unlocks
        case CommandType.MANUALUNLOCKS_DISABLE: {
            console.log(" > " + senderType.toUpperCase() + " --> Disable Manual Unlocks");
            sender.send("#response=ACCEPTED");

            //  Send command to disable manual unlocks of the system and door.
            if(systemClient && systemClient.readyState === WebSocket.OPEN) {
                systemClient.send("#command=!security:manualunlocks:disable");
            }
            break;
        }
        //  Enable Manual Unlocks
        case CommandType.MANUALUNLOCKS_ENABLE: {
            console.log(" > " + senderType.toUpperCase() + " --> Enable Manual Unlocks");
            sender.send("#response=ACCEPTED");

            //  Send command to enable manual unlocks of the system and door.
            if(systemClient && systemClient.readyState === WebSocket.OPEN) {
                systemClient.send("#command=!security:manualunlocks:enable");
            }
            break;
        }
        //  Poke
        case CommandType.POKE: {
            console.log(" > " + senderType.toUpperCase() + " --> Poke");
            sender.send("#response=Poked!");

            wss.clients.forEach(function each(client) {
                if(client.readyState === WebSocket.OPEN && client !== systemClient) {
                    client.send("#command=" + msgContent);
                }
            });
            break;
        }
        //  Ping
        case CommandType.PING: {
            console.log(" > " + senderType.toUpperCase() + " --> System Ping");

            //  Send command to ping the system.
            if(systemClient && systemClient.readyState === WebSocket.OPEN) {
                systemClient.send("#command=ping");
            }

            //  [UNIMPLEMENTED] Shouldn't be anything else in this block, besides maybe saving a reference to the client awaiting a ping response from the system.
            //  There needs to be additional code to handle these clients and their requests, and ping responses will expire after some time.
            //  If a ping request expires, a notification should be sent to the client that sent the request that a response was not received in time and the request expired.
            //  Normally, system should send a response ping back to the server, then the server sends a ping response to the original client.
            //  The client should remain responsible for noting the time it took since they sent the request to the server, and received the final response from the server.
            break;
        }
        //  Command Not Recognized -- Unknown
        case CommandType.UNKNOWN:
        default:
            sender.send("#response=WARNING:CMDNotRecognized");
            break;
    }
}

//  Start listening for connections.
server.listen(8080);