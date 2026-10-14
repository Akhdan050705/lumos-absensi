<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FileController extends Controller
{
    public function show(Request $request, $path)
    {
        $user = $request->user();
        if (!$user) {
            abort(403, 'Akses tidak diizinkan.');
        }

        // Prevent directory traversal attacks
        $path = str_replace(['..', "\0"], '', $path);

        if (Storage::disk('local')->exists($path)) {
            return Storage::disk('local')->response($path);
        }

        // Fallback for previously uploaded public files during transition
        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->response($path);
        }

        abort(404, 'File tidak ditemukan.');
    }
}
