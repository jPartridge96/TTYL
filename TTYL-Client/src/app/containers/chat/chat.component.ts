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
    const errorMessage = document.getElementById('chatInput');
    if (!this.message || this.message.trim().length === 0) {
      if(errorMessage){
        errorMessage.innerHTML = 'Please enter a message!';
      }
      return;
    } else {
      if(errorMessage)
      errorMessage.innerText = '';
    }

    this.socket.emit('message', this.message);
    this.messageList.push({ message: this.message, userName: this.userName, isSender: true });

    // Save the message list to session storage
    sessionStorage.setItem('messageList', JSON.stringify(this.messageList));

    this.message = '';
    window.scrollTo(0, document.body.scrollHeight);
  }


  showEmojiPicker() {
    const emojiPicker = document.createElement('div');
    emojiPicker.classList.add('emoji-picker');

    const emojis = ['😀', '😂', '❤️', '👍', '👎', '🤔'];
    emojis.forEach(emoji => {
      const emojiButton = document.createElement('button');
      emojiButton.innerText = emoji;
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
