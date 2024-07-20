'use strict';

/** MessageType Import. */
const MessageType = require('./MessageType');
/** CommandType Import. */
const CommandType = require('./CommandType');

module.exports = class P1Request {
    /**
     * A `WebSocket` object for the sender of this `P1Request`.
     */
    sender;
    /**
     * A `SenderType` representing the type of `WebSocket` connection that the sender is.
     * 
     * The options are simply SYSTEM or CLIENT.
     */
    senderType;
    /**
     * A `MessageType` representing the type of message received from the sender.
     */
    msgType;
    /**
     * A string containing the raw message from the sender.
     */
    msg;
    /**
     * A string containing the message's content.
     * A message's content is considered everything after the message's type declaration.
     * 
     * Example: `#broadcast={MESSAGE_CONTENT_HERE}`
     */
    msgContent;
    /**
     * A `CommandType` representing the type of command received from the sender.
     * 
     * This will have no value if `msgType !== MessageType.COMMAND`.
     */
    cmdType;

    /**
     * Constructs a new `P1Request` holding the passed information.
     * @param {WebSocket} sender 
     * @param {SenderType} senderType 
     * @param {string} msg 
     */
    constructor(sender, senderType, msg) {
        this.sender = sender;
        this.senderType = senderType;
        this.msg = msg;
        this.msgContent = this.msg.substring(this.msg.indexOf("=") + 1).trim();

        //  Determine MessageType
        if(this.msg.startsWith(MessageType.BROADCAST)) {
            this.msgType = MessageType.BROADCAST;
        }
        else if(this.msg.startsWith(MessageType.COMMAND)) {
            this.msgType = MessageType.COMMAND;
        }
        else if(this.msg.startsWith(MessageType.PING)) {
            this.msgType = MessageType.PING;
        }
        else if(this.msg.startsWith(MessageType.KEEPALIVE)) {
            this.msgType = MessageType.KEEPALIVE;
        }
        else if(this.msg.startsWith(MessageType.CONNECTION)) {
            this.msgType = MessageType.CONNECTION;
        }
        else {
            this.msgType = MessageType.MESSAGE;
        }

        //  If of Command MessageType, Determine CommandType
        if(this.msgType == MessageType.COMMAND) {
            if(this.msgContent.startsWith(CommandType.OPEN)) {
                this.cmdType = CommandType.OPEN;
            }
            else if(this.msgContent.startsWith(CommandType.CLOSE)) {
                this.cmdType = CommandType.CLOSE;
            }
            else if(this.msgContent.startsWith(CommandType.SYSTEM_UNLOCK)) {
                this.cmdType = CommandType.SYSTEM_UNLOCK;
            }
            else if(this.msgContent.startsWith(CommandType.SYSTEM_LOCK)) {
                this.cmdType = CommandType.SYSTEM_LOCK;
            }
            else if(this.msgContent.startsWith(CommandType.MANUALUNLOCKS_ENABLE)) {
                this.cmdType = CommandType.MANUALUNLOCKS_ENABLE;
            }
            else if(this.msgContent.startsWith(CommandType.MANUALUNLOCKS_DISABLE)) {
                this.cmdType = CommandType.MANUALUNLOCKS_DISABLE;
            }
            else if(this.msgContent.startsWith(CommandType.PING)) {
                this.cmdType = CommandType.PING;
            }
            else if(this.msgContent.startsWith(CommandType.POKE)) {
                this.cmdType = CommandType.POKE;
            }
            else {
                this.cmdType = CommandType.UNKNOWN;
            }
        }
    }
}
