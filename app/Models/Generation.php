<?php

namespace App\Models;

use App\Enums\GenerationStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property int $user_id
 * @property string $style_key
 * @property string $original_disk
 * @property string $original_path
 * @property string|null $result_disk
 * @property string|null $result_path
 * @property GenerationStatus $status
 * @property string|null $error
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read string|null $original_url
 * @property-read string|null $result_url
 * @property-read \App\Models\User $user
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Generation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Generation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Generation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Generation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Generation whereError($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Generation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Generation whereOriginalDisk($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Generation whereOriginalPath($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Generation whereResultDisk($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Generation whereResultPath($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Generation whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Generation whereStyleKey($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Generation whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Generation whereUserId($value)
 *
 * @mixin \Eloquent
 */
class Generation extends Model
{
    protected $fillable = [
        'user_id',
        'style_key',
        'original_disk',
        'original_path',
        'result_disk',
        'result_path',
        'status',
        'error',
    ];

    protected function casts(): array
    {
        return [
            'status' => GenerationStatus::class,
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getOriginalUrlAttribute(): ?string
    {
        if (! $this->original_path) {
            return null;
        }

        return Storage::disk($this->original_disk)->url($this->original_path);
    }

    public function getResultUrlAttribute(): ?string
    {
        if (! $this->result_path || ! $this->result_disk) {
            return null;
        }

        return Storage::disk($this->result_disk)->url($this->result_path);
    }
}
