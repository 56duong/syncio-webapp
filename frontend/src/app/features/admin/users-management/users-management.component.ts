import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { RoleEnum, User } from 'src/app/core/interfaces/user';
import { UserService } from 'src/app/core/services/user.service';

@Component({
    selector: 'app-users-management',
    templateUrl: './users-management.component.html',
    styleUrls: ['./users-management.component.scss'],
    providers: [MessageService, ConfirmationService],
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
        private messageService: MessageService,
        private confirmationService: ConfirmationService
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
    }

    editUser(user: User) {
        this.user = { ...user };
        this.userDialog = true;
    }

    hideDialog() {
        this.userDialog = false;
        this.submitted = false;
    }

    saveUser() {
        this.submitted = true;

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
                                console.error('Error fetching user', error);
                            },
                        });

                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'User Updated',
                            life: 3000,
                        });
                    },

                    error: (error) => {
                        console.error('Error updating user', error);
                    },
                });

            } else { // nguoc lai ko ton tai id (openNew -> this.user = {}) -> create user
                this.userService.createUserInAdmin(this.user).subscribe({
                    next: (data) => { // api create trả về data là UUID
                        this.userService.getUser(data).subscribe({
                            next: (user) => { // getUser trả về data là user vừa được create
                                console.log(user); 
                                this.user = user; // gán user được trả về vào biến user hiện tại đang rỗng
                                this.users.push(this.user); // đẩy user vào mảng 
                                this.users = [...this.users]; // update lại mảng
                            },
                            error: (error) => {
                                console.error('Error fetching user', error);
                            }
                        })
                    },
                    error: (error) => {
                        console.error('Error creating user', error);
                    }
                });

                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'User Created',
                    life: 3000,
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
