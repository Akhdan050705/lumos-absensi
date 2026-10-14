<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePasswordChanged
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->must_change_password) {
            if (!$request->routeIs('profile.*') && !$request->routeIs('logout')) {
                return redirect()->route('profile.index')->withErrors([
                    'general' => 'Demi keamanan, Anda wajib mengubah password default sebelum dapat menggunakan sistem.'
                ]);
            }
        }

        return $next($request);
    }
}
