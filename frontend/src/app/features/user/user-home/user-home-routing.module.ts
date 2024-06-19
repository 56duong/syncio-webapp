import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeedComponent } from './feed/feed.component';
import { ProfileComponent } from './profile/profile.component';
import { MessagesComponent } from './messages/messages.component';
import { SearchComponent } from './search/search.component';
import { CreatePostComponent } from './create-post/create-post.component';
import { LabelsShopComponent } from './labels-shop/labels-shop.component';
import { PaymentInfoComponent } from './payment-info/payment-info.component';

const routes: Routes = [
  {
    path: '',
    component: FeedComponent,
  },
  
  {
    path: 'profile/:userId',
    component: ProfileComponent,
  },
  {
    path: 'messages',
    component: MessagesComponent,
    loadChildren: () =>
      import('./messages/messages.module').then((m) => m.MessagesModule),
  },
  {
    path: 'create-post',
    component: CreatePostComponent,
  },
  {
    path: 'labels-shop',
    component: LabelsShopComponent
  },
  {
    path: 'payment-info',
    component: PaymentInfoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserHomeRoutingModule {}
