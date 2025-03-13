import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

/**
 * Handles Prisma Client known request errors as HTTP errors
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
    private setResponse(
        response: Response,
        status: HttpStatus,
        message: string,
    ) {
        response.status(status).json({
            statusCode: status,
            message: message,
        });
    }

    catch(
        exception: Prisma.PrismaClientKnownRequestError,
        host: ArgumentsHost,
    ) {
        const context = host.switchToHttp();

        const response = context.getResponse<Response>();
        const message = exception.message.replace(/\n/g, '');

        switch (exception.code) {
            // Unique constraint validation failed
            case 'P2002':
                this.setResponse(response, HttpStatus.CONFLICT, message);
                break;
            // Record not found
            case 'P2001':
            case 'P2015':
            case 'P2018':
            case 'P2025':
                this.setResponse(response, HttpStatus.NOT_FOUND, message);
                break;
            // Foreign key constraint failed
            case 'P2003':
                this.setResponse(response, HttpStatus.CONFLICT, message);
                break;
            // Field/constraint validation errors
            case 'P2000': // Value too long
            case 'P2005': // Invalid value for field type
            case 'P2006': // Invalid value for field
            case 'P2007': // Data validation error
            case 'P2011': // Null constraint violation
            case 'P2012': // Missing required value
            case 'P2013': // Missing required argument
                this.setResponse(response, HttpStatus.BAD_REQUEST, message);
                break;
            // Database structure issues
            case 'P2021': // Table not found
            case 'P2022': // Column not found
                this.setResponse(
                    response,
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    message,
                );
                break;
            // Query-related errors
            case 'P2008': // Failed to parse query
            case 'P2009': // Failed to validate query
            case 'P2010': // Raw query failed
            case 'P2016': // Query interpretation error
                this.setResponse(response, HttpStatus.BAD_REQUEST, message);
                break;
            // Relation errors
            case 'P2017': // Records not connected
            case 'P2023': // Inconsistent column data
                this.setResponse(
                    response,
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    message,
                );
                break;
            // Connection errors
            case 'P2024': // Connection timed out
                this.setResponse(
                    response,
                    HttpStatus.SERVICE_UNAVAILABLE,
                    message,
                );
                break;
            // Default case
            default:
                this.setResponse(
                    response,
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    `Unhandled Prisma exception: ${message}`,
                );
        }
    }
}
