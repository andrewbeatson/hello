import {
  Component,
  OnInit,
  ViewChild,
  ViewChildren,
  QueryList,
  ElementRef,
} from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { ApiService } from 'src/app/services/api.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  @ViewChild('scrollMe', { static: false })
  private myScrollContainer: ElementRef;
  @ViewChildren('messages') messagesList: QueryList<any>;

  message: any;
  messages: any[] = [];
  id: any;
  count: any = 0;
  haveLocation: boolean;
  locationName: any;
  locationId: any;
  profile: any;

  constructor(
    private adb: AngularFirestore,
    private api: ApiService,
    private navCtrl: NavController
  ) {
    this.haveLocation = false;
    const location = JSON.parse(localStorage.getItem('selectedLocation'));
    if (location && location.name) {
      this.locationName = location.name;
      this.locationId = location.id;
    }
    if (!localStorage.getItem('help')) {
      localStorage.setItem('help', localStorage.getItem('uid'));
    }
    this.id = 'admin' + localStorage.getItem('help');
    this.getMessages();
    this.adb
      .collection('users')
      .doc(localStorage.getItem('help'))
      .snapshotChanges()
      .subscribe((data) => {
        this.api
          .getProfile(localStorage.getItem('help'))
          .then((info) => {
            if (info && info.count) {
              this.count = info.count;
            } else {
              this.count = 0;
            }
          })
          .catch((error) => {});
      });
  }

  getMessages() {
    this.adb
      .collection('messages')
      .doc(this.id)
      .collection('chats')
      .snapshotChanges()
      .subscribe(
        (data) => {
          this.api
            .getMessages(this.id)
            .then((info) => {
              info.sort(
                (a, b) =>
                  new Date(a.timestamp).getTime() -
                  new Date(b.timestamp).getTime()
              );
              this.messages = info;
              this.scrollToBottomOnInit();
            })
            .catch((error) => {});
        },
        (error) => {}
      );
  }

  send() {
    if (this.message && this.id) {
      const text = this.message;
      this.message = '';
      const id = Math.floor(100000000 + Math.random() * 900000000);
      const data = {
        msg: text,
        from: 'user',
        timestamp: new Date().toISOString(),
        id: this.id,
        docId: id,
      };
      this.adb
        .collection('messages')
        .doc(this.id)
        .collection('chats')
        .doc(id.toString())
        .set(data)
        .then((data) => {})
        .catch((error) => {});

      const count = {
        count: this.count + 1,
      };
      this.api
        .updateProfile(localStorage.getItem('help'), count)
        .then((data) => {})
        .catch((error) => {});
    }
  }

  ngOnInit() {}

  scrollToBottomOnInit() {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  changeLocation() {
    this.navCtrl.navigateRoot(['locations']);
  }

  updateProfile() {
    this.navCtrl.navigateRoot(['edit-profile']);
  }
}
