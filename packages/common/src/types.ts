import z from "zod"

export const UserSchema = z.object({
    username : z.string().min(3).max(20),
    email : z.email(),
    password : z.string()
})

export const SigninSchema = z.object({
    email : z.email(),
    password : z.string()
})

export const CreateRoomSchema = z.object({
    slug : z.string().min(3).max(20)
})