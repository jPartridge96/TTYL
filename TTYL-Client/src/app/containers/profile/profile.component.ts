import { Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  btnSkip_click() {
    // Skips profile creation and sets default avatar
    // Profile name will be set to the user's first and last name.

    // First time ? Skip will be renamed to 'Back' when user is returnee
    // Redirect back to conversations
  }

  btnNext_click() {
    // Assigns entered values to profile
  }

  btnEditPicture_click() {
    // Use android File permissions to select image from device
    // Set the image to what the user selects.

    // Image will be uploaded on Next
  }

  txtNickname_input() {
    // If minlength is matched, enable button
    // Trim spaces
    // If nickname is empty on submit, first and last name will be used

    // How will account data be passed to user after creation?
    // let nick = `${acc.firstName} ${acc.lastName}`;
  }

  redirectToPage(page: string) {
    // First time ? Redirect to welcome
    // else, the profile is being updated, not created,
        // redirect back to conversations
  }
}
