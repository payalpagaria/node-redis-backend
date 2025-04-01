import express ,{type Request} from "express"
import { validateHandler } from "../middlewares/validate"
import { RestaruntDetailSchema, RestaruntSchema, type Restaurant, type RestaurantDetails } from "../schemas/restraunt"
import { InitializeClient } from "../utils/client"
import { nanoid } from "nanoid"
import { cuisineKey, cuisineKeyById, cuisinesKey, indexKey, restaurantByRatingkey, restaurantDetailsKey, restrauntKeyById, reviewDetailsKeyById,  reviewKeyById, weatherkeyById } from "../utils/keys"
import { errorResponse, sucessResponse } from "../utils/responses"
import { checkRestaurants } from "../middlewares/checkRestaurnats"
import { reviewSchema, type Review } from "../schemas/review"
const router=express.Router()
router.get('/', async(req,res,next)=>{
    const {page=1,limit=10}=req.query
    const start=(Number(page)-1)*Number(limit)
    const end=start+Number(limit)
    try {
        const client=await InitializeClient()
        const resturantIds=await client.zRange(
            restaurantByRatingkey,
            start,
            end,{
                REV:true
            }
        )
        const restraunts=await Promise.all(
            resturantIds.map((id)=> client.hGetAll(restrauntKeyById(id)))
        ) 
        sucessResponse(res,restraunts)
    } catch (error) {
        next(error)
    }
})
router.post('/', validateHandler(RestaruntSchema), async (req, res) => {
    const data = req.body as Restaurant;
    try {
      const client = await InitializeClient();
      const id = nanoid();
      const restaurantKey = restrauntKeyById(id);
      const hashdata = { id, name: data.name, location: data.location };
  
      await Promise.all([
        ...(data.cuisines?.flatMap((cuisine) => [
          client.sAdd(cuisinesKey, cuisine),            // All cuisines available
          client.sAdd(cuisineKey(cuisine), id),         // Cuisines -> restaurant IDs
          client.sAdd(cuisineKeyById(id), cuisine),     // Restaurant ID -> cuisines
        ]) || []),
        client.hSet(restaurantKey, hashdata),
        client.zAdd(restaurantByRatingkey,{
            score:0,
            value:id
        })
      ]);
  
      sucessResponse(res, hashdata, "Added new restaurant");
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });
  router.get('/:resturantId/weather',checkRestaurants,async(req:Request<{resturantId:string}>,res,next)=>{
    const {resturantId}=req.params

        try {
            const client=await InitializeClient();
            const restaurantkey=restrauntKeyById(resturantId);
            const weather=weatherkeyById(resturantId)
            const cachedWeather=await client.get(weather)
            if(cachedWeather){
                console.log('cache hit')
                sucessResponse(res,JSON.parse(cachedWeather))
            }
            const coord=await client.hGet(restaurantkey,"location") //location is the feild i wanna retrive restaurantkey is the hash for restaurant
            if(!coord){
                errorResponse(res,404,"Cordinates not found")
            }
            const [lng,lat]=coord.split(',')
            const apiResponse=await fetch(`https://api.openweathermap.org/data/2.5/weather?units=imperial&lat=${lat}&lon=${lng}&appid=${process.env.WEATHER_API_KEY}`)
            if (apiResponse.status === 200) {
                const json = await apiResponse.json();

                await client.set(weather, JSON.stringify(json), {
                  EX: 60 * 60,
                });
                 sucessResponse(res, json);
              }
               errorResponse(res, 500, "Couldnt fetch weather info");
        } catch (error) {
            next(error)
        }
  })

  router.post('/:resturantId/details',checkRestaurants, async(req:Request<{resturantId:string}>,res,next) => {
      const { resturantId } = req.params;
      console.log(resturantId,'ferf')
      const data = req.body as RestaurantDetails;
  
      try {
        const client = await InitializeClient();
        const keyrest = restaurantDetailsKey(resturantId);
        await client.json.set(keyrest, ".", data);
         sucessResponse(res, {}, "Restaurant details added");
      } catch (error) {
        next(error);
      }
    }
  );
router.get('/:resturantId/details',checkRestaurants, async(req:Request<{resturantId:string}>,res,next)=>{
    const {resturantId}=req.params

    try {
        const client=await InitializeClient()
        const detailskey=restaurantDetailsKey(resturantId)
        const details=await client.json.get(detailskey)
        sucessResponse(res,details)
    } catch (error) {
        next(error)
    }
})
router.get('/search',async(req,res,next)=>{
    const {q}=req.query
    try {
        const client=await InitializeClient()
        const results=await client.ft.search(indexKey,`@name:${q}`)
        sucessResponse(res,results)
    } catch (error) {
        next(error)
    }
})
router.post('/:restaurant/review',validateHandler(reviewSchema),checkRestaurants, async(req:Request<{restaurant:string}>,res,next)=>{
    const {restaurant}=req.params
    const data=req.body as Review
    try {
        const reviewId=nanoid();
        const client=InitializeClient();
        const reviewKey=reviewKeyById(restaurant) //review related to resturant key one specific restaurant
        const reviewDetailsKey=reviewDetailsKeyById(reviewId)
        const restaurantKey=restrauntKeyById(restaurant)
        const reviewData={id:reviewId,...data,timeStamp:Date.now(),restaurant}
        const[reviewCount,setResult,totalScore]=await Promise.all([
            (await client).lPush(reviewKey,reviewId),
            (await client).hSet(reviewDetailsKey,reviewData),
            (await client).hIncrByFloat(restaurantKey,"totalstars",  parseFloat(data.rating)
        )
        ])
        const avgRating=Number(totalScore/reviewCount).toFixed(1)
        await Promise.all([
            (await client).zAdd(restaurantByRatingkey,{
                score: Number(avgRating),
                value:restaurant
            }),
            (await client).hSet(restaurantKey,"avgStars",avgRating)
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

        const [restaurant,cuisines]=await Promise.all([
          

            client.hGetAll(resturantkey),
            client.sMembers(cuisineKeyById(resturantId))
            
        ]
        )
        sucessResponse(res,{...restaurant,cuisines})


    } catch (error) {
        next(error)
    }
})

export default router