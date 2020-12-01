import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
})
export class TabsPage {
  uid = localStorage.getItem('uid');
  constructor(private router: Router, private api: ApiService) {}

  logout() {
    this.api.logout(this.uid);
    this.router.navigate(['login']);
  }
}
