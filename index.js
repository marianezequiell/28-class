const yargs = require('yargs/yargs')(process.argv.slice(2))
const args = yargs
    .default({
        port: 8080
    })
    .argv

const express = require('express')
const { Router } = express
const Contenedor = require('./Contenedor.js')
const { options } = require('./config')
const { mongoUrl } = require('./config')

const calculo = require('./calculo')
const { fork } = require('child_process')

const cookieParser = require('cookie-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')

const normalizr = require('normalizr')
const normalize = normalizr.normalize
const schema = normalizr.schema

const FakeContenedor = require('./FakeContenedor')

const { Server: HttpServer } = require('http')
const { Server: IOServer } = require('socket.io')

const app = express()

const router = Router()
const log = Router()

app.use(cookieParser())
app.use(session({
    store: new MongoStore({mongoUrl: mongoUrl}),
    secret: "prueba",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60000
    }
}))

let seeProducts = new Contenedor(options, 'products')
let fakeContenedor = new FakeContenedor(5)

//Normalizr

const authorSchema = new schema.Entity('author')
const textSchema = new schema.Entity('text')

const postSchema = new schema.Entity('posts', {
    author: authorSchema,
    text: textSchema
})

//WEBSOCKET
const httpserver = new HttpServer(app)
const io = new IOServer(httpserver)

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/', express.static(__dirname + '/views'))
app.use('/public', express.static(__dirname + '/public'))

app.set('view engine', 'ejs')
app.set('views', './views')

let clientMessages = []
io.on('connection', socket => {

    socket.emit('back', clientMessages)

    socket.on('newProduct', () => {
        (async function () {
            let data = await seeProducts.getAll()
            const lastItem = data.length - 1
            io.sockets.emit('new-product-emition', data[lastItem])
            io.sockets.emit(data)
        })()
    })
    
    socket.on('notification', data => {
        
        data.id = clientMessages.length
        data.text.id = clientMessages.length
        clientMessages.push(data)
        
        const normalizedPosts = normalize(clientMessages, [postSchema])
        io.sockets.emit('back', normalizedPosts)
    })  
})

//RUTAS
router.get('/', (req, res) => {
    (async function () {
        let data = await fakeContenedor.getAll()
        res.render('index', {title: 'Coderhouse', data: data})       
    })()
})

router.get('/:id', async (req, res) => {
    let result = await seeProducts.getById(req.params.id)
    if(result === null) {
        result = { error : 'producto no encontrado' }
        console.log('producto no encontrado')
    }
    res.send(JSON.stringify(result))
})

router.post('/', async (req, res) => {
    const id = await seeProducts.save(req.body)
    res.json(id)
})

router.delete('/:id', async (req, res) => {
    let result = await seeProducts.getById(req.params.id)
    if(result === null) {
        res.send(result = { error : 'producto no encontrado' })
    } else {
        await seeProducts.deleteById(req.params.id)
        res.send("Eliminación correcta")    
    }
})

router.delete('/', async (req, res) => {
    const result = await seeProducts.deleteAll()
    res.send(result)
})

router.put('/:id', async (req, res) => {
    const id = req.params.id
    const result = await seeProducts.update(id, req.body)
    
    result == 1 ? res.send("Producto actualizado") : res.send({ error : 'producto no encontrado' })
})

//LOGIN - LOGOUT

log.get('/login', (req, res) => {
    if (req.session.user) {
        res.render('login', {loged: true, userName: req.session.user})
        console.log(req.session.user)
    } else {
        res.render('login', {loged: false, userName: ""})
    }
})

log.post('/login', async (req, res) => {
    req.session.user = await req.body.user
    res.redirect('/account/login')
})

log.get('/logout', (req, res) => {
    let userName = req.session.user
    req.session.destroy()
    res.render('logout', {userName: userName})
})

//INFO
app.get('/info', (req, res) => {

    //Obtenemos folder en que se encuentra el archivo
    var indices = [];
    var dir = process.cwd()
    var element = '\\';
    var idx = dir.indexOf(element);

    while (idx != -1) {
      indices.push(idx);
      idx = dir.indexOf(element, idx + 1);
    }

    let folder = dir.slice(indices[indices.length - 1])

    res.send({
        args: args,
        so: process.platform,
        vs: process.version,
        memory: process.memoryUsage(),
        path: process.cwd(),
        pid: process.pid,
        folder: folder
    })

})

//Cálculo
app.get('/api/randoms', (req, res) => {

    let suma = fork('./calculo.js')
    
    suma.send(req.query.cant)
    suma.on('message', sum => {
        res.json(`La suma es ${sum}`)
    })
})

app.use('/api/productos', router)
app.use('/account', log)
httpserver.listen(args.port)