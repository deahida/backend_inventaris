<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureRateLimiting();
    }

    /**
     * Configure rate limiters for sensitive API endpoints.
     *
     * Limiters:
     *   'auth'    — applied to login, forgot-password, reset-password
     *               10 requests / minute per IP
     *               Conservative enough not to block normal testing,
     *               strict enough to prevent credential stuffing.
     *
     *   'api'     — general authenticated API limiter
     *               120 requests / minute per authenticated user (or IP)
     *               Prevents abuse while allowing normal SPA usage.
     */
    protected function configureRateLimiting(): void
    {
        // Sensitive public auth endpoints: 10 req/min per IP
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });

        // General authenticated API: 120 req/min per user or IP
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
        });
    }
}
