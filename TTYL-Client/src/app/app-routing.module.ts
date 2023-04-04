import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from "./containers/about/about.component";
import { ChatComponent } from "./containers/chat/chat.component";
import { AuthenticateComponent } from "./containers/authenticate/authenticate.component";
import { AccountComponent } from "./containers/account/account.component";
import { ProfileComponent } from "./containers/profile/profile.component";
import { ErrorComponent } from "./containers/error/error.component";

const routes: Routes = [
  { path: 'authenticate', component: AuthenticateComponent },
  { path: 'create-account', component: AccountComponent },
  { path: 'edit-profile', component: ProfileComponent },
  { path: 'messages', component: ChatComponent },

  { path: 'about', component: AboutComponent},

  { path: 'home', component: AuthenticateComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full'},
  { path: '**', component: ErrorComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
