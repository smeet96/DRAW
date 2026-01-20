import express from "express"

const app = express()
app.use(express.json())

app.get('/', (req,res) => {
    res.json({
        message : 'message from get endpoint'
    })
})

app.listen(8080)