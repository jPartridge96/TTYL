import {Component, EventEmitter, Output} from '@angular/core';

// Allows use of jQuery tags
declare var $: any;

@Component({
  selector: 'app-username',
  templateUrl: './username.component.html',
  styleUrls: ['./username.component.css']
})
export class UsernameComponent {
  @Output() userNameEvent = new EventEmitter<string>();

  userName:string = "";

  ngOnInit(): void {
    // Show the modal on page load
    $(document).ready(function() {
      $('#loginModal').modal('show');
    });
  }

  constructor() {
  }

  setUserName() {
    //Check to see if username is null or blank and if it is force user add
    if(!this.userName || this.userName.trim().length  ===0) {
      alert('Please enter a valid username!');
      return;
    }
    this.userNameEvent.emit(this.userName);
    $('#loginModal').modal('hide');
  }
}
