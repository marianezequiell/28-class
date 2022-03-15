
module.exports = process.on("message", numero => {
    let result = 0

    for(let i = 0; i < numero; i++) {
        result += i
    }

    process.send(result)
})