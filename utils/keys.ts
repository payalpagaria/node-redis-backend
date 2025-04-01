export function getKeyName(...args:string[]){
    return `bites:${args.join(":")}`
}
export const restrauntKeyById=(id:string)=>getKeyName("restaurant",id)
export const reviewKeyById=(id:string)=>getKeyName("review",id)
export const reviewDetailsKeyById=(id:string)=>getKeyName("review_details",id)
export const cuisinesKey=getKeyName("cuisines")
export const cuisineKey=(name:string)=>getKeyName("cusine",name)
export const cuisineKeyById=(id:string)=>getKeyName("Restaurant_cuisine",id)
export const restaurantByRatingkey=getKeyName("restaurant_Rating_key")
export const weatherkeyById=(id:string)=>getKeyName("weather_key",id)
export const restaurantDetailsKey=(id:string)=>getKeyName('restaurant_details',id)