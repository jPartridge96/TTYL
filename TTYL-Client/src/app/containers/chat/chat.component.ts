import { Component } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import * as io from 'socket.io-client';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  get currentChatUser(): string {
    return this._currentChatUser;
  }

  set currentChatUser(username: string) {
    this._currentChatUser = username;
  }
  private _currentChatUser = "";

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

  ngOnInit() {
    let nick = sessionStorage.getItem('nickname');
    this.socket = io.io(`localhost:3000?userName=${nick}`); // Change to backend IP when hosting publicly
    this.userName = nick!;

    this.socket.emit('set-user-name', nick);

    this.socket.on('user-list', (userList: string[]) => {
      this.userList = userList;
    });

    this.socket.on('message-broadcast', (data: {message: string, userName: string}) => {
      if(data) {
        const isSender = data.userName === this.userName;
        this.messageList.push({message: data.message, userName: data.userName, isSender: isSender});
      }
    });

    this.currentChatUser = nick!;
  }

  //
  //
  // userNameUpdate(name: string):void {
  //   this.socket = io.io(`localhost:3000?userName=${name}`); // Change to backend IP when hosting publicly
  //   this.userName = name;
  //
  //   this.socket.emit('set-user-name', name);
  //
  //   this.socket.on('user-list', (userList: string[]) => {
  //     this.userList = userList;
  //   });
  //
  //   this.socket.on('message-broadcast', (data: {message: string, userName: string}) => {
  //     if(data) {
  //       const isSender = data.userName === this.userName;
  //       this.messageList.push({message: data.message, userName: data.userName, isSender: isSender});
  //     }
  //   });
  //
  //   this.currentChatUser = name;
  // }

  sendMessage(chatUser: string):void {
    if (!this.currentChatUser) {
      console.error('Current chat user has not been set');
      return;
    }
    const errorMessage = document.getElementById('chatInput');
    if (!this.message || this.message.trim().length === 0) {
      return;
    }

    // Check if the message is from the current user
    const isSender = this.userName === chatUser;

    this.socket.emit('message', this.message);

    // Only push the message as a my-message if it's from the current user
    if (isSender) {
      this.messageList.push({ message: this.message, userName: this.userName, isSender: true });
    } else {
      this.messageList.push({ message: this.message, userName: chatUser, isSender: false });
    }

    // Save the message list to session storage
    sessionStorage.setItem('messageList', JSON.stringify(this.messageList));

    this.message = '';
    window.scrollTo(0, document.body.scrollHeight);
  }


  showEmojiPicker():void {
    const emojiPicker = document.createElement('div');
    emojiPicker.classList.add('emoji-picker');
    emojiPicker.style.position = 'fixed';
    emojiPicker.style.bottom = '50px';
    emojiPicker.style.right = '10px';
    emojiPicker.style.backgroundColor = 'white';
    emojiPicker.style.border = '1px solid #ccc';
    emojiPicker.style.borderRadius = '5px';
    emojiPicker.style.padding = '10px';
    emojiPicker.style.display = 'flex';
    emojiPicker.style.flexWrap = 'wrap';
    emojiPicker.style.zIndex = '1000';

    const emojis = ['😀', '😂', '❤️', '👍', '👎', '🤔'];
    emojis.forEach(emoji => {
      const emojiButton = document.createElement('button');
      emojiButton.innerText = emoji;
      emojiButton.style.fontSize = "20px";
      emojiButton.style.padding = "5px";
      emojiButton.style.margin = "5px";
      emojiButton.style.border = "none";
      emojiButton.style.backgroundColor = "transparent";
      emojiButton.style.cursor = "pointer";

      emojiButton.addEventListener('click', () => {
        const inputField = document.querySelector('#chatbox_input input') as HTMLInputElement;
        inputField.value += emoji;
        this.message = inputField.value;
        inputField.focus();
        emojiPicker.remove();
      });
      emojiPicker.appendChild(emojiButton);
    });
    document.body.appendChild(emojiPicker);
  }
}
