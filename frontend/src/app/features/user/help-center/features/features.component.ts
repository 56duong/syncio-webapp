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
      label: 'Steps to create a post in Syncio',
      content: `
        <p>To to create a post:</p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2"><i class="pi pi-mobile mx-1" style="font-size: 1rem"></i> Open the Syncio app on your device and log in to your account.</li>
          <li class="mt-2"><i class="pi pi-home mx-1" style="font-size: 1rem"></i> Navigate to the home screen. On the left menu navbar there is <strong>Create</strong> .</li>
          <li class="mt-2"><i class="pi pi-eye mx-1" style="font-size: 1rem"></i> Click <strong>Create</strong> then select options and <strong>Post</strong>.</li>
          <li class="mt-2"><i class="pi pi-pencil mx-1" style="font-size: 1rem"></i> With the status of the post next to your name. You can choose 3 corresponding options and save.</li>
          <li class="mt-2"><i class="pi pi-thumbs-up mx-1" style="font-size: 1rem"></i> Finally click the <strong>Share</strong> button on the right corner of the screen to complete</li>
        </ol>
        <p>Ensure a stable internet connection for a smooth experience and regularly check for app updates.</p>
      `,
      icon: 'pi pi-fw pi-tag mx-2 font-bold',
    },
    {
      label: 'Steps to Use the "Where See Syncio Your Post"',
      content: `
        <p>To use the "Where See Syncio Your Post" feature:</p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2"><i class="pi pi-mobile mx-1" style="font-size: 1rem"></i> Open the Syncio app on your device and log in to your account.</li>
          <li class="mt-2"><i class="pi pi-home mx-1" style="font-size: 1rem"></i> Navigate to the home screen where you can see posts suggested for you.</li>
          <li class="mt-2"><i class="pi pi-eye mx-1" style="font-size: 1rem"></i> Scroll through the "Suggested for you" section to view posts from other users.</li>
          <li class="mt-2"><i class="pi pi-pencil mx-1" style="font-size: 1rem"></i> Click on any post that interests you to view more details.</li>
          <li class="mt-2"><i class="pi pi-thumbs-up mx-1" style="font-size: 1rem"></i> Engage with the post by liking it or commenting.</li>
        </ol>
        <p>Ensure a stable internet connection for a smooth experience and regularly check for app updates.</p>
      `,
      icon: 'pi pi-fw pi-tag mx-2 font-bold',
    },
    {
      label: 'Steps to View Post Information in My Profile',
      content: `
        <p>To view post information in your profile:</p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2"><i class="pi pi-user mx-1" style="font-size: 1rem"></i> Open the Syncio app and log in to your account.</li>
          <li class="mt-2"><i class="pi pi-user mx-1" style="font-size: 1rem"></i> Click on your profile icon on the left sidebar.</li>
          <li class="mt-2"><i class="pi pi-info-circle mx-1" style="font-size: 1rem"></i> View your profile overview, including your posts, followers, and following.</li>
          <li class="mt-2"><i class="pi pi-folder mx-1" style="font-size: 1rem"></i> Click on the <strong>POSTS</strong> tab to see all your posts.</li>
          <li class="mt-2"><i class="pi pi-image mx-1" style="font-size: 1rem"></i> Click on a post thumbnail to view detailed information about it.</li>
        </ol>
        <p>Make sure your internet connection is stable for the best experience and keep your profile updated.</p>
      `,
      icon: 'pi pi-fw pi-book mx-2 font-bold',
},
    {
      label: 'How can create a collection for yourself?',
      content: `
        <p>To create a collection, you can:</p>
         <ol style="list-style-type: decimal;">
          <li class="mt-2"> After accessing your profile page, you can select the <strong>Collections</strong> tab next to the <strong>POSTS</strong> tab</li>
          <li class="mt-2"> Click <strong> + New Collection</strong></li>
          <li class="mt-2">Select photo, name and description as you want</li>
          <li class="mt-2">Press the save button to <strong>save</strong></li>
          <li class="mt-2">You will see the newly created collection appear on the collection tab</li>
        </ol>
      `,
      icon: 'pi pi-fw pi-times mx-2 font-bold',
    },
  ];

  editingProfileItems: { label: string, content: string , icon: string }[] = [
    {
      label: 'Update Syncio profile information such as username and bio',
      content: `
        <p>You'll need to log in to your account before you're able to update your profile information.</p>
        <p>In Accounts Centre, you can update your Syncio profile information, including your name, username . You can also choose to sync your profile info with your Facebook profile, if both accounts are added to the same Accounts Centre.</p>
        <p>To update your profile information:</p>
        <ol style="list-style-type: disc;">
          <li class="mt-2">After entering your personal page, you will see the words <strong>Edit profile</strong> or <i class="font-bold pi pi-cog"></i></li>
          <li class="mt-2"> <strong>Edit profile</strong> or <i class="font-bold pi pi-cog"></i>.</li>
          <li class="mt-2">Edit username, bio as desired.</li>
          <li class="mt-2">Click <strong>Sumbit</submit> to complete the update</li>
        </ol>
        <p>Your profile information will be updated.</p>
      `,
      icon:'pi pi-pencil mx-2 font-bold',
    },
    {
      label: 'Add or change your current profile picture on Syncio',
      content: `
        <p><strong>You can add or change your profile picture by following these steps:</strong></p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2">Click your profile picture on the left to go to your profile.</li>
          <li class="mt-2">Click and the image container is next to your name.</li>
          <li class="mt-2">Select your picture to import.A notification will appear when the image has changed</li>
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
          <li class="mt-2">Click <strong>Settings</strong> <i class="pi pi-cog"></i>at left side of the main screen.</li>
          <li class="mt-2">Scroll down and click <strong>Log out</strong>.</li>
        </ol>
        <p>You will be logged out of your account and redirected to the login screen.</p>
      `,
      icon: 'pi pi-sign-out mx-2 font-bold',
    },
    {
      label: 'Change your Syncio password if you forget or lose it.',
      content: `
        <p><strong>To change your password:</strong></p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2">Navigate to the login page.</li>
          <li class="mt-2">Click <strong>Forgot password</strong> below the password field.Will be redirected for you to enter your email</li>
          <li class="mt-2">Enter your email and click <strong>Reset password</strong>.</li>
          <li class="mt-2">The system will send to check your email. Check email and click <strong>Change my password</strong></li>
          <li class="mt-2">You will be redirected to the password change page. Enter a new password and click <strong>Submit</strong>.</li>
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
          <li class="mt-2">After logging in. You can navigate to the home screen.</li>
          <li class="mt-2">Click <strong>Search</strong> located in the navbar on the left side of the screen.</li>
          <li class="mt-2">Enter the  <strong>Username</strong> or <strong>Email</strong> of the person you want to search. We also have a search function based on the photos you upload.</li>
          <li class="mt-2">The person you want to search for or has similar features to the photo you uploaded will appear below.</li>
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
  
  buySuperLable: { label: string, content: string, icon: string }[] = [
    {
      label: 'Buy Labels',
      content: `
        <p><strong>To buy labels on Syncio:</strong></p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2">Log in to your Syncio account and navigate to the home screen.</li>
          <li class="mt-2">Click <strong>Label Shopping</strong> in the navbar on the left side of the screen.</li>
          <li class="mt-2">Browse through the available labels. Each label is displayed with an image, title, and price.</li>
          <li class="mt-2">Use the <strong>"Price Low to High"</strong> dropdown at the top to sort labels if desired.</li>
          <li class="mt-2">When you find a label you want, click the blue <strong>"Buy"</strong> button on its card.</li>
          <li class="mt-2">Follow any additional prompts to complete your purchase.</li>
          <li class="mt-2">After purchasing, you can check your <strong>"Purchase History"</strong> using the button in the top right corner.</li>
        </ol>
        <p>The Label Shopping feature allows you to easily find and purchase labels for your needs.</p>
      `,
      icon: 'pi pi-shopping-cart mx-2 font-bold',
    }
    
  ];  
  messagingItems: { label: string, content: string, icon: string }[] = [
    {
      label: 'Send a message to someone on Syncio',
      content: `
        <p><strong>To send a message on Syncio:</strong></p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2"><i class="pi pi-fw pi-comments"></i> Tap the <strong>Message</strong> icon located on the left navbar.</li>
          <li class="mt-2"><i class="pi pi-fw pi-user"></i>Selected the name of the person you want to send a message to.</li>
          <li class="mt-2"><i class="pi pi-fw pi-pencil"></i> Type your message and tap <strong>Send</strong>.</li>
        </ol>
      `,
      icon: 'pi pi-fw pi-send mx-2 font-bold',
    },
    {
      label: 'Types of messages that you can send in chats on Syncio',
      content: `
        <p>On Instagram, you can send the following types of messages:</p>
        <ul>
          <li class="mt-2"><i class="pi pi-fw pi-align-left"></i> <strong>Text messages:</strong> Send plain text messages.</li>
          <li class="mt-2"><i class="pi pi-fw pi-image"></i> <strong>Photos and videos:</strong> Send photos and videos from your gallery or take new ones using the camera.</li>
          <li class="mt-2"><i class="pi pi-fw pi-smile"></i> <strong>Stickers and GIFs:</strong> Send fun stickers and GIFs.</li>
        </ul>
      `,
      icon: 'pi pi-fw pi-comments mx-2 font-bold',
    },
    {
      label: 'View, react and reply to messages that you receive on Syncio',
      content: `
        <p><strong>To view, react, and reply to messages on Syncio:</strong></p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2"><i class="pi pi-fw pi-comments"></i> Tap the <strong>Message</strong> icon located on the left navbar.</li>          
          <li class="mt-2"><i class="pi pi-fw pi-comments"></i> Tap the conversation you want to view.</li>
          <li class="mt-2"><i class="pi pi-fw pi-thumbs-up"></i> To react to a message, tap and hold the message, then choose an emoji.</li>
          <li class="mt-2"><i class="pi pi-fw pi-reply"></i> To reply to a message, type your response in the text box and tap <strong>Send</strong>.</li>
        </ol>
      `,
      icon: 'pi pi-fw pi-eye mx-2 font-bold',
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
        <p>To create a new group chat on Syncio:</p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2">Open the Instagram app.</li>
          <li class="mt-2">Tap <strong>Message</strong> at the top left corner of the screen.</li>
          <li class="mt-2">Tap <strong><i class ="pi pi-pen-to-square></i></strong> in the top right after pressing message.</li>
          <li class="mt-2">Select multiple recipients by tapping on their names and click <strong>Chat</strong>.</li>
          <li class="mt-2">It will then switch to the conversation you just created.</li>
          <li class="mt-2">You can now start messaging with your group members.</li>
        </ol>
        <p>Group chats allow you to chat with multiple people at once, share photos and videos, and react to messages.</p>
      `,
      icon: 'pi pi-fw pi-users mx-2 font-bold',
    },
    {
      label: 'Add more people to group chats on Syncio',
      content: `
        <p>To add more people to a group chat on Syncio:</p>
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
