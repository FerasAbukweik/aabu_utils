import { HttpInterceptorFn } from '@angular/common/http';

export const contentTypeInterceptor: HttpInterceptorFn = (req, next) => {
  const cloned = req.clone({
    headers: req.headers.append('Content-Type', 'application/x-www-form-urlencoded'),
    responseType: 'text',
  });

  return next(cloned);
};
