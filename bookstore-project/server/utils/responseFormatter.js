// server/utils/responseFormatter.js

/**
 * Standard API response formatter
 */
class ApiResponse {
    static success(data, message = 'Success', metadata = null) {
        const response = {
            success: true,
            message,
            data
        };
        
        if (metadata) {
            response.metadata = metadata;
        }
        
        return response;
    }
    
    static error(message, code = 'ERROR', details = null, statusCode = 500) {
        return {
            success: false,
            error: {
                code,
                message,
                ...(details && { details })
            }
        };
    }
    
    static paginated(data, page, limit, total) {
        return {
            success: true,
            data,
            metadata: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(total),
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        };
    }
}

module.exports = ApiResponse;