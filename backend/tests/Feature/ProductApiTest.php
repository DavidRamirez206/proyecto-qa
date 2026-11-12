<?php

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

function autenticar(): void
{
    Sanctum::actingAs(User::factory()->create());
}

it('devuelve 401 al listar productos sin token', function () {
    $this->getJson('/api/products')->assertUnauthorized();
});

it('lista los productos cuando el usuario está autenticado', function () {
    autenticar();
    Product::factory()->count(3)->create();

    $this->getJson('/api/products')
        ->assertOk()
        ->assertJsonCount(3);
});

it('crea un producto y lo guarda en la base de datos', function () {
    autenticar();

    $this->postJson('/api/products', ['name' => 'Teclado', 'price' => 45000.5])
        ->assertCreated()
        ->assertJsonPath('name', 'Teclado');

    $this->assertDatabaseHas('products', ['name' => 'Teclado', 'price' => 45000.50]);
});

it('rechaza un precio negativo con 422', function () {
    autenticar();

    $this->postJson('/api/products', ['name' => 'Mouse', 'price' => -10])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('price');
});

it('rechaza un nombre de 2 caracteres con 422', function () {
    autenticar();

    $this->postJson('/api/products', ['name' => 'TV', 'price' => 100])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('name');
});
