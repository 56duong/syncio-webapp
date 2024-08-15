import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UserSetting, WhoCanAddYouToGroupChat, WhoCanSendYouNewMessage } from 'src/app/core/interfaces/user-setting';
import { ToastService } from 'src/app/core/services/toast.service';
import { UserSettingService } from 'src/app/core/services/user-setting.service';

@Component({
  selector: 'app-message-controls',
  templateUrl: './message-controls.component.html',
  styleUrls: ['./message-controls.component.scss']
})

export class MessageControlsComponent {

  /** User setting of the current user */
  userSetting: UserSetting = {};

  /** Selected who can add you to group chat */
  selectedWhoCanAddYouToGroupChat: WhoCanAddYouToGroupChat = WhoCanAddYouToGroupChat.EVERYONE;
  /** Options for who can add you to group chat */
  whoCanAddYouToGroupChatOptions = [
    {
      label: this.translateService.instant('message_controls.everyone'),
      value: WhoCanAddYouToGroupChat.EVERYONE
    },
    {
      label: this.translateService.instant('message_controls.only_people_you_follow'),
      value: WhoCanAddYouToGroupChat.ONLY_PEOPLE_YOU_FOLLOW
    },
    {
      label: this.translateService.instant('message_controls.no_one'),
      value: WhoCanAddYouToGroupChat.NO_ONE
    },
  ];

  /** Selected who can send you new message */
  selectedWhoCanSendYouNewMessage: WhoCanSendYouNewMessage = WhoCanSendYouNewMessage.EVERYONE;
  /** Options for who can send you new message */
  whoCanSendMessageOptions = [
    {
      label: this.translateService.instant('message_controls.everyone'),
      value: WhoCanSendYouNewMessage.EVERYONE
    },
    {
      label: this.translateService.instant('message_controls.only_people_you_follow'),
      value: WhoCanSendYouNewMessage.ONLY_PEOPLE_YOU_FOLLOW
    },
    {
      label: this.translateService.instant('message_controls.no_one'),
      value: WhoCanSendYouNewMessage.NO_ONE
    },
  ];

  constructor(
    private userSettingService: UserSettingService,
    private translateService: TranslateService,
    private toastService: ToastService
  ) { }


  ngOnInit() {
    this.userSettingService.getUserSetting().subscribe({
      next: (userSetting) => {
        this.userSetting = userSetting;
        this.selectedWhoCanAddYouToGroupChat = userSetting.whoCanAddYouToGroupChat || WhoCanAddYouToGroupChat.EVERYONE;
        this.selectedWhoCanSendYouNewMessage = userSetting.whoCanSendYouNewMessage || WhoCanSendYouNewMessage.EVERYONE;
      }, error: (error) => {
        console.error(error);
      }
    });
  }


  updateWhoCanAddYouToGroupChat(whoCanAddYouToGroupChat: WhoCanAddYouToGroupChat) {
    this.userSettingService.updateWhoCanAddYouToGroupChat(whoCanAddYouToGroupChat).subscribe({
      next: (result) => {
        this.toastService.showSuccess(
          this.translateService.instant('common.success'),
          this.translateService.instant('message_controls.setting_saved')
        );
      }, error: (error) => {
        console.error(error);
      }
    });
  }


  updateWhoCanSendYouNewMessage(whoCanSendYouNewMessage: WhoCanSendYouNewMessage) {
    this.userSettingService.updateWhoCanSendYouNewMessage(whoCanSendYouNewMessage).subscribe({
      next: (result) => {
        this.toastService.showSuccess(
          this.translateService.instant('common.success'),
          this.translateService.instant('message_controls.setting_saved')
        );
      }, error: (error) => {
        console.error(error);
      }
    });
  }

}
