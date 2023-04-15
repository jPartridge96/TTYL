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
    if (this.socket == null) {
      const nickname = sessionStorage.getItem('nickname') || 'anonymous';
      const remoteUrl = `https://www.totyl.ca:3000?nickname=${nickname}`;
      const localUrl = `http://localhost:3000?nickname=${nickname}`;

      this.socket = io.io(localUrl);
      this.socket.on('connect_error', (error: any) => {
        if (error) {
          console.log(`Local server refused to connect. Trying to connect to ${remoteUrl}`);
          this.socket = io.io(remoteUrl);
        }
      });
    }
  }

}
