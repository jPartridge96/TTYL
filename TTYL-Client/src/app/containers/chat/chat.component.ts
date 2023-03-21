import { Component } from '@angular/core';
import * as io from "socket.io-client";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  userName = "";
  message = "";
  messageList: {message: string, userName: string, isSender: boolean}[] = [];
  userList: string[] = [];
  socket: any;

  constructor() {
  }
  userNameUpdate(name: string) {
    this.socket = io.io(`25.51.4.75:3000?userName=${name}`);
    this.userName = name;

    this.socket.emit('set-user-name', name);

    this.socket.on('user-list', (userList: string[]) => {
      this.userList = userList;
    });

    this.socket.on('message-broadcast', (data: {message: string, userName: string}) => {
      if(data) {
        this.messageList.push({message: data.message, userName: data.userName, isSender: false});
      }
    });
  }

  sendMessage():void {
    this.socket.emit('message', this.message);
    this.messageList.push({message: this.message, userName: this.userName, isSender: true});
    this.message = '';

    window.scrollTo(0, document.body.scrollHeight);
  }
}
