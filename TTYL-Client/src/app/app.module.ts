import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatComponent } from './containers/chat/chat.component';
import { UsernameComponent } from './components/username/username.component';
import { AboutComponent } from './containers/about/about.component';
import { AuthenticateComponent } from './containers/authenticate/authenticate.component';
import { AccountComponent } from './containers/account/account.component';
import { ProfileComponent } from './containers/profile/profile.component';
import { FooterComponent } from './components/footer/footer.component';
import { ErrorComponent } from './containers/error/error.component';
import { HeaderComponent } from './components/header/header.component';
import { ToastComponent } from './components/toast/toast.component';
import { SettingsComponent } from './containers/settings/settings.component';

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    UsernameComponent,
    AboutComponent,
    AuthenticateComponent,
    AccountComponent,
    ProfileComponent,
    FooterComponent,
    ErrorComponent,
    HeaderComponent,
    ToastComponent,
    SettingsComponent
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
