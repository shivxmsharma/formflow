const { Sequelize } = require("sequelize");

// Render provides a DATABASE_URL connection string for PostgreSQL
// We use that in production, individual vars in development
const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: "postgres",
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false, // required for Render's managed PostgreSQL
            },
        },
        logging: false,
    })
    : new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 5432,
            dialect: "postgres",
            logging: process.env.NODE_ENV === "development" ? console.log : false,
            pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
        }
    );

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ PostgreSQL connected successfully");
        await sequelize.sync({ alter: true });
        console.log("✅ All models synced");
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };