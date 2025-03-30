import express ,{type Request} from "express"
import { validateHandler } from "../middlewares/validate"
import { RestaruntSchema, type Restaurant } from "../schemas/restraunt"
import { InitializeClient } from "../utils/client"
import { nanoid } from "nanoid"
import { restrauntKeyById } from "../utils/keys"
import { sucessResponse } from "../utils/responses"
import { checkRestaurants } from "../middlewares/checkRestaurnats"
const router=express.Router()
router.post('/',validateHandler(RestaruntSchema),async(req ,res)=>{
    const data=req.body as Restaurant
    try {
        const client=await InitializeClient();
        const id=nanoid()
        const restaurantKey=restrauntKeyById(id)
        const hashdata={id,name:data.name,location:data.location}
       const addResult= await client.hSet(restaurantKey,hashdata);
        sucessResponse(res,hashdata,"Added new restaurant")
    
    } catch (error) {
        console.log(error)
    }

})
router.get('/:resturantId',
    checkRestaurants,
    async(req:Request<{resturantId:string}>,res,next)=>{
    const {resturantId}=req.params
    try {
        const client=await InitializeClient();
        const resturantkey=restrauntKeyById(resturantId)
        const [viewCount,restaurant]=await Promise.all([
            client.hIncrBy(
                resturantkey,
                "viewCount",
                1
            ),

            client.hGetAll(resturantkey)
        ]
        )
        sucessResponse(res,restaurant)


    } catch (error) {
        next(error)
    }
})
export default router