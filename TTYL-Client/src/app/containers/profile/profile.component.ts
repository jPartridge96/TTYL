import { Component } from '@angular/core';
import * as io from "socket.io-client";
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  socket: any;

  phone: string = "";
  firstName: string = "";
  lastName: string = "";
  dob: any;

  avatar: any;
  nickname: string = "";

  constructor(private router: Router) {}

  /**
   * Automatically populates name and nickname data fields,
   */
  ngOnInit() {
    this.phone = sessionStorage.getItem("phone")!;
    this.firstName = sessionStorage.getItem("firstName")!;
    this.lastName = sessionStorage.getItem("lastName")!;
    this.dob = sessionStorage.getItem("dob");

    this.avatar = null;
    this.nickname = `${this.firstName} ${this.lastName}`;
  }
  btnSkip_click() {
    if(this.socket == null) {
      this.socket = io.io(`localhost:3000`);
    }

    this.emitCreateAccount();
    this.router.navigate(['/messages']);
  }

  btnNext_click() {
    if(this.socket == null) {
      this.socket = io.io(`localhost:3000`);
    }

    this.emitCreateAccount();
    this.router.navigate(['/messages']);
  }

  btnEditPicture_click() {
    alert("Feature coming soon!");
    // Use android File permissions to select image from device
    // Set the image to what the user selects.

    // Image will be uploaded on emit
  }

  txtNickname_input(event: any) {
    let txtNickName = event.target.value;
    txtNickName = txtNickName.trim();

    if (txtNickName) {
      this.nickname = txtNickName;
    } else {
      this.nickname = `${this.firstName} ${this.lastName}`;
    }

    // If minlength is matched, enable button
    // Trim spaces
    // If nickname is empty on submit, first and last name will be used

    // How will account data be passed to user after creation?
    // let nick = `${acc.firstName} ${acc.lastName}`;
  }

  emitCreateAccount() {
    sessionStorage.setItem("nickname", this.nickname);

    this.socket.emit('create-account', {
      accData: {
        "phone": this.phone,
        "firstName": this.firstName,
        "lastName": this.lastName,
        "dob": this.dob
      },
      profData: {
        "avatar": this.avatar,
        "nickname": this.nickname
      }
    });
  }
}
