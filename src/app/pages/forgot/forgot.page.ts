import { Component, OnInit } from '@angular/core';
import { Forgot } from 'src/app/interfaces/forgot';
import { NgForm } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { UtilService } from 'src/app/services/util.service';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.page.html',
  styleUrls: ['./forgot.page.scss'],
})
export class ForgotPage implements OnInit {
  login: Forgot = { email: '' };
  submitted = false;
  constructor(
    private router: Router,
    private navCtrl: NavController,
    private util: UtilService,
    private api: ApiService
  ) {}

  ngOnInit() {}

  loginPage() {
    this.router.navigate(['/login']);
  }

  onLogin(form: NgForm) {
    this.submitted = true;
    if (form.valid) {
      const emailfilter = /^[\w._-]+[+]?[\w._-]+@[\w.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailfilter.test(this.login.email)) {
        this.util.showToast('Please enter valid email', 'danger', 'bottom');
        return false;
      }
      this.util.show();
      this.api
        .resetPassword(this.login.email)
        .then(
          (data) => {
            this.util.hide();
            this.util.showToast(
              'Reset Password link is sent to your email',
              'dark',
              'bottom'
            );
            this.navCtrl.back();
          },
          (error) => {
            this.util.hide();
            this.util.showErrorAlert('Something went wrong');
          }
        )
        .catch((error) => {
          this.util.hide();
          this.util.showErrorAlert('Something went wrong');
        });
    }
  }
}
