import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { AppComponent } from "../../app.component";

declare function getAvatar(callback: any): any;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  socket: any;

  ngOnInit() {
    this.socket = this.appComponent.socket;

    // Set the source of the avatar image to the value stored in the session storage
    const avatarSrc = sessionStorage.getItem('avatar');
    if (avatarSrc) {
      console.log(avatarSrc);
      const avatarImg = document.getElementById('picAvatar')! as HTMLImageElement;
      avatarImg.src = "data:image/jpg;base64," + avatarSrc;
    }
  }

  constructor(private appComponent: AppComponent, private router: Router) {}

  btnEditPicture_click() {
    getAvatar((blob: any) => {
      this.socket.emit('upload-profile-photo', [sessionStorage.getItem('phone'), blob]);
    });
  }

  txtNickname_input(event: any) {

  }

  btnBack_click() {
    this.router.navigate(['/messages']);
  }

  btnSave_click() {
    this.router.navigate(['/messages'])
  }

  btnDeleteAccount_click() {
    let confirmed = confirm("Are you sure you want to delete your account?\nIt will be gone forever (a very long time).");

    if(confirmed) {
      sessionStorage.clear();

      this.socket.emit('delete-account', sessionStorage.getItem('phone'));

      this.router.navigate(['/home']);
    }
  }

  btnClearMessages_click() {
    let confirmed = confirm("Are you sure you want to clear all messages?\nThey will be gone forever (a very long time).");

    if(confirmed) {
      sessionStorage.removeItem('messageList');
    }
  }

  txtFirstName_input(event: any) {

  }

  txtLastName_input(event: any) {

  }
}
