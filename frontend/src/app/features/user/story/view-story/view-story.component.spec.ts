import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewStoryComponent } from './view-story.component';

describe('ViewStoryComponent', () => {
  let component: ViewStoryComponent;
  let fixture: ComponentFixture<ViewStoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewStoryComponent]
    });
    fixture = TestBed.createComponent(ViewStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
