import { CreateRoomSchema, SigninSchema, UserSchema } from "@repo/common"
import { JWT_SECRET } from "@repo/common-backend/config"
import { prisma } from "@repo/db"
import express from "express"
import jwt from "jsonwebtoken"
import { middleware } from "./middleware"

const app = express()
app.use(express.json())

app.post('/signup', async (req,res) => {
    const body = req.body
    const parse = UserSchema.safeParse(body)
    if(!parse.success){
        res.status(403).json({
            message : "invalid schema"
        })
        return
    }
const {username , email , password} = parse.data
try {
 const user = await prisma.user.create({
        data:{
            name :username,
            email,
            password
        }
    })
    res.status(200).json({user_created : user})
} catch (error) {
    res.status(403).json({
        message : "signup failed",
        error : error
    })
}

})

app.post('/signin', async(req,res)=> {
    const body = req.body
    const parse = SigninSchema.safeParse(body)
    if(!parse.success){
res.status(403).json({
    message : "invalid schema"
})
return
    }
const {email , password} = parse.data

try {
    const user = await prisma.user.findUnique({
        where:{
            email,
            password
        }
    })
    if(!user){return}
    const userId = user?.id
    const token = jwt.sign(userId,JWT_SECRET)
    res.status(200).json(token)
} catch (error) {
    res.status(403).json({
        message : "signin failed",
        error : error
    })
}

})

app.post('/room',middleware,async(req,res)=> {
    const parse = CreateRoomSchema.safeParse(req.body)
    if(!parse.success){
        res.status(403).json({
            message : "invalid schema"
        })
        return
    }
    //@ts-ignore
    const userId = req.id
try {
    const room = await prisma.room.create({
        data:{
            slug : parse.data.slug,
            adminId : userId
        }
    })
    res.json({
        roomId: room.id
    })
} catch (error) {
    res.status(411).json({
        message : "room already exists with this name"
    })
}
})

app.get('/chats/:roomId',async (req,res) => {
    try {
    const roomId = Number(req.params.roomId)
    
 const chats = await prisma.chat.findMany({
    where:{
        roomId:roomId
    },
    orderBy : {
        id : 'desc'
    },
    take : 1000
})
res.json({
   chats
})
    } catch (error) {
        console.log(error)
        res.json({
            chats : []
        })
    }
})


app.get('/room/:slug',async (req,res)=> {
    const slug = req.params.slug
    const room = await prisma.room.findUnique({
        where:{
            slug
        }
    })
    res.json({
        room
    })
})

app.listen(8080)