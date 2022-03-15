const faker = require('faker')

class FakeContenedor {
    constructor (q) {
        this.cantidad = q
        this.faker = faker
    }

    getRandomNumber (min, max) {
        return Math.floor(Math.random() * (max - min) + min)
    }

    async getAll () {
        let fakeData = []
        for (let i = 0; i < this.cantidad; i++) {
            let cat = {id: undefined, title: undefined, price: undefined, thumbnail: undefined}
            cat.id = i
            cat.price = this.getRandomNumber (250, 500)
            cat.title = await this.faker.animal.cat()
            cat.thumbnail = await this.faker.image.cats()
            fakeData.push(cat)
        }
        return fakeData
    }
}

module.exports = FakeContenedor