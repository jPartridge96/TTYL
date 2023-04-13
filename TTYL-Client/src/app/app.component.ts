import { Component } from '@angular/core';
import * as io from "socket.io-client";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'TOTYL';

  socket: any;
  ngOnInit() {
    if(this.socket == null) {
      this.socket = io.io(`localhost:3000?nickname=${sessionStorage.getItem('nickname') ? sessionStorage.getItem('nickname') : "anonymous"}`);


      //   this.socket = io.io(`localhost:3000?userName=${name}`); // Change to backend IP when hosting publicly
    }
  }
}
