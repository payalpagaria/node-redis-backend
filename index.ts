import express from "express"
import restrauntsRouter from './Routes/restraunts'
import cuisineRouter from './Routes/cuisines'
import { errorHandler } from "./middlewares/erroHandler"
const port=process.env.PORT||3000
const app=express()
app.use(express.json())
app.use('/restraunts',restrauntsRouter)
app.use('/cuisines',cuisineRouter)
app.use(errorHandler)
app.listen(port,()=>{
    console.log(`Server started http://localhost:${port}`)
}).on("error",(error)=>{
    throw new Error(error.message)
})
