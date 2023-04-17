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

  avatarBlob: string = "";
  avatarDataUri: string = "";

  isFormValid: boolean = true;
  txtFirstName: any;
  txtLastName: any;
  txtNickname: any;


  ngOnInit() {
    this.socket = this.appComponent.socket;

    this.socket.on('send-avatar', (avatarDataUri: string) => {
      if(avatarDataUri) {
        this.avatarDataUri = avatarDataUri;
      } else {
        this.avatarDataUri = "../../../assets/img/profile.jpg";
      }
    });

    this.txtFirstName = (<HTMLInputElement>document.getElementById('txtFirstName'));
    this.txtLastName = (<HTMLInputElement>document.getElementById('txtLastName'));
    this.txtNickname = (<HTMLInputElement>document.getElementById('txtNickname'));

    let phNum = sessionStorage.getItem('phone');
    this.socket.emit('retrieve-avatar', phNum);
  }

  constructor(private appComponent: AppComponent, private router: Router) {
  }

  /**
   * Sets avatarBlob to the blob received
   */
  btnEditPicture_click() {
    getAvatar((blob: any) => {
      this.avatarBlob = blob;
    });
  }

  btnBack_click() {
    this.router.navigate(['/messages']);
  }

  /**
   * Saves profile data, only performs upload if avatar has been changed
   */
  btnSave_click() {
    // Only send upload if image has been changed
    if(this.avatarBlob) {
      this.socket.emit('upload-profile-photo', [sessionStorage.getItem('phone'), this.avatarBlob]);
    }

    // Update session storage for user
    sessionStorage.setItem('firstName', this.txtFirstName.value);
    sessionStorage.setItem('lastName', this.txtLastName.value);
    if(this.txtNickname.value) {
      sessionStorage.setItem('nickname', this.txtNickname.value)
    } else {
      sessionStorage.setItem('nickname', `${this.txtFirstName.value} ${this.txtLastName.value}`)
    }

    // Pull updated data for database
    let phone = sessionStorage.getItem('phone');
    let account = {
      firstName: sessionStorage.getItem('firstName'),
      lastName: sessionStorage.getItem('lastName'),
    };
    let profile = {
      nickname: sessionStorage.getItem('nickname')
    }

    this.socket.emit('update-account', [phone, account, profile])
    this.router.navigate(['/messages'])
  }

  btnDeleteAccount_click() {
    let confirmed = confirm("Are you sure you want to delete your account?\nIt will be gone forever (a very long time).");

    if(confirmed) {
      this.socket.emit('delete-account', sessionStorage.getItem('phone'));
      sessionStorage.clear();

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
    this.txtFirstName = event.target;
    this.validateForm();
  }

  txtLastName_input(event: any) {
    this.txtLastName = event.target;
    this.validateForm();
  }

  txtNickname_value() {
    return sessionStorage.getItem('nickname');
  }

  txtFirstName_value() {
    return sessionStorage.getItem('firstName');
  }

  txtLastName_value() {
    return sessionStorage.getItem('lastName');
  }

  validateForm() {
    if(!(this.txtFirstName && this.txtLastName)) {
      this.isFormValid = false;
      return;
    }

    let isFirstNameValid = (this.txtFirstName.value.length >= this.txtFirstName.minLength);
    let isLastNameValid = (this.txtLastName.value.length >= this.txtLastName.minLength);

    this.isFormValid = (isFirstNameValid && isLastNameValid);
  }
}
