import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private router: Router,
    private oneSignal: OneSignal
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      setTimeout(async () => {
        await this.oneSignal.startInit(
          environment.onesignal.appId,
          environment.onesignal.googleProjectNumber
        );
        this.oneSignal.getIds().then((data) => {
          localStorage.setItem('fcm', data.userId);
        });
        await this.oneSignal.endInit();
      }, 1000);

      this.platform.backButton.subscribe(async () => {
        if (
          this.router.url.includes('/tabs/') ||
          this.router.url.includes('/login')
        ) {
          navigator['app'].exitApp();
        }
      });
      this.statusBar.backgroundColorByHexString('#ff384c');
      this.splashScreen.hide();
    });
  }
}
