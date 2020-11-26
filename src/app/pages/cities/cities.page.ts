import { Component, OnInit } from '@angular/core';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-cities',
  templateUrl: './cities.page.html',
  styleUrls: ['./cities.page.scss'],
})
export class CitiesPage implements OnInit {
  locations: any[] = [];
  dummy = Array(10);
  dummyList: any[] = [];
  selectedLocation: any;

  constructor(
    private api: ApisService,
    private util: UtilService,
    private navCtrl: NavController
  ) {
    this.getLocations();
  }

  getLocations() {
    this.api
      .getLocations()
      .then((data) => {
        console.log(data);
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
        console.log(error);
        this.util.errorToast('Something went wrong');
        this.dummy = [];
      });
  }

  goNext() {
    console.log('next', this.selectedLocation);
    const data = this.locations.filter((x) => x.id === this.selectedLocation);
    console.log(data);
    localStorage.setItem('selectedLocation', JSON.stringify(data[0]));
    this.util.publishLocation('data');
    this.navCtrl.navigateRoot(['/tabs']);
  }

  ngOnInit() {}
}
