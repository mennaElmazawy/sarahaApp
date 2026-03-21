import cron from 'node-cron';
import userModel from './DB/models/users.model.js';


cron.schedule('* * * * *', async () => {
    try {
        const expireTime = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const result = await userModel.deleteMany({
            confirmed: { $exists: false },
            createdAt: { $lte: expireTime }
        });

        console.log(`Deleted ${result.deletedCount} unconfirmed users`);
    } catch (error) {
        console.error("Cron job error:", error);
    }
});