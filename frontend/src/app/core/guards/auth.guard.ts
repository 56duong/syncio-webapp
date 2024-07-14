import { CanActivateFn } from '@angular/router';
import { TokenService } from '../services/token.service';
import { inject } from '@angular/core';
import { RoleEnum } from '../interfaces/user';

export const authGuard: CanActivateFn = (route, state) => {
  const requiredRoles = route.data['requiredRoles'] as RoleEnum[];
  return inject(TokenService).canActivate(requiredRoles);
};
