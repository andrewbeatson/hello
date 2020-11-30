import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.page.html',
  styleUrls: ['./locations.page.scss'],
})
export class LocationsPage implements OnInit {
  locations: any[] = [];
  dummy = Array(10);
  dummyList: any[] = [];
  selectedLocation: any;

  constructor(
    private api: ApiService,
    private util: UtilService,
    private navCtrl: NavController
  ) {
    this.getLocations();
  }

  getLocations() {
    this.api
      .getLocations()
      .then((data) => {
        this.dummy = [];
        if (data && data.length) {
          data.forEach((element) => {
            if (element) {
              this.locations.push(element);
              this.dummyList.push(element);
            }
          });
        }
      })
      .catch((error) => {
        this.util.errorToast('Something went wrong');
        this.dummy = [];
      });
  }

  goNext() {
    const data = this.locations.filter((x) => x.id === this.selectedLocation);
    localStorage.setItem('selectedLocation', JSON.stringify(data[0]));
    this.api.storeLocation(data[0].name, localStorage.getItem('uid'));
    this.util.publishLocation('data');
    this.navCtrl.navigateRoot(['/tabs']);
  }

  ngOnInit() {}
}
