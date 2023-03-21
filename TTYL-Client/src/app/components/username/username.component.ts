import {Component, EventEmitter, Output} from '@angular/core';

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
    this.userNameEvent.emit(this.userName);
    $('#loginModal').modal('hide');
  }
}
