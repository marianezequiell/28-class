const { default: knex } = require('knex')

class Contenedor {
    constructor (options, table) {
        this.options = options
        this.table = table
        this.knex = require('knex')(options)
    }

    async getAll() {
        try {
            const rows = await this.knex.from(this.table).select("*")
            return rows
        } catch(err) { 
            console.log(err)
        }
    }

    async getById(number) {
        try {
            let data = await this.knex.from(this.table).where('id', number).select('*')
            if(data.length > 0) {
                return data[0]
            } else {
                return null
            }    
        } catch(err) {
            console.log(err)
        }
    }

    async save(newItem) {
        try {
            const task = await this.knex.from(this.table).insert(newItem)
            return task[0]
        } catch (err) {
            console.log("save", err)
        }
    }

    async deleteById(number) {
        try {
            await this.knex.from(this.table).where('id', number).del()
        } catch(err) {
            console.log(err)
        }
    }

    async deleteAll() {
        try {
            await this.knex.from(this.table).del()
            return {'status': 'datos eliminados'}
        } catch(err) {
            console.log(err)
        }
    }

    async update(id, obj) {
        try {
            const modified = await this.knex.from(this.table).where('id', id).update(obj)
            return modified
        } catch(err) {
            console.log(err)
        }
    }

}

module.exports = Contenedor