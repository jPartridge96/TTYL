import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from "../../app.component";

declare function getAvatar(callback: any): any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  socket: any;

  avatarBlob: string = "";
  avatarDataUri: string = "../../../assets/img/profile.jpg";

  phone: string = "";
  firstName: string = "";
  lastName: string = "";
  dob: any;

  avatar: any;
  nickname: string = "";

  constructor(private router: Router, private appComponent: AppComponent) {
    this.socket = appComponent.socket;
  }

  /**
   * Automatically populates name and nickname data fields,
   */
  ngOnInit() {
    this.phone = sessionStorage.getItem("phone")!;
    this.firstName = sessionStorage.getItem("firstName")!;
    this.lastName = sessionStorage.getItem("lastName")!;
    this.dob = sessionStorage.getItem("dob");

    this.nickname = `${this.firstName} ${this.lastName}`;
  }
  btnSkip_click() {
    this.emitCreateAccount();
    this.router.navigate(['/messages']);
  }

  btnNext_click() {
    this.emitCreateAccount();
    this.router.navigate(['/messages']);
  }

  btnEditPicture_click() {
    getAvatar((blob: any) => {
      this.avatarBlob = blob;
    });
  }

  txtNickname_input(event: any) {
    let txtNickName = event.target.value;
    txtNickName = txtNickName.trim();

    if (txtNickName) {
      this.nickname = txtNickName;
    } else {
      this.nickname = `${this.firstName} ${this.lastName}`;
    }
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
        "avatar": this.avatarBlob,
        "nickname": this.nickname
      }
    });
  }
}
