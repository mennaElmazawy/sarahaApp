import { EventEmitter } from "node:events"

export const eventEmitter = new EventEmitter()

eventEmitter.on("confirmEmail", async (fn) => {
    try {
        await fn()
    } catch (error) {
        console.log("Error in confirmEmail event:", error);

    }
})