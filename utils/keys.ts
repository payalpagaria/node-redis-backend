export function getKeyName(...args:string[]){
    return `bites:${args.join(":")}`
}
export const restrauntKeyById=(id:string)=>getKeyName("restaurant",id)