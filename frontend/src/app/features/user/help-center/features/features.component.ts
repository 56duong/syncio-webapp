import { Component, Input } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss']
})
export class FeaturesComponent {
  @Input() selectedMenuItem!: string;
  @Input() selectedSubMenuItem!: string;
  @Input() selectedSubSubMenuItem!: string;

  visibleContentLabels: string[] = [];
  ngOnInit(): void {
    console.log(this.selectedMenuItem);
    
  }

  taggedContentItems: { label: string, content: string , icon : string}[] = [
    {
      label: 'Where to see Syncio posts that you’re tagged in',
      content: `
        <p>To see Syncio posts that you're tagged in:</p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2">Click your profile picture on the left to go to your profile.</li>
          <li class="mt-2">Click <i class="pi pi-user mx-1" style="font-size: 1rem"></i> <strong>TAGGED</strong>.</li>
        </ol>
        <p>You can choose to manually or automatically add these photos and videos to your profile. Note that you can also change who can tag you in your privacy settings.</p>
      `,
      icon: 'pi pi-fw pi-tag mx-2 font-bold',
    },
    {
      label: 'Who can see the posts that you’re tagged in on your Syncio profile',
      content: `
        <p>When other people tag you in photos or videos, they may show up on your profile. Who can see these on your profile depends on your visibility settings:</p>
        <ol style="list-style-type: disc;">
          <li class="mt-2"> <strong>Posts are public:</strong> Anyone can see photos and videos that you're tagged in on your profile.</li>
          <li class="mt-2"> <strong>Posts are private: </strong>Only confirmed followers can see photos and videos that you're tagged in on your profile.</li>
        </ol>
      
        `,
        icon: 'pi pi-fw pi-eye mx-2 font-bold',
    },
    {
      label: 'How can I manage tags and who can tag me?',
      content: `
        <p>To manage tags, you can:</p>
         <ol style="list-style-type: disc;">
          <li class="mt-2"> Hide photos and videos that you're tagged in from your profile.</li>
          <li class="mt-2"> Remove the tag if you don't want anyone to see them.</li>
          <li class="mt-2">Choose to manually approve photos and videos that you're tagged in before they appear on your profile.</li>
          <li class="mt-2">Change who can tag you in your privacy settings.</li>
        </ol>
      `,
      icon: 'pi pi-fw pi-times mx-2 font-bold',
    },
    {
      label: 'Manage who can mention you',
      content: `
        <p>Your mention settings allow you to manage who can link your account in stories, comments, live videos and captions.</p>
        <p>To update your mention settings:</p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2"> Click <i class="pi pi-align-justify mx-1  " style="font-size: 1rem"></i> More in the bottom left, then click Settings <i class="pi pi-cog" ></i></li>
          <li class="mt-2"> Below <strong>How others can interact with you</strong>, click <strong>Tags and mentions.</strong></li>
          <li class="mt-2">Below <strong>Who can @mention you</strong>, click a circle to select who can mention you (e.g. <strong/>Allow mentions from everyone, Allow mentions from people you follow or Don't allow mentions)</strong>.</li>
        </ol>
      `,
      icon: 'pi pi-check mx-2 font-bold',
    }
  ];

  editingProfileItems: { label: string, content: string , icon: string }[] = [
    {
      label: 'Update Syncio profile information such as your name, username and email address',
      content: `
        <p>You'll need to log in to your account before you're able to update your profile information.</p>
        <p class="mt-3"><strong>Update your profile information in Accounts Centre</strong></p>
        <p>In Accounts Centre, you can update your Syncio profile information, including your name, username and profile picture. You can also choose to sync your profile info with your Facebook profile, if both accounts are added to the same Accounts Centre.</p>
        <p>To update your profile information:</p>
        <ol style="list-style-type: disc;">
          <li class="mt-2">Click <strong><i class="pi pi-align-justify"></i> More</strong> in the bottom left, then click <strong>Settings</strong></li>
          <li class="mt-2"> Click <strong>See more in Accounts Centre</strong>, then click Profiles.</li>
          <li class="mt-2"> Click the profile information that you'd like to update (name, username or profile picture), then make the updates that you'd like to make.</li>
          <li class="mt-2">Click <strong>Done</strong>.</li>
        </ol>
        <p class="mt-3"><strong>Update your profile information from your profile</strong></p>
        <p>To update your profile information:</p>
        <ol style="list-style-type: disc;">
          <li class="mt-2">Click your profile picture on the left to go to your profile</li>
          <li class="mt-2">Click <strong>Edit profile</strong>.</li>
          <li class="mt-2">Type in your information and click <strong>Submit</strong>.</li>
        </ol>
      `,
      icon:'pi pi-pencil mx-2 font-bold',
    },
    {
      label: 'Add or change your current profile picture on Syncio',
      content: `
        <p><strong>You can add or change your profile picture by following these steps:</strong></p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2">Click your profile picture on the left to go to your profile.</li>
          <li class="mt-2">Click <strong>Edit profile</strong>.</li>
          <li class="mt-2">Click <strong>Upload photo</strong>, then select your picture to import.</li>
        </ol>
      `,
      icon: 'pi pi-image mx-2 font-bold',
    },
    {
      label: 'Logout from Syncio',
      content: `
        <p><strong>To log out of Syncio:</strong></p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2">Click your profile picture on the bottom right to go to your profile.</li>
          <li class="mt-2">Click <strong>Settings</strong> <i class="pi pi-cog"></i> at the top right.</li>
          <li class="mt-2">Scroll down and click <strong>Log out</strong>.</li>
        </ol>
        <p>You will be logged out of your account and redirected to the login screen.</p>
      `,
      icon: 'pi pi-sign-out mx-2 font-bold',
    },
    {
      label: 'Add a bio to your Syncio profile',
      content: `
        <p><strong>To add or change your bio:</strong></p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2">Click your profile picture on the left to go to your profile.</li>
          <li class="mt-2">Click <strong>Edit profile</strong>.</li>
          <li class="mt-2">Type in your bio in the <strong>Bio</strong> field.</li>
          <li class="mt-2">Click <strong>Submit</strong> to save your changes.</li>
        </ol>
        <p>Your bio will be updated and displayed on your profile.</p>
      `,
      icon: 'pi pi-pencil mx-2 font-bold',
    },
    {
      label: 'Change your Syncio password',
      content: `
        <p><strong>To change your password:</strong></p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2">Click your profile picture on the bottom right to go to your profile.</li>
          <li class="mt-2">Click <strong>Settings</strong> <i class="pi pi-cog"></i> at the top right.</li>
          <li class="mt-2">Click <strong>Security</strong> and then <strong>Password</strong>.</li>
          <li class="mt-2">Enter your current password, then enter your new password and confirm it.</li>
          <li class="mt-2">Click <strong>Change Password</strong> to save your changes.</li>
        </ol>
        <p>Your password will be updated. Make sure to use a strong and unique password to keep your account secure.</p>
      `,
      icon: 'pi pi-key mx-2 font-bold',
    }
  ];

  exploringPictureItems: { label: string, content: string, icon: string }[] = [
    {
      label: 'Search and Explore',
      content: `
        <p><strong>To use the Search and Explore feature on Instagram:</strong></p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2">Click the magnifying glass icon at the bottom of the screen.</li>
          <li class="mt-2">Use the search bar at the top to type in keywords, hashtags, or user names.</li>
          <li class="mt-2">Browse through the content in the Explore tab, which shows a variety of posts based on your interests.</li>
        </ol>
        <p>The Search and Explore feature helps you discover new content and accounts based on your preferences and interactions.</p>
      `,
      icon: 'pi pi-search mx-2 font-bold',
    },
    {
      label: 'How Instagram Feed Works',
      content: `
        <p><strong>Instagram Feed displays posts from the accounts you follow in chronological order, with newer posts appearing at the top.</strong></p>
        <p>You can also see suggested posts based on your interactions and interests.</p>
        <p>To interact with posts in your feed, you can:</p>
        <ul>
          <li class="mt-2">Like posts by double-tapping on the photo or video or by clicking the heart icon.</li>
          <li class="mt-2">Comment on posts by clicking the speech bubble icon and typing your comment.</li>
          <li class="mt-2">Share posts by clicking the paper airplane icon and sending them to your friends.</li>
        </ul>
        <p>Engaging with posts in your feed helps Instagram personalize your experience by showing you more content that you are likely to enjoy.</p>
      `,
      icon: 'pi pi-fw pi-list mx-2 font-bold',
    }
  ];  
  
  messagingItems: { label: string, content: string, icon: string }[] = [
    {
      label: 'Send a message to someone on Instagram',
      content: `
        <p><strong>To send a message on Instagram:</strong></p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2"><i class="pi pi-fw pi-comments"></i> Tap the <strong>paper airplane</strong> icon in the top right of Feed.</li>
          <li class="mt-2"><i class="pi pi-fw pi-user"></i> Tap the name of the person you want to send a message to.</li>
          <li class="mt-2"><i class="pi pi-fw pi-pencil"></i> Type your message and tap <strong>Send</strong>.</li>
        </ol>
      `,
      icon: 'pi pi-fw pi-send mx-2 font-bold',
    },
    {
      label: 'Types of messages that you can send in chats on Instagram',
      content: `
        <p>On Instagram, you can send the following types of messages:</p>
        <ul>
          <li class="mt-2"><i class="pi pi-fw pi-align-left"></i> <strong>Text messages:</strong> Send plain text messages.</li>
          <li class="mt-2"><i class="pi pi-fw pi-image"></i> <strong>Photos and videos:</strong> Send photos and videos from your gallery or take new ones using the camera.</li>
          <li class="mt-2"><i class="pi pi-fw pi-microphone"></i> <strong>Voice messages:</strong> Record and send voice messages.</li>
          <li class="mt-2"><i class="pi pi-fw pi-smile"></i> <strong>Stickers and GIFs:</strong> Send fun stickers and GIFs.</li>
        </ul>
      `,
      icon: 'pi pi-fw pi-comments mx-2 font-bold',
    },
    {
      label: 'View, react and reply to messages that you receive on Instagram',
      content: `
        <p><strong>To view, react, and reply to messages on Instagram:</strong></p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2"><i class="pi pi-fw pi-eye"></i> Tap the <strong>paper airplane</strong> icon in the top right of Feed.</li>
          <li class="mt-2"><i class="pi pi-fw pi-comments"></i> Tap the conversation you want to view.</li>
          <li class="mt-2"><i class="pi pi-fw pi-thumbs-up"></i> To react to a message, tap and hold the message, then choose an emoji.</li>
          <li class="mt-2"><i class="pi pi-fw pi-reply"></i> To reply to a message, type your response in the text box and tap <strong>Send</strong>.</li>
        </ol>
      `,
      icon: 'pi pi-fw pi-eye mx-2 font-bold',
    },
    {
      label: 'Unsend a message that you\'ve sent in a chat on Instagram',
      content: `
        <p><strong>To unsend a message:</strong></p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2"><i class="pi pi-fw pi-comments"></i> Go to the chat where you've sent the message.</li>
          <li class="mt-2"><i class="pi pi-fw pi-times"></i> Tap and hold the message you want to unsend.</li>
          <li class="mt-2"><i class="pi pi-fw pi-trash"></i> Tap <strong>Unsend</strong>, then tap <strong>Unsend</strong> again to confirm.</li>
        </ol>
      `,
      icon: 'pi pi-fw pi-trash mx-2 font-bold',
    },
    {
      label: 'Manage your conversations',
      content: `
        <p><strong>To manage your conversations on Instagram:</strong></p>
        <ul>
          <li class="mt-2"><i class="pi pi-fw pi-bell"></i> <strong>Mute notifications:</strong> Tap and hold a conversation, then tap <strong>Mute</strong>.</li>
          <li class="mt-2"><i class="pi pi-fw pi-times"></i> <strong>Delete a conversation:</strong> Tap and hold a conversation, then tap <strong>Delete</strong>.</li>
          <li class="mt-2"><i class="pi pi-fw pi-archive"></i> <strong>Archive a conversation:</strong> Swipe left on the conversation, then tap <strong>Archive</strong>.</li>
        </ul>
      `,
      icon: 'pi pi-fw pi-cog mx-2 font-bold',
    }
  ];

  groupChatItems: { label: string, content: string, icon: string }[] = [
    {
      label: 'Create a new group chat',
      content: `
        <p>To create a new group chat on Instagram:</p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2">Open the Instagram app.</li>
          <li class="mt-2">Tap <strong>Direct</strong> at the top right corner of the screen.</li>
          <li class="mt-2">Tap <strong>+</strong> in the top right corner or swipe left in your feed.</li>
          <li class="mt-2">Select multiple recipients by tapping on their names or searching for them.</li>
          <li class="mt-2">Tap <strong>Next</strong>, give your group a name, and tap <strong>Create</strong>.</li>
          <li class="mt-2">You can now start messaging with your group members.</li>
        </ol>
        <p>Group chats allow you to chat with multiple people at once, share photos and videos, and react to messages.</p>
      `,
      icon: 'pi pi-fw pi-users mx-2 font-bold',
    },
    {
      label: 'Add more people to group chats on Instagram',
      content: `
        <p>To add more people to a group chat on Instagram:</p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2">Open the group chat conversation.</li>
          <li class="mt-2">Tap the group name at the top of the chat.</li>
          <li class="mt-2">Tap <strong>Add People</strong> or <strong>Invite to Chat</strong>.</li>
          <li class="mt-2">Select the people you want to add and tap <strong>Send</strong>.</li>
          <li class="mt-2">The new members will be added to the group chat.</li>
        </ol>
        <p>You can add new members to a group chat at any time, allowing more people to join the conversation.</p>
      `,
      icon: 'pi pi-fw pi-user-plus mx-2 font-bold',
    }
  ];


  toggleContent(label: string) {
    const index = this.visibleContentLabels.indexOf(label);
    if (index === -1) {
      this.visibleContentLabels.push(label);
    } else {
      this.visibleContentLabels.splice(index, 1);
    }
  }

  isContentVisible(label: string): boolean {
    return this.visibleContentLabels.includes(label);
  }
}
