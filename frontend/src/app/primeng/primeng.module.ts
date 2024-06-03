import { NgModule } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { EditorModule } from 'primeng/editor';
import { CarouselModule } from 'primeng/carousel';
import { AvatarModule } from 'primeng/avatar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileUploadModule } from 'primeng/fileupload';
import { DropdownModule } from 'primeng/dropdown';
import { ListboxModule } from 'primeng/listbox';

@NgModule({
  declarations: [],
  exports: [
    FormsModule,
    CarouselModule,
    EditorModule,
    InputTextareaModule,
    DividerModule,
    InputTextModule,
    DialogModule,
    ButtonModule,
    AvatarModule,
    InputTextModule,
    FileUploadModule,
    DropdownModule,
    ListboxModule,
    ReactiveFormsModule,
  ],
})
export class PrimengModule {}
