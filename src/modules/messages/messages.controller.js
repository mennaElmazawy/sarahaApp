import { Router } from "express";
import * as MS from "./messages.services.js"
import * as MV from "./messages.validation.js"
import { multer_local } from "../../common/middleware/multer.js";
import { multerEnum } from "../../common/enum/multer.enum.js";
import { validation } from "../../common/middleware/validation.js";
import { authentication } from "../../common/middleware/authentication.js";

const messagesRouter = Router({caseSensitive: true ,strict: true ,mergeParams: true });

messagesRouter.post("/send",
    multer_local({
        custom_path: "messages",
        custom_types: multerEnum.image
    }).array("attachments", 3),
    validation(MV.sendMessageSchema)
    , MS.sendMessage
)

messagesRouter.get("/getMessage/:messageId",
    authentication,
    validation(MV.getMessageSchema),
    MS.getMessage
)
messagesRouter.get("/getAllMessages",
    authentication,
    MS.getAllMessages
)




export default messagesRouter;