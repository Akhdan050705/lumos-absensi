<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Models\User;

class LoginController extends Controller
{
    public function create()
    {
        return Inertia::render('Auth/Login');
    }

    public function store(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $throttleKey = Str::transliterate(Str::lower($request->input('email')).'|'.$request->ip());

        // 1. Rate Limiting (Maksimal 5 percobaan gagal per menit)
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return back()->withErrors([
                'email' => "Terlalu banyak percobaan login. Silakan coba lagi dalam {$seconds} detik."
            ])->onlyInput('email');
        }

        // 2. Pre-check status aktif akun sebelum autentikasi
        $user = User::where('email', $credentials['email'])->first();
        if ($user && !$user->is_active) {
            return back()->withErrors([
                'email' => 'Akun Anda dinonaktifkan. Silakan hubungi Owner.'
            ])->onlyInput('email');
        }

        // 3. Attempt authentication
        if (Auth::attempt(array_merge($credentials, ['is_active' => 1]), $request->boolean('remember'))) {
            RateLimiter::clear($throttleKey);
            $request->session()->regenerate();
            
            $authenticatedUser = Auth::user();

            // Update log akses
            $authenticatedUser->update([
                'last_login_at' => now(),
                'last_login_ip' => $request->ip()
            ]);

            // Jika wajib ganti password, arahkan langsung ke profil
            if ($authenticatedUser->must_change_password) {
                return redirect()->route('profile.index')->with('warning', 'Demi keamanan, silakan ganti password default Anda terlebih dahulu.');
            }

            return redirect()->intended(route('dashboard'));
        }

        RateLimiter::hit($throttleKey);

        return back()->withErrors([
            'email' => 'Kredensial yang diberikan tidak cocok dengan catatan kami.',
        ])->onlyInput('email');
    }

    public function destroy(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
