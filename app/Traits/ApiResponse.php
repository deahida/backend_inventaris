<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

/**
 * Provides standardised JSON response helpers for API controllers.
 *
 * All API endpoints return one of these structures so the React frontend
 * can parse responses uniformly.
 */
trait ApiResponse
{
    /**
     * 200 OK — success with optional data payload.
     */
    protected function success(mixed $data = null, string $message = 'Success', int $code = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], $code);
    }

    /**
     * 201 Created.
     */
    protected function created(mixed $data = null, string $message = 'Created successfully'): JsonResponse
    {
        return $this->success($data, $message, 201);
    }

    /**
     * Generic error response.
     */
    protected function error(string $message = 'An error occurred', int $code = 400, mixed $errors = null): JsonResponse
    {
        $payload = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $payload['errors'] = $errors;
        }

        return response()->json($payload, $code);
    }

    /**
     * 401 Unauthenticated.
     */
    protected function unauthorized(string $message = 'Unauthenticated'): JsonResponse
    {
        return $this->error($message, 401);
    }

    /**
     * 403 Forbidden.
     */
    protected function forbidden(string $message = 'Forbidden'): JsonResponse
    {
        return $this->error($message, 403);
    }

    /**
     * 404 Not Found.
     */
    protected function notFound(string $message = 'Resource not found'): JsonResponse
    {
        return $this->error($message, 404);
    }

    /**
     * 422 Unprocessable — business-logic validation failure (not Laravel form-request validation).
     */
    protected function unprocessable(string $message, mixed $errors = null): JsonResponse
    {
        return $this->error($message, 422, $errors);
    }

    /**
     * 409 Conflict.
     */
    protected function conflict(string $message): JsonResponse
    {
        return $this->error($message, 409);
    }
}
