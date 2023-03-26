import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatComponent } from './containers/chat/chat.component';
import { UsernameComponent } from './components/username/username.component';
import { AboutComponent } from './containers/about/about.component';
import { LoginComponent } from './containers/login/login.component';
import { AuthenticateComponent } from './containers/authenticate/authenticate.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AccountComponent } from './containers/account/account.component';
import { ProfileComponent } from './containers/profile/profile.component';
import { FooterComponent } from './components/footer/footer.component';

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    UsernameComponent,
    AboutComponent,
    LoginComponent,
    AuthenticateComponent,
    NavbarComponent,
    AccountComponent,
    ProfileComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
