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
import { ListboxModule } from 'primeng/listbox';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { SidebarModule } from 'primeng/sidebar';
import { DropdownModule } from 'primeng/dropdown';
import { ColorPickerModule } from 'primeng/colorpicker';
import { KeyFilterModule } from 'primeng/keyfilter';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TieredMenuModule } from 'primeng/tieredmenu';

@NgModule({
  declarations: [],
  exports: [
    TieredMenuModule,
    ScrollPanelModule,
    ToggleButtonModule,
    KeyFilterModule,
    ColorPickerModule,
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
    DropdownModule,
    ListboxModule,
    ReactiveFormsModule,
    SidebarModule,
  ],
})
export class PrimengModule {}
