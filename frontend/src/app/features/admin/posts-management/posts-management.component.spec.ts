import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostsManagementComponent } from './posts-management.component';

describe('PostsManagementComponent', () => {
  let component: PostsManagementComponent;
  let fixture: ComponentFixture<PostsManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PostsManagementComponent]
    });
    fixture = TestBed.createComponent(PostsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
