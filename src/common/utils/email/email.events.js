import { EventEmitter } from "node:events"
import { emailEnum } from "../../enum/email.enum.js";

export const eventEmitter = new EventEmitter()

eventEmitter.on(emailEnum.confirmEmail, async (fn) => {
    try {
        await fn()
    } catch (error) {
        console.log("Error in confirmEmail event:", error);

    }
})
eventEmitter.on(emailEnum.forgetPassword, async (fn) => {
    try {
        await fn()
    } catch (error) {
        console.log("Error in forgetPassword event:", error);

    }
})
eventEmitter.on(emailEnum.enable2FA, async (fn) => {
    try {
        await fn()
    } catch (error) {
        console.log("Error in enable2FA event:", error);

    }
})
eventEmitter.on(emailEnum.disable2FA, async (fn) => {
    try {
        await fn()
    } catch (error) {
        console.log("Error in disable2FA event:", error);

    }
})