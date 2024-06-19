import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Label, StatusEnum } from 'src/app/core/interfaces/label';
import { LabelService } from 'src/app/core/services/label.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { UserService } from'src/app/core/services/user.service';
import { UserResponse } from 'src/app/features/authentication/login/user.response';

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

    nameCreatedBy?: any;

    selectedLabels: string[] = [];

    selectedLabelFile: File[] = [];

    submitted: boolean = false;

    dateNow: any = null;

    constructor(
        private labelService: LabelService,
        private toastService: ToastService,
        private userService: UserService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.labelService.getLabels().subscribe({
            next: (data) => {
                this.labels = data;
                // chuyen uuid cua createdBy thanh username cho de nhin
                this.labels.forEach((label) => {
                    if (label.createdBy) {
                        this.userService.getUser(label.createdBy).subscribe({
                            next: (data) => {
                                this.nameCreatedBy = data.username;
                            },
                            error: (error) => {
                                this.toastService.showError('Error fetching user', error);
                            },
                        });
                    }  
                }); 
            },
            error: (error) => {
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

        const formData = new FormData();

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
        if (this.label.price < 0) {
            this.toastService.showError('Error','Price must be greater than 0');
            return;
        }

        const label: Label = {
            name: this.label.name,
            price: this.label.price,
            description: this.label.description,
            status: this.label.status,
            createdBy: this.user?.id,
        };

        formData.append(
            'labelDTO',
            new Blob([JSON.stringify(label)], { type: 'application/json' })
        );

        this.selectedLabelFile.forEach((photo: File, index) => {
            formData.append(`file`, photo);
        });

        label.labelURL = this.selectedLabels[0];

        // xu ly create hoac update
        if (this.label.id) {
            // neu ton tai id -> update label
            // check xem ten moi co trung voi ten cua cac label khac tru ban than hay ko
            const currentIndex = this.labels.findIndex((x) => x.id === this.label.id);
            
            if (this.labels.some((label, index) => label.name === this.label.name && index !== currentIndex)) {
                this.toastService.showError('Error','Label name already exists');
                return;
            }

            this.labelService.updateLabel(this.label.id, formData).subscribe({
                next: (response: any) => {
                    console.log(response);
                    const index = this.labels.findIndex(x => x.id === response.id);
                    this.labels[index] = response;
                    this.dateNow = Date.now();
                    this.labels = [...this.labels];
                    this.cdr.detectChanges();
                    this.toastService.showSuccess('Success','Label Updated');
                },
                error: (error) => {
                    this.toastService.showError('Error','Error updating label');
                },
            });

        } else {
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
        this.labelDialog = false;
    }

    findIndexById(id: string): number {
        let index = -1;
        for (let i = 0; i < this.labels.length; i++) {
            if (this.labels[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
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
}
