import { Component } from '@angular/core';
import { Post } from 'src/app/core/interfaces/post';
import { PostService } from 'src/app/core/services/post.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss'],
})

export class CreatePostComponent {
  display!: boolean;
  title: string = '' as string;
  post: Post = {};
  selectedPhotos: string[] = [];

  isEmojiPickerVisible: boolean = false;

  constructor(
    private postService: PostService,
    private userService: UserService
  ) { }

  showDialog() {
    this.display = true;
  }

  onCancel() {
    this.display = false;
  }

  // create a post
  createPost() {
    const post: Post = {
      caption: this.post.caption,
      photos: this.selectedPhotos,
      createdDate: new Date().toISOString(),
      flag: true,
      createdBy: this.userService.getUserResponseFromLocalStorage()?.id,
    };

    this.postService.createPost(post).subscribe({
      next: (id) => {
        post.id = id;
         // set the new post created in the PostService to notify the FeedComponent to add the new post to the top of the feed.
        this.postService.setNewPostCreated(post);
      },
      error: (error) => {
        console.log(error);
      }
    })
    this.display = false;
  }

  // select photos from the file input
  onPhotoSelected(event: any) {
    this.selectedPhotos = [];
    const files: File[] = event.files;
    for (let file of files) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedPhotos.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  // show the emoji picker (icon)
  addEmoji(event: any) {
    this.post.caption += event.emoji.native;
    this.isEmojiPickerVisible = false;
  }
  
}
