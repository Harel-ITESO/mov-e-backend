import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

/**
 * Handles Prisma Client known request errors as HTTP errors
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(PrismaClientExceptionFilter.name);

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

        // Log the detailed error for debugging but don't expose it
        this.logger.error(exception);

        // Map Prisma error codes to user-friendly messages
        const errorMessages: Record<string, string> = {
            // Unique constraint errors
            P2002: 'A record with this information already exists.',

            // Record not found errors
            P2001: 'The requested resource was not found.',
            P2015: 'The requested resource was not found.',
            P2018: 'The requested resource was not found.',
            P2025: 'The requested resource was not found.',

            // Foreign key constraint errors
            P2003: 'The operation failed because of a reference constraint.',

            // Validation errors
            P2000: 'The provided value is invalid.',
            P2005: 'The provided value is invalid for this field.',
            P2006: 'The provided value is invalid.',
            P2007: 'Data validation error.',
            P2011: 'A required field cannot be null.',
            P2012: 'A required field is missing.',
            P2013: 'A required parameter is missing.',

            // Database structure issues
            P2021: 'Internal server error.',
            P2022: 'Internal server error.',

            // Query-related errors
            P2008: 'The request contains invalid syntax.',
            P2009: 'The request contains invalid parameters.',
            P2010: 'The request could not be processed.',
            P2016: 'The request could not be interpreted correctly.',

            // Relation errors
            P2017: 'The records cannot be connected.',
            P2023: 'The data is inconsistent.',

            // Connection errors
            P2024: 'The service is currently unavailable. Please try again later.',
        };

        // Get user-friendly message based on error code or use default
        const safeMessage =
            errorMessages[exception.code] || 'An unexpected error occurred.';

        // Include field names for some error types to make messages more helpful
        let enhancedMessage = safeMessage;
        if (exception.code === 'P2002' && exception.meta?.target) {
            // For unique constraint violations, we can safely mention which fields caused the conflict
            // without exposing implementation details
            const fields = Array.isArray(exception.meta.target)
                ? exception.meta.target.join(', ')
                : // eslint-disable-next-line @typescript-eslint/no-base-to-string
                  String(exception.meta.target);
            enhancedMessage = `A record with the same ${fields} already exists.`;
        }

        switch (exception.code) {
            // Unique constraint validation failed
            case 'P2002':
                this.setResponse(
                    response,
                    HttpStatus.CONFLICT,
                    enhancedMessage,
                );
                break;
            // Record not found
            case 'P2001':
            case 'P2015':
            case 'P2018':
            case 'P2025':
                this.setResponse(response, HttpStatus.NOT_FOUND, safeMessage);
                break;
            // Foreign key constraint failed
            case 'P2003':
                this.setResponse(response, HttpStatus.CONFLICT, safeMessage);
                break;
            // Field/constraint validation errors
            case 'P2000':
            case 'P2005':
            case 'P2006':
            case 'P2007':
            case 'P2011':
            case 'P2012':
            case 'P2013':
                this.setResponse(response, HttpStatus.BAD_REQUEST, safeMessage);
                break;
            // Database structure issues
            case 'P2021':
            case 'P2022':
                this.setResponse(
                    response,
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    safeMessage,
                );
                break;
            // Query-related errors
            case 'P2008':
            case 'P2009':
            case 'P2010':
            case 'P2016':
                this.setResponse(response, HttpStatus.BAD_REQUEST, safeMessage);
                break;
            // Relation errors
            case 'P2017':
            case 'P2023':
                this.setResponse(
                    response,
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    safeMessage,
                );
                break;
            // Connection errors
            case 'P2024':
                this.setResponse(
                    response,
                    HttpStatus.SERVICE_UNAVAILABLE,
                    safeMessage,
                );
                break;
            // Default case
            default:
                this.setResponse(
                    response,
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    'An unexpected error occurred.',
                );
        }
    }
}
