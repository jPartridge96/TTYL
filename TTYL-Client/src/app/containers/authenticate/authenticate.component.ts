import { Component } from '@angular/core';
import * as io from "socket.io-client";
import { Router } from '@angular/router';


@Component({
  selector: 'app-authenticate',
  templateUrl: './authenticate.component.html',
  styleUrls: ['./authenticate.component.css']
})
export class AuthenticateComponent {
socket: any;

countryCode: string = "+1";
phNum: string = "";
formattedPh: string = "";

isValidPhNum: boolean = false;
isCodeCooldown:boolean = false;
codeInterval: number = 30;
interval: any;
sentVerification: boolean = false;

  constructor(private router: Router) {}


  btnSendCode_click(event: any) {
    if(this.socket == null) {
      this.socket = io.io(`localhost:3000`);
    }
    this.socket.emit('send-otp', this.formattedPh);
    this.startCodeCooldown(event.target);
    this.sentVerification = true;
  }

  cmbCountryCode_change(event: any) {
    this.countryCode = event.target.value;
  }

  txtPhoneNumber_input(event: any) {
    // Twilio recommends /^\+[1-9]\d{1,14}$/ per E.164 standard.
    // However, available countries can only range from 8-10.

    const phRegex = /^\+[1-9]\d{8,10}$/;
    this.formattedPh = `${this.countryCode}${event.target.value.replace(/[()-\s]/g, '')}`;
    this.isValidPhNum = phRegex.test(this.formattedPh);
  }

  txtVerification_input(event: any) {
    let otpCode = event.target.value;
    if (otpCode.length === 6 && this.sentVerification) {
      this.socket.emit('verify-otp', otpCode);
      console.log("It's 6 digits long!!");
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


    this.socket.on('otp-verified', (component: string) => {
      if (component) {
        // @ts-ignore
        document.getElementById('currentComponent').innerHTML = `<${component}></${component}>`;
        console.log('OTP Verified!');
      }
    });

  }
}
