import { Component, OnInit } from '@angular/core';
import { ApisService } from 'src/app/services/apis.service';
import { Router, NavigationExtras } from '@angular/router';
import { UtilService } from 'src/app/services/util.service';
import { NavController } from '@ionic/angular';
@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {
  seg_id = 1;
  name: any;
  photo: any = 'assets/imgs/user.jpg';
  email: any;
  reviews: any = [];
  id: any;
  locationName: any;
  profile: any;

  plt: string;
  allUsers: any[] = [];
  allOnlineUsers: any[] = [];
  allOfflineUsers: any[] = [];
  allOnLeaveUsers: any[] = [];
  allOtherUsers: any[] = [];
  headerHidden: boolean;
  lat: any;
  lng: any;
  // address: any;
  haveLocation: boolean;

  locationId: any;
  position: string;
  loginStatus: string;

  constructor(
    private api: ApisService,
    private router: Router,
    private util: UtilService,
    private navCtrl: NavController
  ) {
    this.haveLocation = false;
    const location = JSON.parse(localStorage.getItem('selectedLocation'));
    if (location && location.name) {
      this.locationName = location.name;
      this.locationId = location.id;
    }
    this.util.observProfile().subscribe((data) => {
      this.getProfile();
    });
  }

  ngOnInit() {}
  logout() {
    this.api
      .logout()
      .then((data) => {
        this.router.navigate(['tabs']);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  goToAddress() {
    const navData: NavigationExtras = {
      queryParams: {
        from: 'accont',
      },
    };
    this.router.navigate(['choose-address'], navData);
  }

  ionViewWillEnter() {
    this.validate();
  }

  getProfile() {
    this.api
      .getMyProfile(localStorage.getItem('uid'))
      .then((data: any) => {
        console.log('userdata', data);
        if (data) {
          this.name = data.fullname;
          this.photo = data && data.cover ? data.cover : 'assets/imgs/user.jpg';
          this.email = data.email;
          this.id = data.uid;
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  validate() {
    this.api
      .checkAuth()
      .then(async (user: any) => {
        if (user) {
          localStorage.setItem('uid', user.uid);
          this.getProfile();
        } else {
          this.router.navigate(['login']);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  changeSegment(val) {
    this.seg_id = val;
  }

  goToselectRestaurants() {
    this.router.navigate(['/choose-restaurant']);
  }

  goToEditProfile() {
    this.router.navigate(['/edit-profile']);
  }

  changeLocation() {
    this.navCtrl.navigateRoot(['locations']);
  }
}
