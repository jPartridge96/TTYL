import { Component } from '@angular/core';
import { AppComponent } from "../../app.component";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import {timestamp} from "rxjs";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  get currentChatUser(): string {
    return this._currentChatUser;
  }

  set currentChatUser(nickname: string) {
    this._currentChatUser = nickname;
  }
  private _currentChatUser = "";

  nickname = "";
  message = "";
  messageList: {message: string, nickname: string, isSender: boolean, timestamp: string}[] = [];
  userList: string[] = [];
  socket: any;

  constructor(private appComponent: AppComponent, private router: Router) {
    this.socket = appComponent.socket;

    // Retrieve the message list from session storage
    const storedMessageList = sessionStorage.getItem('messageList');
    if (storedMessageList) {
      this.messageList = JSON.parse(storedMessageList);
    }
  }

  ngOnInit() {
    const sidebarMessages = document.querySelectorAll<HTMLElement>(".messages li");
    const sidebar = document.querySelector<HTMLElement>(".sidebar")!;
    const openNav = document.querySelector<HTMLElement>(".open-btn")!;
    const closeNav = document.querySelector<HTMLElement>(".close-btn")!;

    sidebarMessages.forEach(conversation => {
      conversation.addEventListener('click', () => {
        const activeConversation = document.querySelector(".messages li.active");
        if (activeConversation) {
          activeConversation.classList.remove('active');
        }
        conversation.classList.add('active');
      });
    });

    openNav.addEventListener('click', () => {
      sidebar.classList.add('active');
      setTimeout(() => {
        sidebar.hidden = false;
      }, 200);
    });

    closeNav.addEventListener('click', () => {
      sidebar.classList.remove('active');
      setTimeout(() => {
        sidebar.hidden = true;
      }, 200);
    });

    let nick = sessionStorage.getItem('nickname');
    this.nickname = nick!;

    this.socket.emit('set-user-name', nick);

    this.socket.on('user-list', (userList: string[]) => {
      this.userList = userList;
    });

    this.socket.on('message-broadcast', (data: {message: string, nickname: string, timestamp: string}) => {
      if(data) {
        const isSender = data.nickname === this.nickname;
        this.messageList.push({message: data.message, nickname: data.nickname, isSender: isSender, timestamp: data.timestamp});
      }
    });
    this.currentChatUser = nick!;
  }

  sendMessage(chatUser: string):void {
    if (!this.currentChatUser) {
      console.error('Current chat user has not been set');
      return;
    }
    const errorMessage = document.getElementById('chatInput');
    if (!this.message || this.message.trimEnd().trimStart().length === 0) {
      return;
    }

    // Check if the message is from the current user
    const isSender = this.nickname === chatUser;

    this.socket.emit('message', {
      nick: sessionStorage.getItem('nickname'),
      msg: this.message
    });

    const now = new Date();
    const hours = now.getHours() % 12 || 12; // convert to 12-hour format
    const minutes = now.getMinutes().toString().padStart(2, '0'); // add leading zero if necessary
    const ampm = now.getHours() < 12 ? 'AM' : 'PM'; // determine AM/PM


    // Only push the message as a my-message if it's from the current user
    if (isSender) {
      this.messageList.push({ message: this.message, nickname: this.nickname, isSender: true, timestamp: `${hours}:${minutes} ${ampm}` });
    } else {
       this.messageList.push({ message: this.message, nickname: chatUser, isSender: false, timestamp: `${hours}:${minutes} ${ampm}` });
    }

    // Save the message list to session storage
    sessionStorage.setItem('messageList', JSON.stringify(this.messageList));
    window.scrollTo(0, document.body.scrollHeight);
    this.message = '';
  }


  showEmojiPicker():void {
    // Toggle the emoji picker
    const emojiPickerEle = document.querySelector('.emoji-picker') as HTMLTextAreaElement;
    if (emojiPickerEle) {
      emojiPickerEle.remove();
    } else {
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

      const emojis = ['❤️', '😂', '😲', '😢', '😠', '👍'];
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
          const inputField = document.querySelector('textarea') as HTMLTextAreaElement;
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

  btnSettings_click() {
    this.router.navigate(['/settings']);
  }

  btnAbout_click() {
    this.router.navigate(['/about']);
  }

  btnLogout_click() {
    sessionStorage.clear();
    this.router.navigate(['/home']);
  }
}
