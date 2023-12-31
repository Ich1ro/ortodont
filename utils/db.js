const { Knex } = require('knex')
const knex = require('knex')
const { Logger } = require('./logger')

exports.DB = class DB {
    static db = null

    static init() {
        if (!DB.db) {
            DB.db = knex({
                client: 'pg',
                connection: {
                    host: process.env.DB_HOST,
                    port: process.env.DB_PORT,
                    database: process.env.DB_NAME,
                    user: process.env.DB_USER,
                    password: process.env.DB_PASSWORD
                }
            })
        }
    }

    /**
     * @returns {Knex<TRecord, TResult>} Instance
     */
    static get pg() {
        if (!DB.db) {
            Logger.e("utils -> DB -> pg: Instance does not exist.")
        }
        return DB.db
    }
}
