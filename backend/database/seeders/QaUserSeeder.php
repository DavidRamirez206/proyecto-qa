<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class QaUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'qa@proyecto.test'],
            [
                'name' => 'Usuario QA',
                'password' => env('QA_PASSWORD', 'password'),
            ],
        );
    }
}
