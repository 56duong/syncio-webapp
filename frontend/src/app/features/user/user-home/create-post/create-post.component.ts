import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Post } from 'src/app/core/interfaces/post';
import { PostService } from 'src/app/core/services/post.service';

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
  selectedPhotoFile: File[] = [];

  isEmojiPickerVisible: boolean = false;

  constructor(private postService: PostService) {}
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
      createdBy: '05bbc9bb-d13f-42c9-a97d-480bf8698307', // sau có login thì lấy thừ localStorage
    };

    console.log('Post: ', post);

    // call the post service to create a post
    this.postService.createPost(post).subscribe({
      next: (id) => {
        console.log('ID: ', id);

        // notify the FeedComponent to add the new post to the top of the feed
        this.postService.setNewPostCreated(post);
      },
      error: (error) => {
        console.log(error);
      },
    });
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
