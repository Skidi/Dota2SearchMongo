import { Component, OnInit } from '@angular/core';
import { SteamService } from '../../../shared/steamApi.service';
import { ActivatedRoute } from '@angular/router';
import { UserModel } from '../../../shared/users.model';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-friend-list',
  templateUrl: './friend-list.component.html',
  styleUrls: ['./friend-list.component.css']
})
export class FriendListComponent implements OnInit {
  friends = [];
  loading = true;
  error;

  inputName = new FormControl();

  constructor(private steamApi:SteamService, private route:ActivatedRoute) { }

  ngOnInit() {
    this.inputName.valueChanges.pipe(debounceTime(500)).subscribe(
      (val) => {
      if(val.length > 0){
        this.search(val.toLowerCase())
      }
      else {
        for(let friend of this.friends) {
          friend.hasItem = false;
        }
      }
    }
    )
    this.steamApi.getFriends(this.route.snapshot.params.id).subscribe(
      (res) => {
        for (let friend of res) {          
          if (friend) {
            console.log(friend);
            let modeledFriend = new UserModel(friend);
            console.log(modeledFriend);
            this.friends.push(modeledFriend);            
          }
        }
        this.loading = false;
      },
      (err) => {
        this.loading = false;
        this.error = err;
      }
    )
  }
  search(itemName:string) {
    this.steamApi.getItemThatContains(itemName).subscribe(
      (res) => {
        Object.keys(res).map(key => {
         
          for(let friend of this.friends){
            if(friend.inventory.findIndex(x => x.defindex == res[key]["id"]) != "-1"){
              friend.hasItem = true;
              continue;
            }    
          }
        });
      }
    )
  }
}
