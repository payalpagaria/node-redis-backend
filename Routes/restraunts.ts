import express ,{type Request} from "express"
import { validateHandler } from "../middlewares/validate"
import { RestaruntSchema, type Restaurant } from "../schemas/restraunt"
import { InitializeClient } from "../utils/client"
import { nanoid } from "nanoid"
import { restrauntKeyById, reviewDetailsKeyById,  reviewKeyById } from "../utils/keys"
import { errorResponse, sucessResponse } from "../utils/responses"
import { checkRestaurants } from "../middlewares/checkRestaurnats"
import { reviewSchema, type Review } from "../schemas/review"
import { date, nan } from "zod"
import { timeStamp } from "console"
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
router.post('/:resturantId/review',validateHandler(reviewSchema),checkRestaurants, async(req:Request<{resturantId:string}>,res,next)=>{
    const {resturantId}=req.params
    const data=req.body as Review
    try {
        const reviewId=nanoid();
        const client=InitializeClient();
        const reviewKey=reviewKeyById(resturantId) //review related to resturant key one specific restaurant
        const reviewDetailsKey=reviewDetailsKeyById(reviewId)
        const reviewData={id:reviewId,...data,timeStamp:Date.now(),resturantId}
        await Promise.all([
            (await client).lPush(reviewKey,reviewId),
            (await client).hSet(reviewDetailsKey,reviewData)
        ])
        sucessResponse(res,reviewData,"Review Added")
    } catch (error) {
        next(error)
    }

})
router.get('/:resturantId/reviews',checkRestaurants, async(req:Request<{resturantId:string}>,res,next)=>{
    const {resturantId}=req.params
    
    try {
      const client=await InitializeClient();
      const reviewKey=reviewKeyById(resturantId)
      const reviewIds=await client.lRange(reviewKey,0,4);
      const review_details=await Promise.all(
        reviewIds.map((id)=>client.hGetAll(reviewDetailsKeyById(id)))
      )
      sucessResponse(res,review_details)
    } catch (error) {
        next(error)
    }

})
router.delete('/:resturantId/reviews/:reviewId',checkRestaurants, async(req:Request<{resturantId:string,reviewId:string}>,res,next)=>{
    const {resturantId,reviewId}=req.params
    try {
        const client=await InitializeClient();
        const reviewKey=reviewKeyById(resturantId) //key to a list
        const reviewDetailsKey=reviewDetailsKeyById(reviewId)
        const [removeResult,deleteResult]=await Promise.all([
            client.lRem(reviewKey,0,reviewId), //remove something from list 0 will remove all of them 1 will delete 1 (checks the list for elemenet reviewid and delete it)
            client.del(reviewDetailsKey)
        ])
        if(removeResult===0 && deleteResult==0){
            errorResponse(res,404,"review not found")
        }
        sucessResponse(res,reviewId,"Review are deleted")
    } catch (error) {
        
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