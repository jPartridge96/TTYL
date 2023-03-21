import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from "./containers/about/about.component";
import { ChatComponent } from "./containers/chat/chat.component";

const routes: Routes = [
  { path: 'chat', component: ChatComponent }, //routing for chat page
  { path: 'about', component: AboutComponent}, //routing for about page
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
