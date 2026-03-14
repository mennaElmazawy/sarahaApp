
import { PREFIX, SECRET_KEY } from "../../../config/config.service.js";
import * as db_service from "../../DB/db.service.js"
import revokeTokenModel from "../../DB/models/revokeToken.model.js";
import userModel from "../../DB/models/users.model.js";
import { get, revoked_key } from "../../DB/redis/redis.service.js";
import { VerifyToken } from "../utils/token.service.js";

export const authentication = async (req, res, next) => {


    const { authorization } = req.headers;

    if (!authorization) {
        throw new Error("token not exist", { cause: 401 })
    }

    const [prefix, token] = authorization.split(" ");
    if (prefix !== PREFIX) {
        throw new Error("invalid prefix", { cause: 401 })
    }

    const decoded = VerifyToken({ token, secret_key: SECRET_KEY })
    if (!decoded || !decoded?.id) {
        throw new Error("invalid token", { cause: 401 })
    }

    const user = await db_service.findById({ model: userModel, id:decoded.id, select: "-password" })
    if (!user) {
        throw new Error("user not exist", { cause: 404 })
    }
    if (user?.changeCredential?.getTime() > decoded.iat * 1000) {
        throw new Error("invalid token", { cause: 401 })
    }

    const revokeToken = await get(revoked_key({ userId: decoded.id, jti: decoded.jti }));
    if (revokeToken) {
        throw new Error("invalid token Revoked", { cause: 401 })
    }
 
    req.user = user;
    req.decoded= decoded;
    next()
}



