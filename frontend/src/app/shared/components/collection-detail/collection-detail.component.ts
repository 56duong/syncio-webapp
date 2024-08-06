import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Post } from 'src/app/core/interfaces/post';
import { PostCollection } from 'src/app/core/interfaces/post-collection';
import { PostCollectionDetailService } from 'src/app/core/services/post-collection-detail.service';
import { PostCollectionService } from 'src/app/core/services/post-collection.service';

@Component({
  selector: 'app-collection-detail',
  templateUrl: './collection-detail.component.html',
  styleUrls: ['./collection-detail.component.scss']
})

export class CollectionDetailComponent {
  userId: string = ''; // the owner of the collection
  collectionId: string = ''; // the collection id

  collection: PostCollection = {}; // the collection to show
  posts: Post[] = []; // the posts in the collection

  constructor(
    private route: ActivatedRoute,
    private postCollectionService: PostCollectionService,
    private postCollectionDetailService: PostCollectionDetailService
  ) { }


  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      this.userId = params['userId'];
      this.collectionId = params['collectionId'];
      this.collection.id = undefined;
      this.getCollectionById();
      this.getPostsByCollectionId();
    });
  }


  getCollectionById() {
    this.postCollectionService.getById(this.collectionId).subscribe({
      next: (data) => {
        this.collection = data;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }


  getPostsByCollectionId() {
    this.postCollectionDetailService.getByCollectionId(this.collectionId).subscribe({
      next: (data) => {
        this.posts = data;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

}
