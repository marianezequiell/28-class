const { options } = require('./MariaDB.js')
const knex = require('knex')(options)

knex.schema.createTable('products', table => {
    table.increments('id');
    table.string('title');
    table.string('thumbnail');
    table.float('price');
})
    .then(() => console.log('table created'))
    .catch((err) => {
        console.log(err) 
        throw err
    })
    .finally(() => {
        knex.destroy()
    })