<?php

use App\Services\OrderCalculator;

beforeEach(function () {
    $this->calculator = new OrderCalculator();
});

it('suma el IVA del 19 % cuando no hay descuento', function () {
    expect($this->calculator->total(100))->toBe(119.0);
});

it('aplica el descuento antes del IVA', function () {
    expect($this->calculator->total(100, 10))->toBe(107.1);
});

it('calcula el total esperado', function (float $subtotal, float $descuento, float $esperado) {
    expect($this->calculator->total($subtotal, $descuento))->toBe($esperado);
})->with([
    'subtotal cero' => [0, 0, 0.0],
    'descuento total' => [250, 100, 0.0],
    'redondeo a 2 decimales' => [10.01, 0, 11.91],
    'descuento del 25 %' => [80000, 25, 71400.0],
]);

it('lanza una excepción si el subtotal es negativo', function () {
    $this->calculator->total(-1);
})->throws(InvalidArgumentException::class);

it('lanza una excepción si el descuento está fuera de rango', function (float $descuento) {
    $this->calculator->total(100, $descuento);
})->with([-0.01, 100.01])->throws(InvalidArgumentException::class);
