import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-timesheets',
  templateUrl: './new-timesheet.page.html',
  styleUrls: ['./new-timesheet.page.scss'],
})
export class TimesheetsPage implements OnInit {
  billable: boolean;
  utilized: boolean;
  productive: boolean;
  exempt: boolean;

  notes: string;
  billingClass: string;
  clientHoursPerDay: string;
  timeOffAllocation: string;

  clients: any = [];
  cases;
  serviceItem;
  approvedBillTimes;
  locations;
  departments;
  workPackages;
  workPackageTasks;
  taskCategories;
  serviceItems;
  eligable;

  profile: any;
  locationName: any;
  haveLocation: boolean;
  locationId: any;
  position: string;
  loginStatus: string;
  advanced = false;

  constructor(
    private api: ApiService,
    private util: UtilService,
    private navCtrl: NavController
  ) {
    this.haveLocation = false;
    const location = JSON.parse(localStorage.getItem('selectedLocation'));
    if (location && location.name) {
      this.locationName = location.name;
      this.locationId = location.id;
    }
  }

  changeLocation() {
    this.navCtrl.navigateRoot(['locations']);
  }

  showHideAdvanced() {
    if (this.advanced === true) {
      this.advanced = false;
    } else {
      this.advanced = true;
    }
  }

  preview() {}

  submit() {}

  addMore() {}

  getProfile() {
    if (localStorage.getItem('uid')) {
      this.api
        .getProfile(localStorage.getItem('uid'))
        .then(
          (data) => {
            if (data && data.cover) {
              this.profile = data.cover;
            }
          },
          (err) => {}
        )
        .catch((e) => {});
    }
  }

  updateProfile() {
    this.navCtrl.navigateRoot(['edit-profile']);
  }

  ngOnInit() {}
}
