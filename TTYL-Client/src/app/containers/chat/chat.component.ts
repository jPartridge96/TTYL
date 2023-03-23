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
    // Retrieve the message list from session storage
    const storedMessageList = sessionStorage.getItem('messageList');
    if (storedMessageList) {
      this.messageList = JSON.parse(storedMessageList);
    }
  }

  userNameUpdate(name: string) {
    this.socket = io.io(`localhost:3000?userName=${name}`); // Change to backend IP when hosting publicly
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

  sendMessage(): void {
    this.socket.emit('message', this.message);
    this.messageList.push({ message: this.message, userName: this.userName, isSender: true });

    // Save the message list to session storage
    sessionStorage.setItem('messageList', JSON.stringify(this.messageList));

    this.message = '';
    window.scrollTo(0, document.body.scrollHeight);
  }

}
