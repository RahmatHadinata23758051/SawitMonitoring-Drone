<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = User::latest()->paginate(10);
        return view('pages.user.index', compact('user'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('pages.user.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|confirmed',
            'no_telepon' => 'required|regex:/^0[0-9]{9,13}$/|unique:users,phone_number',
        ], [
            'nama.required' => 'Nama wajib diisi.',
            'nama.string' => 'Nama tidak valid.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Email tidak valid.',
            'email.unique' => 'Email ini sudah digunakan.',
            'password.required' => 'Password wajib diisi.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
            'no_telepon.required' => 'Nomor telepon wajib diisi.',
            'no_telepon.regex' => 'Nomor telepon harus diawali 0 dan terdiri dari 10-14 digit.',
            'no_telepon.unique' => 'Nomor telepon ini sudah digunakan.',
        ]);

        $data = [
            'name' => $validated['nama'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'phone_number' => $validated['no_telepon'],
        ];

        $post = User::create($data);

        activity()
            ->performedOn($post)
            ->event('create')
            ->causedBy(Auth::user())
            ->log('User baru ditambahkan: ' . $validated['nama']);

        return redirect()->route('user.index')->with('success', 'Data user berhasil dibuat!');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        return view('pages.user.edit', compact('user'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'nama' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|confirmed',
            'no_telepon' => 'required|regex:/^0[0-9]{9,13}$/|unique:users,phone_number',
        ], [
            'nama.required' => 'Nama wajib diisi.',
            'nama.string' => 'Nama tidak valid.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Email tidak valid.',
            'email.unique' => 'Email ini sudah digunakan.',
            'password.required' => 'Password wajib diisi.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
            'no_telepon.required' => 'Nomor telepon wajib diisi.',
            'no_telepon.regex' => 'Nomor telepon harus diawali 0 dan terdiri dari 10-14 digit.',
            'no_telepon.unique' => 'Nomor telepon ini sudah digunakan.',
        ]);

        $data = [
            'name' => $validated['nama'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'phone_number' => $validated['no_telepon'],
        ];

        $original = $user->getOriginal();
        $user->update($data);

        $changes = [];

        foreach ($data as $key => $value) {
            if (array_key_exists($key, $original) &&  $original[$key] !== $value) {
                $changes[$key] = [
                    'old' => $original[$key],
                    'new' => $value,
                ];
            }
        }

        activity()
            ->performedOn($user)
            ->event('update')
            ->withProperties(['changes' => $changes])
            ->causedBy(Auth::user())
            ->log('User dengan ID ' . $user->id . ' berhasil diupdate');

        return redirect()->route('user.index')->with('success', 'Data user berhasil diubah!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();

        activity()
            ->performedOn($user)
            ->event('delete')
            ->causedBy(Auth::user())
            ->log('User dihapus: ' . $user->name);

        return redirect()->route('user.index')->with('success', 'Data user berhasil dihapus!');
    }
}
