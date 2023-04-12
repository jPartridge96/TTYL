import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  ngOnInit() {
    const sidebarItems = document.querySelectorAll<HTMLElement>(".sidebar ul li");

    sidebarItems.forEach(item => {
      item.addEventListener('click', () => {
        const activeItem = document.querySelector(".sidebar ul li.active");
        if (activeItem) {
          activeItem.classList.remove('active');
        }
        item.classList.add('active');
      });
    });
  }
}
