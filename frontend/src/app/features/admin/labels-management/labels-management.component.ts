import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Label } from 'src/app/core/interfaces/label';
import { LabelService } from 'src/app/core/services/label.service';

@Component({
    selector: 'app-labels-management',
    templateUrl: './labels-management.component.html',
    styleUrls: ['./labels-management.component.scss'],
    providers: [MessageService, ConfirmationService],
})
export class LabelsManagementComponent implements OnInit {
    @ViewChild('fileUploader') fileUploader: any;

    labelDialog: boolean = false;

    labels!: Label[];

    label!: Label;

    selectedLabels: string[] = [];

    selectedLabelFile: File[] = [];

    submitted: boolean = false;

    dateNow = Date.now();

    constructor(
        private labelService: LabelService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.labelService.getLabels().subscribe({
            next: (data) => {
                this.labels = data;
                console.log(this.labels);
            },
            error: (error) => {
                console.error('Error fetching labels', error);
            },
        });

    }

    openNew() {
        this.label = {};
        this.submitted = false;
        this.labelDialog = true;
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

        const label: Label = {
            name: this.label.name,
            price: this.label.price,
            description: this.label.description,
        };

        formData.append(
            'labelDTO',
            new Blob([JSON.stringify(this.label)], { type: 'application/json' })
        );

        this.selectedLabelFile.forEach((photo: File, index) => {
            formData.append(`file`, photo);
        });

        label.labelURL = this.selectedLabels[0];

        // xu ly create hoac update
        if (this.label.id) {
            // neu ton tai id -. update label
            this.labelService.updateLabel(this.label.id, formData).subscribe({
                next: (response: any) => {
                    const index = this.labels.findIndex(x => x.id === response.id);
                    this.labels[index] = response;
                    this.dateNow = Date.now();
                    this.labels = [...this.labels];
                    this.cdr.detectChanges();
                    
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.error.message, // Nơi nhận error từ backend
                        life: 3000,
                    });
                },
            });
        } else {
            // nguoc lai -> create label
             // Kiểm tra xem tên đã tồn tại trong mảng chưa
            if (this.labels.some((label) => label.name === this.label.name)) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Label name already exists',
                    life: 3000,
                });
                return;
            }

            if (this.selectedLabels[0] == null) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Please select label image',
                    life: 3000,
                });
                return;
            }

            this.labelService.createLabel(formData).subscribe({
                next: (response: any) => {
                    this.label = response;
                    this.labels.push(this.label);
                    this.labels = [...this.labels];
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.error.message, // Nơi nhận error từ backend
                        life: 3000,
                    });
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
}
