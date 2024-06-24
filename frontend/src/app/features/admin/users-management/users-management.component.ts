
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RoleEnum, StatusEnum, User } from 'src/app/core/interfaces/user';
import { ToastService } from 'src/app/core/services/toast.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
    selector: 'app-users-management',
    templateUrl: './users-management.component.html',
    styleUrls: ['./users-management.component.scss'],
})

export class UsersManagementComponent implements OnInit {
    userDialog: boolean = false;

    users!: User[];

    user!: User;

    selectedUsers!: User[] | null;

    submitted: boolean = false;

    statuses!: any[];

    roles!: any[];

    constructor(
        private userService: UserService,
        private toastService: ToastService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.userService.getUsers().subscribe({
            next: (data) => {
                this.users = data;
            },
            error: (error) => {
                console.error('Error fetching users', error);
            },
        });

        this.statuses = [
            { label: 'ACTIVE', value: 'ACTIVE' },
            { label: 'BANNED', value: 'BANNED' },
            { label: 'DISABLED', value: 'DISABLED' },
        ];

        this.roles = [
            { label: 'ADMIN', value: 'ADMIN' },
            { label: 'USER', value: 'USER' },
        ];
    }

    openNew() {
        this.user = {};
        this.submitted = false;
        this.userDialog = true;
        this.user.role = RoleEnum.USER; // mặc định khi new 1 User sẽ 4cus vào role 'USER'
        this.user.status = StatusEnum.ACTIVE; // mặc định khi new 1 User sẽ 4cus vào status 'ACTIVE'
    }

    editUser(user: User) {
        this.user = { ...user };
        this.userDialog = true;
    }

    hideDialog() {
        this.userDialog = false;
        this.submitted = false;
    }

    checkEmail(email: string): boolean {
        const emailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

    saveUser() {
        this.submitted = true;

        // check email is empty
        if (!this.user.email?.trim()) {
            this.toastService.showError('Error','Email is required');
            return;
        }
        // check email regex
        if (this.user.email && this.checkEmail(this.user.email) === false){
            this.toastService.showError('Error','Invalid email');
            return;
        }
        
        if (this.user.username?.trim()) {
            if (this.user.id) { // ton tai id -> update user
                this.userService.updateUserInAdmin(this.user).subscribe({
                    next: (data) => {  // update trong UserController trả về UUID => data = UUID
                        const index = this.users.findIndex(u => u.id === data);

                        // lấy user mới từ db bằng data = UUID để update vào bảng ở fontend
                        this.userService.getUser(data).subscribe({
                            next: (user) => {
                                this.users[index] = user;
                            },
                            error: (error) => {
                                this.toastService.showError('Error','Error fetching user');
                            },
                        });

                        this.toastService.showSuccess('Success','User Updated');
                    },

                    error: (error) => {
                        this.toastService.showError('Error', error.error.message);
                    },
                });

            } else { // nguoc lai ko ton tai id (openNew -> this.user = {}) -> create user
                this.userService.createUserInAdmin(this.user).subscribe({
                    next: (data) => { // api create trả về data là UUID
                        this.userService.getUser(data).subscribe({
                            next: (user) => { // getUser trả về data là user vừa được create
                                this.user = user; // gán user được trả về vào biến user hiện tại đang rỗng
                                this.users.unshift(this.user); // đẩy user vào đầu mảng 
                                this.users = [...this.users]; // update lại mảng
                            },
                            error: (error) => {
                                this.toastService.showError('Error','Error fetching user');
                            }
                        })
                        this.toastService.showSuccess('Success','User Created');
                    },
                    error: (error) => {
                        this.toastService.showError('Error', error.error.message);
                    }
                }); 
            }

            this.userDialog = false;
            this.user = {};
        }
    }

    findIndexById(id: string): number {
        let index = -1;
        for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    }

    getSeverity(status: string) {
        switch (status) {
            case 'ACTIVE':
                return 'success';
            case 'BANNED':
                return 'warning';
            case 'DISABLED':
                return 'danger';
            default:
                return 'info';
        }
    }
}
