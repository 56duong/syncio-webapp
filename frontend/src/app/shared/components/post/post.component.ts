import { Component, Input } from '@angular/core';
import { Post } from 'src/app/core/interfaces/post';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})

export class PostComponent {
  @Input() post: Post = {};
  
  visible: boolean = false;


  showPostDetail(event: any) {
    this.visible = event;

  }
}
