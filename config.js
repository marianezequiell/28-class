require('dotenv').config()

module.exports = {
    options: {
        client: process.env.CLIENT,
        connection: {
            host: process.env.HOST,
            port: process.env.PORTMDB,
            user: process.env.USER,
            password: process.env.PASSWORD,
            database: process.env.DATABASE 
        }
    },
    mongoUrl: process.env.MONGOURL
}