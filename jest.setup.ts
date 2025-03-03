module.exports = async () => {
    process.env.MONGODB_URI = (global as any).__MONGO_URI__;
};