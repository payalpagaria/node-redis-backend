import { SchemaFieldTypes } from "redis";
import { InitializeClient } from "../utils/client";
import {indexKey,getKeyName} from "../utils/keys"

async function createIndex() {
    const client=await InitializeClient()
    //we dont want overlapping index we want to rewrite it
    try {
        await client.ft.dropIndex(indexKey)
    } catch (error) {
        console.log("No existing index to delete")
    }

    await client.ft.create(indexKey,{
        id:{
            type:SchemaFieldTypes.TEXT,
            AS:"id"
        },
        name:{
            type:SchemaFieldTypes.TEXT,
            AS:"name"
        },
        avgStars:{
             type:SchemaFieldTypes.NUMERIC,
            AS:"avgStars",
            SORTABLE:true
        }
    },{
        ON:'HASH',
        PREFIX: getKeyName('restaruants') // all of the hashes we want to search from
    }
)
    //second para is redis search schema
}
//where do u want to actually index our data from

 createIndex();
process.exit()