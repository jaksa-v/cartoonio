<?php

namespace App\Policies;

use App\Models\Generation;
use App\Models\User;

class GenerationPolicy
{
    public function view(User $user, Generation $generation): bool
    {
        return $user->id === $generation->user_id;
    }

    public function update(User $user, Generation $generation): bool
    {
        return $user->id === $generation->user_id;
    }

    public function delete(User $user, Generation $generation): bool
    {
        return $user->id === $generation->user_id;
    }

    public function regenerate(User $user, Generation $generation): bool
    {
        return $user->id === $generation->user_id;
    }
}
