import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
    statusCode?: number;
    code?: string;
}

export function errorHandler(
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        code: err.code,
        path: req.path,
        method: req.method,
    });

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        error: {
            message,
            code: err.code,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
}

export function createError(message: string, statusCode: number = 500, code?: string): AppError {
    const error: AppError = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    return error;
}

export const notFound = (message: string = 'Resource not found') => createError(message, 404, 'NOT_FOUND');
export const badRequest = (message: string = 'Bad request') => createError(message, 400, 'BAD_REQUEST');
export const unauthorized = (message: string = 'Unauthorized') => createError(message, 401, 'UNAUTHORIZED');
export const forbidden = (message: string = 'Forbidden') => createError(message, 403, 'FORBIDDEN');
