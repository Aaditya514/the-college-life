import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  const currentUser = authService.currentUser();

  let headers = req.headers;

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  if (currentUser?.id) {
    headers = headers.set('X-User-Id', currentUser.id);
  }

  const cloned = req.clone({ headers });
  return next(cloned);
};
