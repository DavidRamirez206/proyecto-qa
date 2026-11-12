<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    User::factory()->create([
        'email' => 'qa@proyecto.test',
        'password' => 'secreto123',
    ]);
});

it('devuelve un token con credenciales correctas', function () {
    $this->postJson('/api/login', [
        'email' => 'qa@proyecto.test',
        'password' => 'secreto123',
    ])
        ->assertOk()
        ->assertJsonStructure(['token']);
});

it('devuelve 422 con una contraseña incorrecta', function () {
    $this->postJson('/api/login', [
        'email' => 'qa@proyecto.test',
        'password' => 'incorrecta',
    ])
        ->assertUnprocessable()
        ->assertJsonMissingPath('token');
});
