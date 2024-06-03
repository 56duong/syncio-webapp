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
<<<<<<< HEAD
import { DropdownModule } from 'primeng/dropdown';
import { ListboxModule } from 'primeng/listbox';
=======
import { AutoCompleteModule } from 'primeng/autocomplete';
import { SidebarModule } from 'primeng/sidebar';
>>>>>>> 24ed730fc84260aeb60a474282a3d62222fd8f63

@NgModule({
  declarations: [],
  exports: [
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
<<<<<<< HEAD
    DropdownModule,
    ListboxModule,
    ReactiveFormsModule,
=======
    SidebarModule,
>>>>>>> 24ed730fc84260aeb60a474282a3d62222fd8f63
  ],
})
export class PrimengModule {}
