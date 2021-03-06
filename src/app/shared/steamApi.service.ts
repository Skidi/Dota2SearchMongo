import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import "rxjs";
import { mergeMap, map} from 'rxjs/operators';
import { forkJoin } from "rxjs";

@Injectable()
export class SteamService {
    apiKey = "BD496BFA7696FD5DE7D3FF190B371B1B";

    constructor(private http:HttpClient) {}

    //get inventory and user details -> merge them and send.
    userSteam(steamId) {
        let mergedInfo = forkJoin(
            this.getInventory(steamId), 
            this.getDetails(steamId)
        ).pipe(
            map(([inventory, summary]) => {
                if(inventory["result"].status === 1){
                    return { inventory, summary }
                }                                
            })
        )
        return mergedInfo;
    }

    //get user details
    getDetails(steamId){
        return this.http.get("https://Dota2Inventory.com/getDetails", {params:{steamId: steamId}});
    }
    //get player inventory details
    getInventory(steamId) {
        return this.http.get("https://Dota2Inventory.com/getInventory", {params:{steamId: steamId}});
    }

    //get list of friends
    getFriends(steamId) {
        return this.http.get("https://Dota2Inventory.com/getFriendList", {params:{steamId: steamId}}).pipe(
        mergeMap(
                (res) => {                    
                    let friends = [];
                    for (let friend of res["friendslist"].friends){
                        friends.push(this.userSteam(friend.steamid));
                    }
                    return forkJoin(friends);
                }                  
            )
        )
    }   

    //get items that property name contains string
    getItemThatContains(string){
        return this.http.get("https://Dota2Inventory.com/checkString", {params: {itemString: string}});
    }
    //get specific item
    getItem(index){
        return this.http.get("https://Dota2Inventory.com/mysql", {params: {itemIndex: index}});        
    }

    login(){
        return this.http.get("https://Dota2Inventory.com/auth");
    }

}