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
import { ApisService } from 'src/app/services/apis.service';
import { Platform, ModalController, NavController } from '@ionic/angular';
import { UtilService } from 'src/app/services/util.service';
import * as moment from 'moment';
import { orderBy, uniqBy } from 'lodash';
import Swal from 'sweetalert2';
declare var google;

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  plt: string;
  allUsers: any[] = [];
  headerHidden: boolean;
  showFilter: boolean;
  lat: any;
  lng: any;
  // address: any;
  haveLocation: boolean;
  nearme = false;
  profile: any;
  banners: any[] = [];
  slideOpts = {
    slidesPerView: 1.7,
  };
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
    private api: ApisService,
    private util: UtilService,
    private apis: ApisService,
    public modalController: ModalController,
    private navCtrl: NavController
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
            console.log('getLocationCatchError ' + error);
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
              .catch((error) => {
                console.log('getCurrentPosition ' + error);
              });
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
              .catch((error) => {
                console.log('getCurrentPositionCatchError ' + error);
              });
          }
        },
        (error) => {
          console.log('isLocationEnabled ' + error);
        }
      )
      .catch((error) => {
        console.log('isLocationEnabledCatchError ' + error);
      });
  }

  // getAddress(lat, lng) {
  //   setTimeout(() => {
  //     this.haveLocation = true;
  //     const geocoder = new google.maps.Geocoder();
  //     const location = new google.maps.LatLng(lat, lng);
  //     geocoder.geocode({ 'location': location }, (results, status) => {
  //       console.log(results);
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
    this.api
      .getUsers()
      .then(
        (data) => {
          if (data && data.length) {
            this.allUsers = [];
            data.forEach(async (element) => {
              if (element && element.status === 'active') {
                this.allUsers.push(element);
              }
            });
          } else {
            this.allUsers = [];
          }
        },
        (error) => {
          console.log('getUsers ' + error);
        }
      )
      .catch((error) => {
        console.log('getUsersCatchError' + error);
      });
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

  // openOffers(item) {
  //   const navData: NavigationExtras = {
  //     queryParams: {
  //       id: item.restId,
  //     },
  //   };
  //   this.router.navigate(['category'], navData);
  // }

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
      this.apis
        .getProfile(localStorage.getItem('uid'))
        .then(
          (data) => {
            if (data && data.cover) {
              this.profile = data.cover;
            }
            if (data && data.status === 'deactive') {
              localStorage.removeItem('uid');
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
          (err) => {
            console.log('getProfile ' + err);
          }
        )
        .catch((e) => {
          console.log('getProfileCatchError ' + e);
        });
    }
  }

  changeLocation() {
    this.navCtrl.navigateRoot(['cities']);
  }

  ngOnInit() {}
}
