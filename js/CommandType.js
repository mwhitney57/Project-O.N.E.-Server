module.exports = {
    /**
     * A placeholder type indicating that the command does not match and is invalid.
     */
    UNKNOWN: "UNKNOWN",
    /**
     * The command for locking the door by letting the solenoid extend.
     * 
     * Alias: LOCK
     */
    CLOSE: "!security:lock",
    /**
     * The command for unlocking the door by retracting the solenoid.
     * 
     * Alias: UNLOCK
     */
    OPEN: "!security:unlock",
    /**
     * The command for locking the door lock system.
     */
    SYSTEM_LOCK: "!security:system:lock",
    /**
     * The command for unlocking the door lock system.
     */
    SYSTEM_UNLOCK: "!security:system:unlock",
    /**
     * The command for disabling manual unlocks on the system.
     */
    MANUALUNLOCKS_DISABLE: "!security:manualunlocks:disable",
    /**
     * The command for enabling manual unlocks on the system.
     */
    MANUALUNLOCKS_ENABLE: "!security:manualunlocks:enable",
    /**
     * The command for poking (notifying) any active client/controller users.
     * 
     * It is unlikely to have use in the opposite direction (Client --> System).
     */
    POKE: "notification:poke",
    /**
     * The command for pinging the server.
     */
    PING: "ping"
 }