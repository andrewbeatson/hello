import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import * as firebase from 'firebase';
import { AngularFirestore } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
export class AuthInfo {
  constructor(public $uid: string) {}

  isLoggedIn() {
    return !!this.$uid;
  }
}

@Injectable({
  providedIn: 'root',
})
export class ApisService {
  static UNKNOWN_USER = new AuthInfo(null);
  db = firebase.firestore();
  public authInfo$: BehaviorSubject<AuthInfo> = new BehaviorSubject<AuthInfo>(
    ApisService.UNKNOWN_USER
  );
  constructor(
    private fireAuth: AngularFireAuth,
    private adb: AngularFirestore,
    private http: HttpClient
  ) {}

  public checkAuth() {
    return new Promise((resolve, reject) => {
      this.fireAuth.auth.onAuthStateChanged((user) => {
        console.log(user);
        if (user) {
          localStorage.setItem('uid', user.uid);
          resolve(user);
        } else {
          this.logout();
          const selectedLocation = localStorage.getItem('selectedLocation');
          localStorage.clear();

          localStorage.setItem('selectedLocation', selectedLocation);
          resolve(false);
        }
      });
    });
  }

  public login(email: string, password: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.fireAuth.auth
        .signInWithEmailAndPassword(email, password)
        .then((res) => {
          if (res.user) {
            this.db
              .collection('users')
              .doc(res.user.uid)
              .update({
                fcm_token: localStorage.getItem('fcm')
                  ? localStorage.getItem('fcm')
                  : '',
              });
            this.authInfo$.next(new AuthInfo(res.user.uid));
            resolve(res.user);
          }
        })
        .catch((err) => {
          this.authInfo$.next(ApisService.UNKNOWN_USER);
          reject(`login failed ${err}`);
        });
    });
  }

  public getLocations(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb
        .collection('locations')
        .get()
        .subscribe(
          (location: any) => {
            const data = location.docs.map((element) => {
              const item = element.data();
              item.id = element.id;
              return item;
            });
            resolve(data);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  public resetPassword(email: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.fireAuth.auth
        .sendPasswordResetEmail(email)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(`reset failed ${err}`);
        });
    });
  }

  public logout(): Promise<void> {
    this.authInfo$.next(ApisService.UNKNOWN_USER);
    // this.db.collection('users').doc(localStorage.getItem('uid')).update({ "fcm_token": firebase.firestore.FieldValue.delete() })
    return this.fireAuth.auth.signOut();
  }

  public getProfile(id): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb
        .collection('users')
        .doc(id)
        .get()
        .subscribe(
          (profile: any) => {
            resolve(profile.data());
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  public getUsers(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb
        .collection('users')
        .get()
        .subscribe(
          (users) => {
            const data = users.docs.map((element) => {
              const item = element.data();
              item.id = element.id;
              return item;
            });
            resolve(data);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  public getMyProfile(id): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb
        .collection('users')
        .doc(id)
        .get()
        .subscribe(
          (users: any) => {
            resolve(users.data());
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  public getMessages(id): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb
        .collection('messages')
        .doc(id)
        .collection('chats')
        .get()
        .subscribe(
          (messages: any) => {
            console.log(messages);
            const data = messages.docs.map((element) => {
              const item = element.data();
              item.id = element.id;
              return item;
            });
            resolve(data);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  sendNotification(msg, title, id) {
    const body = {
      app_id: environment.onesignal.appId,
      include_player_ids: [id],
      headings: { en: title },
      contents: { en: msg },
      data: { task: msg },
    };
    const header = {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Basic ${environment.onesignal.restKey}`),
    };
    return this.http.post(
      'https://onesignal.com/api/v1/notifications',
      body,
      header
    );
  }

  public updateProfile(uid, param): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.db
        .collection('users')
        .doc(uid)
        .update(param)
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
