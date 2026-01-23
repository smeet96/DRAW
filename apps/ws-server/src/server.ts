import express, { json } from "express"
import { WebSocket, WebSocketServer } from "ws"
import jwt  from "jsonwebtoken"
import { JWT_SECRET } from "@repo/common-backend/config"
import { prisma } from "@repo/db"

const app = express()
const httpserver = app.listen(5656)
const wss = new WebSocketServer({server:httpserver})

interface User {
    ws : WebSocket
    rooms : string[]
    userId : string
}

const users:User[] = []

function verify (token:string):null | string {
try {
    const decoded = jwt.verify(token,JWT_SECRET)
    
    if(typeof decoded === 'string'){
        return null
    }
    
    if(!decoded || !decoded.userId){
        return null
    }
    
    return decoded.userId
} catch (error) {
    return null
}

}

wss.on('connection',function server(ws,request){
    const url = request.url
    if(!url || !JWT_SECRET){
        return
    }

    const queryparams = new URLSearchParams(url.split('?')[1])
    const token = queryparams.get('token') || ""
    const userId = verify(token)
    
    if(userId == null){
        ws.close()
        return
    }

    users.push({
       userId ,
       rooms : [],
       ws
    })

    ws.on('message',async function msg(data){
        try {
            const parsedData = JSON.parse(data as unknown as string)
            
            if(parsedData.type === 'join_room' && parsedData.roomId){
            const user = users.find(x => x.ws === ws)
            if(user && !user.rooms.includes(parsedData.roomId)){
                user.rooms.push(parsedData.roomId);
            }
            }

            if(parsedData.type === 'leave_room' && parsedData.roomId){
                const user = users.find(x => x.ws === ws)
                if(user && user.rooms.includes(parsedData.roomId)){
                  user.rooms = user.rooms.filter(x => x !== parsedData.roomId)
                }
            }


            if(parsedData.type === 'chat' && parsedData.roomId && typeof parsedData.message !== 'undefined'){
                const roomId = parsedData.roomId
                const message = parsedData.message

            await prisma.chat.create({
                data:{
                    message,
                    userId,
                    roomId
                }
            })

            users.forEach(user => {
           if(user.rooms.includes(roomId) && user.ws !== ws){
            user.ws.send(JSON.stringify({
                type:"chat",
                message:message,
                roomId
            }))
           }
            })
            }
        } catch (error) {
            console.error(error)
        }
    })
})