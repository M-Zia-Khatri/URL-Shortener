export class AppError extends Error { constructor(public statusCode:number,message:string,public code='INTERNAL_ERROR'){super(message)} }
export class BadRequestError extends AppError { constructor(message:string){super(400,message,'BAD_REQUEST')} }
export class NotFoundError extends AppError { constructor(message='URL not found'){super(404,message,'NOT_FOUND')} }
export class GoneError extends AppError { constructor(message='URL is no longer available'){super(410,message,'GONE')} }
export class RateLimitError extends AppError { constructor(){super(429,'Rate limit exceeded','RATE_LIMITED')} }
