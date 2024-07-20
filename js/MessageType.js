module.exports = {
    /**
     * A broadcast message intended to be sent to every connected WebSocket.
     */
    BROADCAST: "#broadcast=",
    /**
     * A command message for sending commands to the system.
     */
    COMMAND: "#command=",
    /**
     * A ping from the sender waiting to be ponged by the server.
     */
    PING: "#ping",
    /**
     * A message relating to the connection between a WebSocket and the server.
     */
    CONNECTION: "#connection=",
    /**
     * A type of CONNECTION message intended to keep the clients and server active and alive.
     */
    KEEPALIVE: "#connection=keep-alive",
    /**
     * A generic message of no discernable type.
     */
    MESSAGE: ""
 }