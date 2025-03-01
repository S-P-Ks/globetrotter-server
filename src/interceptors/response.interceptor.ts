import { NextFunction, Request, Response } from "express";

interface EnhancedResponse extends Response {
    originalSend: any;
    sendResponse: (body?: any) => void;
    startTime: number;
}

export const enhancedInterceptor = (
    req: Request,
    res: EnhancedResponse,
    next: NextFunction
) => {
    res.startTime = Date.now();
    res.originalSend = res.send;

    res.sendResponse = (body?: any) => {
        const responseTime = Date.now() - res.startTime;

        // Log response details
        console.log({
            method: req.method,
            path: req.originalUrl,
            status: res.statusCode,
            responseTime: `${responseTime}ms`,
            userAgent: req.headers["user-agent"],
        });

        // Format response
        const formatted = {
            success: res.statusCode < 400,
            data: res.statusCode < 400 ? body : undefined,
            error:
                res.statusCode >= 400
                    ? {
                        code: res.statusCode,
                        message: body.message || "Error",
                        ...(process.env.NODE_ENV === "development" && {
                            stack: body.stack,
                        }),
                    }
                    : undefined,
            meta: {
                timestamp: new Date().toISOString(),
                duration: responseTime,
                requestId: req.headers["x-request-id"],
            },
        };

        res.originalSend(formatted);
    };

    res.send = (body?: any): EnhancedResponse => {
        res.sendResponse(body);
        return res;
    };

    next();
};
