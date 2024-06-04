import { NgModule } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { EditorModule } from 'primeng/editor';
import { CarouselModule } from 'primeng/carousel';
import { AvatarModule } from 'primeng/avatar';
import { FormsModule } from '@angular/forms';
import { FileUploadModule } from 'primeng/fileupload';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { SidebarModule } from 'primeng/sidebar';
import { DropdownModule } from 'primeng/dropdown';

@NgModule({
  declarations: [],
  exports: [
    DropdownModule,
    AutoCompleteModule,
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
    SidebarModule,
  ],
})
export class PrimengModule {}
