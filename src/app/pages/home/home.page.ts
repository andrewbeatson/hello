import { Component, OnInit } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import {
  Geolocation,
  GeolocationOptions,
  Geoposition,
  PositionError,
} from '@ionic-native/geolocation/ngx';
import { Router, NavigationExtras } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { Platform, ModalController, NavController } from '@ionic/angular';
import { UtilService } from 'src/app/services/util.service';
import * as moment from 'moment';
import Swal from 'sweetalert2';
declare var google;
import { AngularFirestore } from 'angularfire2/firestore';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
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
  profile: any;

  locationName: any;
  locationId: any;
  name: string;
  position: string;
  loginStatus: string;

  constructor(
    private platform: Platform,
    private androidPermissions: AndroidPermissions,
    private diagnostic: Diagnostic,
    public geolocation: Geolocation,
    private router: Router,
    private api: ApiService,
    private util: UtilService,
    public modalController: ModalController,
    private navCtrl: NavController,
    private adb: AngularFirestore
  ) {
    this.haveLocation = false;
    if (this.platform.is('ios')) {
      this.plt = 'ios';
    } else {
      this.plt = 'android';
    }
    const location = JSON.parse(localStorage.getItem('selectedLocation'));
    if (location && location.name) {
      this.locationName = location.name;
      this.locationId = location.id;
      this.getUsers();
    }
  }

  ionViewWillEnter() {
    this.getLocation();
    this.getProfile();
  }

  // getAddressMy() {
  //   const add = JSON.parse(localStorage.getItem('deliveryAddress'));
  //   if (add && add.address) {
  //     this.address = add.address;
  //     this.lat = add.lat;
  //     this.lng = add.lng;
  //   }
  //   return this.address;
  // }

  getLocation() {
    this.platform.ready().then(() => {
      if (this.platform.is('android')) {
        this.androidPermissions
          .checkPermission(
            this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION
          )
          .then((err) =>
            this.androidPermissions.requestPermission(
              this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION
            )
          );
        this.grantRequest();
      } else if (this.platform.is('ios')) {
        this.grantRequest();
      } else {
        this.geolocation
          .getCurrentPosition({
            maximumAge: 3000,
            timeout: 10000,
            enableHighAccuracy: false,
          })
          .then((resp) => {
            if (resp) {
              this.lat = resp.coords.latitude;
              this.lng = resp.coords.longitude;
              // this.getAddress(this.lat, this.lng);
            }
          })
          .catch((error) => {
            this.grantRequest();
          });
      }
    });
  }

  grantRequest() {
    this.diagnostic
      .isLocationEnabled()
      .then(
        (data) => {
          if (data) {
            this.geolocation
              .getCurrentPosition({
                maximumAge: 3000,
                timeout: 10000,
                enableHighAccuracy: false,
              })
              .then((resp) => {
                if (resp) {
                  this.lat = resp.coords.latitude;
                  this.lng = resp.coords.longitude;
                  // this.getAddress(this.lat, this.lng);
                }
              })
              .catch((error) => {});
          } else {
            this.diagnostic.switchToLocationSettings();
            this.geolocation
              .getCurrentPosition({
                maximumAge: 3000,
                timeout: 10000,
                enableHighAccuracy: false,
              })
              .then((resp) => {
                if (resp) {
                  this.lat = resp.coords.latitude;
                  this.lng = resp.coords.longitude;
                  // this.getAddress(this.lat, this.lng);
                }
              })
              .catch((error) => {});
          }
        },
        (error) => {}
      )
      .catch((error) => {});
  }

  // getAddress(lat, lng) {
  //   setTimeout(() => {
  //     this.haveLocation = true;
  //     const geocoder = new google.maps.Geocoder();
  //     const location = new google.maps.LatLng(lat, lng);
  //     geocoder.geocode({ 'location': location }, (results, status) => {
  //       if (results && results.length) {
  //         this.address = results[0].formatted_address;
  //         this.lat = lat;
  //         this.lng = lng;
  //         const address = {
  //           address: this.address,
  //           lat: this.lat,
  //           lng: this.lng,
  //           id: ''
  //         };
  //         localStorage.setItem('deliveryAddress', JSON.stringify(address));
  //       } else {
  //         this.dummy = [];
  //         this.util.errorToast('Something went wrong please try again later');
  //       }
  //     });
  //     localStorage.setItem('myLat', this.lat);
  //     localStorage.setItem('myLng', this.lng);
  //     this.getRest();
  //   }, 1000);
  // }

  degreesToRadians(degrees) {
    return (degrees * Math.PI) / 180;
  }

  distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
    const earthRadiusKm = 6371;

    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);

    lat1 = this.degreesToRadians(lat1);
    lat2 = this.degreesToRadians(lat2);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }

  getTime(time) {
    return moment(time).format('mm');
  }

  async presentModal() {
    await this.router.navigate(['choose-address']);
  }

  // Get a list of all the current users
  getUsers() {
    this.adb
      .collection('users')
      .snapshotChanges()
      .subscribe(
        (data) => {
          this.api
            .getUsers()
            .then(
              (data) => {
                if (data && data.length) {
                  this.allUsers = [];
                  this.allOnlineUsers = [];
                  this.allOfflineUsers = [];
                  this.allOnLeaveUsers = [];
                  this.allOtherUsers = [];
                  data.forEach(async (element) => {
                    if (element && element.status === 'active') {
                      this.allUsers.push(element);
                      if (element.onlineStatus === 'Online') {
                        this.allOnlineUsers.push(element);
                      } else if (element.onlineStatus === 'Offline') {
                        this.allOfflineUsers.push(element);
                      } else if (element.onlineStatus === 'On Leave') {
                        this.allOnLeaveUsers.push(element);
                      } else {
                        this.allOtherUsers.push(element);
                      }
                    }
                  });
                } else {
                  this.allUsers = [];
                  this.allOnlineUsers = [];
                  this.allOfflineUsers = [];
                  this.allOnLeaveUsers = [];
                  this.allOtherUsers = [];
                }
              },
              (error) => {}
            )
            .catch((error) => {});
        },
        (error) => {}
      );
  }

  viewUserProfile(item) {
    if (item && item.status === 'close') {
      return false;
    }
    const navData: NavigationExtras = {
      queryParams: {
        id: item.uid,
      },
    };
    this.router.navigate(['category'], navData);
  }

  onSearchChange(event) {
    this.allUsers = this.allUsers.filter((ele: any) => {
      return ele.name.toLowerCase().includes(event.detail.value.toLowerCase());
    });
  }

  onScroll(event) {
    if (event.detail.deltaY > 0 && this.headerHidden) {
      return;
    }
    if (event.detail.deltaY < 0 && !this.headerHidden) {
      return;
    }
    if (event.detail.deltaY > 80) {
      this.headerHidden = true;
    } else {
      this.headerHidden = false;
    }
  }

  getProfile() {
    if (localStorage.getItem('uid')) {
      this.api
        .getProfile(localStorage.getItem('uid'))
        .then(
          (data) => {
            if (data && data.cover) {
              this.profile = data.cover;
            }
            if (data && data.status === 'deactive') {
              this.api.logout();
              this.router.navigate(['login']);
              Swal.fire({
                title: 'Error',
                text: 'Your are blocked please contact administrator',
                icon: 'error',
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: 'Need Help?',
                backdrop: false,
                background: 'white',
              }).then((res) => {
                if (res && res.value) {
                  this.router.navigate(['inbox']);
                }
              });
            }
          },
          (err) => {}
        )
        .catch((e) => {});
    }
  }

  changeLocation() {
    this.navCtrl.navigateRoot(['locations']);
  }

  ngOnInit() {}
}
