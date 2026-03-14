import userModel from "../../DB/models/users.model.js";


export const countProfileVisits = async (req, res, next) => {
    const userId = req.params.id;
    const user = await userModel.findById(userId);
    if (!user) {
        throw new Error("User not found", { cause: 404 });
    }
   await userModel.findByIdAndUpdate(userId, { $inc: { visitCount: 1 } }, { new: true });
    next();
}