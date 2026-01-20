import express from "express"
import { WebSocketServer } from "ws"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/common-backend/config"

const app = express()
const httpserver = app.listen(5656)
const wss = new WebSocketServer({server:httpserver})

wss.on('connection',function server(ws,request){
    const url = request.url
    if(!url || !JWT_SECRET){
        return
    }

    const queryparams = new URLSearchParams(url.split('?')[1])
    const token = queryparams.get('token') || ""
    const decoded = jwt.verify(token,JWT_SECRET)
    if (decoded){
        //@ts-ignore
        userId = decoded.userId
    }else{
        ws.close()
    }
})