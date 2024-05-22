import { NgModule } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

@NgModule({
  declarations: [],
  exports: [
    InputTextModule,
    DialogModule,
    ButtonModule,
  ]
})

export class PrimengModule { }
