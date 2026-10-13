<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * EnsureRole middleware — enforces role-based access control for API routes.
 *
 * Usage in routes:
 *   ->middleware('role:admin')
 *   ->middleware('role:admin,cashier')
 *   ->middleware('role:admin,owner')
 *
 * Behaviour:
 *   - Unauthenticated user   → 401 Unauthenticated (handled before this by auth:sanctum)
 *   - Authenticated but wrong role → 403 Forbidden (JSON)
 *   - Correct role           → request continues
 *
 * This middleware is registered as alias 'role' in bootstrap/app.php.
 * Do NOT scatter role checks (Auth::user()->role === ...) across route files.
 */
class EnsureRole
{
    /**
     * Handle an incoming request.
     *
     * @param string $roles  Comma-separated list of allowed roles, e.g. "admin,cashier"
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        // Should not happen inside auth:sanctum group, but guard defensively
        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // $roles is passed as variadic — support both 'role:admin,cashier' (single arg split)
        // and chained middleware('role:admin', 'role:cashier') patterns.
        // Laravel passes 'admin,cashier' as a single string when using 'role:admin,cashier'.
        $allowed = [];
        foreach ($roles as $roleArg) {
            foreach (explode(',', $roleArg) as $r) {
                $allowed[] = trim($r);
            }
        }

        if (! in_array($user->role, $allowed, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. Insufficient permissions.',
            ], 403);
        }

        return $next($request);
    }
}
