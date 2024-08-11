import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Label, StatusEnum } from 'src/app/core/interfaces/label';
import { LabelService } from 'src/app/core/services/label.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { UserService } from'src/app/core/services/user.service';
import { ImageUtils } from 'src/app/core/utils/image-utils';
import { UserResponse } from 'src/app/features/authentication/login/user.response';
import { Table } from 'primeng/table';

@Component({
    selector: 'app-labels-management',
    templateUrl: './labels-management.component.html',
    styleUrls: ['./labels-management.component.scss'],
})
export class LabelsManagementComponent implements OnInit {
    @ViewChild('fileUploader') fileUploader: any;

    labelDialog: boolean = false;

    labels!: Label[];

    label!: Label;

    statuses?: any[];

    user?: UserResponse | null = this.userService.getUserResponseFromLocalStorage();

    selectedLabels: string[] = [];

    selectedLabelFile: File[] = [];

    submitted: boolean = false;

    @ViewChild('dt') dt: Table | undefined;

    constructor(
        private labelService: LabelService,
        private toastService: ToastService,
        private userService: UserService,
        private cdr: ChangeDetectorRef,
        public imageUtils: ImageUtils
    ) { }

    ngOnInit() {
        this.labelService.getLabels().subscribe({
            next: (data) => {
                this.labels = data;
            },
            error: (error) => {
                console.log(error);
                this.toastService.showError('Error fetching labels', error);
            },
        });

        this.statuses = [
            { label: 'ENABLED', value: 'ENABLED' },
            { label: 'DISABLED', value: 'DISABLED' },
        ];

    }

    openNew() {
        this.label = {};
        this.submitted = false;
        this.labelDialog = true;
        this.label.status = StatusEnum.ENABLED;
    }

    editLabel(label: Label) {
        this.label = { ...label };
        this.labelDialog = true;
    }

    hideDialog() {
        this.selectedLabels = []; // xoá label đã chọn -> khi mở dialog lên sẽ không hiển thị label đã chọn
        this.labelDialog = false;
        this.submitted = false;
    }

    onLabelSelected(event: any) {
        this.selectedLabelFile = Array.from(event.files);
        this.selectedLabels = [];

        for (let file of this.selectedLabelFile) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.selectedLabels = [...this.selectedLabels, e.target.result];

                this.cdr.detectChanges();
            };
            reader.readAsDataURL(file);
        }
        this.fileUploader.clear();
    }


    saveLabel() {
        this.submitted = true;

        // check input name is "" 
        if (this.label.name == "") {
            this.toastService.showError('Error','Please enter name');
            return;
        }

        // check price is null
        if (this.label.price == null) {
            this.toastService.showError('Error','Please enter price');
            return;
        }

        // check price < 0
        if (this.label.price < 10000) {
            this.toastService.showError('Error','Price must be greater than or equal to 10.000');
            return;
        }

        const label: Label = {
            name: this.label.name,
            price: this.label.price,
            description: this.label.description,
            status: this.label.status,
            createdBy: this.user?.id,
        };

        const formData = new FormData();

        formData.append(
            'labelDTO',
            new Blob([JSON.stringify(label)], { type: 'application/json' })
        );

        label.labelURL = this.selectedLabels[0];

        // xu ly create hoac update
        if (this.label.id) {
            // append file with name is label id to overwrite the old image
            this.selectedLabelFile.forEach((photo: File, index) => {
                formData.append('file', new File([photo], this.label.id + photo.name.slice(photo.name.lastIndexOf('.')), {
                    type: photo.type,
                }));
            });

            // neu ton tai id -> update label
            // check xem ten moi co trung voi ten cua cac label khac tru ban than hay ko
            const currentIndex = this.labels.findIndex((x) => x.id === this.label.id);
            
            if (this.labels.some((label, index) => label.name === this.label.name && index !== currentIndex)) {
                this.toastService.showError('Error','Label name already exists');
                return;
            }

            this.labelService.updateLabel(this.label.id, formData).subscribe({
                next: (response: any) => {
                    this.imageUtils.refreshDateTime();
                    console.log(response);
                    const index = this.labels.findIndex(x => x.id === response.id);
                    this.labels[index] = response;
                    this.labels = [...this.labels];
                    this.cdr.detectChanges();
                    this.toastService.showSuccess('Success','Label Updated');
                },
                error: (error) => {
                    this.toastService.showError('Error','Error updating label');
                },
            });

        } 
        else {
            this.selectedLabelFile.forEach((photo: File, index) => {
                formData.append(`file`, photo);
            });

            // nguoc lai if id not exist -> create label
            // Kiểm tra xem tên đã tồn tại trong mảng chưa
            if (this.labels.some((label) => label.name === this.label.name)) {
                this.toastService.showError('Error','Label name already exists');
                return;
            }

            // if create new -> check image is null 
            if (this.selectedLabels[0] == null) {
                this.toastService.showError('Error','Please select label image');
                return;
            }

            this.labelService.createLabel(formData).subscribe({
                next: (response: any) => {
                    this.label = response;
                    this.labels.unshift(this.label);
                    this.labels = [...this.labels];
                    this.toastService.showSuccess('Success','Label Created');
                },
                error: (error) => {
                    this.toastService.showError('Error',error.error.message);
                },
            });
        }

        this.label = {};
        this.selectedLabels = [];
        this.selectedLabelFile = [];
        this.labelDialog = false;
    }


    getSeverity(status: string) {
        switch (status) {
            case 'ENABLED':
                return 'success';
            case 'DISABLED':
                return 'danger';
            default:
                return 'info';
        }
    }

    onInputChange(event: Event) {
        if (this.dt) {
          const inputElement = event.target as HTMLInputElement;
          this.dt.filterGlobal(inputElement.value, 'contains');
        } else {
          console.error('Table component (dt) is not initialized.');
        }
    }
}
