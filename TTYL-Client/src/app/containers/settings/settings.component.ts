import { Component } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  ngOnInit() {

  }

  constructor(private router: Router) {}

  btnEditPicture_click() {
    alert("Feature coming soon!");
    // Use android File permissions to select image from device
    // Set the image to what the user selects.

    // Image will be uploaded on emit
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
    confirm("Are you sure you want to delete your account?\nIt will be gone forever (a very long time).");
  }

  btnClearMessages_click() {
    confirm("Are you sure you want to clear your messages?\nThey will be gone forever (a very long time).");
  }

  txtFirstName_input(event: any) {

  }

  txtLastName_input(event: any) {

  }
}
