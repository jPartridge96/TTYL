import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent {
  txtFirstName: any;
  txtLastName: any;

  dtpDateOfBirth: any;
  requiredAge: number = 13;

  isFormValid: boolean = false;

  constructor(private router: Router) {}

  txtFirstName_input(event: any) {
    this.txtFirstName = event.target;
    this.validateForm();
  }

  txtLastName_input(event: any) {
    this.txtLastName = event.target;
    this.validateForm();
  }

  dtpDateOfBirth_input(event: any) {
    this.dtpDateOfBirth = event.target;
    this.validateForm();
  }

  btnNext_click() {
    // Get the input values
    const firstName = (<HTMLInputElement>document.getElementById('txtFirstName')).value;
    const lastName = (<HTMLInputElement>document.getElementById('txtLastName')).value;
    const dob = (<HTMLInputElement>document.getElementById('dtpDateOfBirth')).value;

    // Save the input values to session storage
    sessionStorage.setItem('firstName', firstName);
    sessionStorage.setItem('lastName', lastName);
    sessionStorage.setItem('dob', dob);

    this.router.navigate(['/edit-profile']);
  }

  calculateAge() {
    let dob = new Date(this.dtpDateOfBirth.value);
    let ageInMilliseconds = Date.now() - dob.getTime();
    let ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);

    return ageInYears;
  }

  validateForm() {
    if(!(this.txtFirstName && this.txtLastName && this.dtpDateOfBirth)) {
      this.isFormValid = false;
      return;
    }

    let isFirstNameValid = (this.txtFirstName.value.length >= this.txtFirstName.minLength);
    let isLastNameValid = (this.txtLastName.value.length >= this.txtLastName.minLength);
    let isDateOfBirthValid = this.calculateAge() >= this.requiredAge;

    this.isFormValid = (isFirstNameValid && isLastNameValid && isDateOfBirthValid);
  }
}
