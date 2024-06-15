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
import { KeyFilterModule } from 'primeng/keyfilter';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { ContextMenuModule } from 'primeng/contextmenu';
import { TabViewModule } from 'primeng/tabview';
import { SliderModule } from 'primeng/slider';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DataViewModule } from 'primeng/dataview';

@NgModule({
  declarations: [],
  exports: [
    SliderModule,
    TabViewModule,
    ContextMenuModule,
    TieredMenuModule,
    ScrollPanelModule,
    ToggleButtonModule,
    KeyFilterModule,
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
    FileUploadModule,
    SidebarModule,
    TableModule,
    ToastModule,
    ToolbarModule,
    TagModule,
    ConfirmDialogModule,
    RadioButtonModule,
    DataViewModule,
  ],
})
export class PrimengModule {}
