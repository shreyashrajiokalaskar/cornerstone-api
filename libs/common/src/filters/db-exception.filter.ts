import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { QueryFailedError } from "typeorm";

@Catch(QueryFailedError)
export class DbExceptionFilter implements ExceptionFilter {
    catch(exception: QueryFailedError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        const message = this.mapError(exception);

        response.status(409).json({
            success: false,
            message,
        });
    }

    private mapError(error: QueryFailedError): string {
        const err = error as any;
        console.error('Database error code:', err.table);
        if (err.code === '23505') {
            // Unique violation
            return this.parseUniqueViolation(err.detail);
        }

        return 'Database error';
    }

    private parseUniqueViolation(detail: string) {
        if (detail.includes('workspaces')) return 'Workspace already exists';
        if (detail.includes('documents')) return 'Document already exists';
        if (detail.includes('users')) return 'Email already registered';

        return 'Duplicate value';
    }
}
