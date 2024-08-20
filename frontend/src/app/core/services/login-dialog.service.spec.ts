import { TestBed } from '@angular/core/testing';

import { LoginDialogService } from './login-dialog.service';

describe('LoginDialogService', () => {
  let service: LoginDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
