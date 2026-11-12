<?php

namespace App\Services;

use InvalidArgumentException;

class OrderCalculator
{
    private const IVA = 0.19;

    public function total(float $subtotal, float $discountPercent = 0): float
    {
        if ($subtotal < 0) {
            throw new InvalidArgumentException('El subtotal no puede ser negativo.');
        }

        if ($discountPercent < 0 || $discountPercent > 100) {
            throw new InvalidArgumentException('El descuento debe estar entre 0 y 100.');
        }

        $conDescuento = $subtotal * (1 - $discountPercent / 100);

        return round($conDescuento * (1 + self::IVA), 2);
    }
}
