import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {AppComponent} from "../../app.component";


@Component({
  selector: 'app-authenticate',
  templateUrl: './authenticate.component.html',
  styleUrls: ['./authenticate.component.css']
})
export class AuthenticateComponent {
socket: any;

countryCode: string = "+1";
formattedPh: string = "";

isValidPhNum: boolean = false;
isCodeCooldown:boolean = false;
codeInterval: number = 30;
interval: any;
sentVerification: boolean = false;

  constructor(private router: Router, private appComponent: AppComponent) {
    this.socket = appComponent.socket;
  }

  ngOnInit() {
    if (sessionStorage.getItem('phone')) {
      this.socket.emit('reload-session', sessionStorage.getItem('phone'));
    }

    this.socket.on('restore-session', (data: any) => {
      if (sessionStorage.getItem('phone') == null) {
        console.log("Phone number is null. Setting phone number to " + this.formattedPh);
        sessionStorage.setItem("phone", this.formattedPh);
      }

      if (data) {
        sessionStorage.setItem('firstName', data.account.first_name);
        sessionStorage.setItem('lastName', data.account.last_name);
        sessionStorage.setItem('dob', data.account.dob);
        sessionStorage.setItem('nickname', data.profile.nickname);

        // const reader = new FileReader();
        // reader.onload = () => {
        //   const base64Data = btoa(data.profile.avatar as string);
        //   sessionStorage.setItem('avatar', base64Data);
        //   this.router.navigate(['/messages']);
        // };
        //
        // reader.readAsBinaryString(data.profile.avatar);

        this.router.navigate(['/messages']);
      } else {
        this.router.navigate(['/create-account']);
      }

    });
  }

  btnSendCode_click(event: any) {
    this.socket.emit('send-otp', this.formattedPh);

    this.startCodeCooldown(event.target);
    this.sentVerification = true;
  }

  cmbCountryCode_change(event: any) {
    this.countryCode = event.target.value;
  }

  txtPhoneNumber_input(event: any) {
    // Twilio recommends /^\+[1-9]\d{1,14}$/ per E.164 standard.
    // However, our supported countries can only range from 8-10.

    const phRegex = /^\+[1-9]\d{8,10}$/;
    this.formattedPh = `${this.countryCode}${event.target.value.replace(/[()-\s]/g, '')}`;
    this.isValidPhNum = phRegex.test(this.formattedPh);
  }

  txtVerification_input(event: any) {
    let otpCode = event.target.value;
    if (otpCode.length === 6 && this.sentVerification) {
      this.socket.emit('verify-otp', otpCode);
    }
  }

  startCodeCooldown(btnSendCode: any) {
    this.isCodeCooldown = true;
    btnSendCode.innerHTML = `Retry in 30`;

    // Start the countdown timer
    this.interval = setInterval(() => {
      if (this.codeInterval > 0) {
        this.codeInterval--;
        btnSendCode.innerHTML = `Retry in ${this.codeInterval}`;
      } else {
        // Enable the button and reset the timer
        this.isCodeCooldown = false;
        this.codeInterval = 30;
        clearInterval(this.interval);
        btnSendCode.innerHTML = "Send Code";
      }
    }, 1000);
  }
}
