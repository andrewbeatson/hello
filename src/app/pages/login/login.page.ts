import { Component, OnInit } from '@angular/core';
import { Login } from 'src/app/interfaces/login';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';
import { OneSignal } from '@ionic-native/onesignal/ngx';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  login: Login = { email: '', password: '' };
  submitted = false;
  isLogin = false;
  constructor(
    private router: Router,
    private api: ApisService,
    private util: UtilService,
    private oneSignal: OneSignal
  ) {
    this.oneSignal.getIds().then((data) => {
      localStorage.setItem('fcm', data.userId);
    });
  }

  ngOnInit() {}

  onLogin(form: NgForm) {
    this.submitted = true;
    if (form.valid) {
      const emailfilter = /^[\w._-]+[+]?[\w._-]+@[\w.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailfilter.test(this.login.email)) {
        this.util.showToast('Please enter valid email', 'danger', 'bottom');
        return false;
      }
      this.isLogin = true;
      this.api
        .login(this.login.email, this.login.password)
        .then((userData) => {
          this.api
            .getProfile(userData.uid)
            .then((info) => {
              if (info && info.status === 'active') {
                localStorage.setItem('uid', userData.uid);
                localStorage.setItem('help', userData.uid);
                this.isLogin = false;
                this.util.publishLoggedIn('LoggedIn');
                this.router.navigate(['/']);
              } else {
                Swal.fire({
                  title: 'Error',
                  text: 'Your are blocked please contact administrator',
                  icon: 'error',
                  showConfirmButton: true,
                  showCancelButton: true,
                  confirmButtonText: 'Need Help?',
                  backdrop: false,
                  background: 'white',
                }).then((data) => {
                  if (data && data.value) {
                    localStorage.setItem('help', userData.uid);
                    this.router.navigate(['inbox']);
                  }
                });
              }
            })
            .catch((err) => {
              this.util.showToast(`${err}`, 'danger', 'bottom');
            });
        })
        .catch((err) => {
          if (err) {
            this.util.showToast(`${err}`, 'danger', 'bottom');
          }
        })
        .then((el) => (this.isLogin = false));
    }
  }

  resetPass() {
    this.router.navigate(['/forgot']);
  }
}
