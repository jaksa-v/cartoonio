<?php

namespace App\Models;

use App\Enums\GenerationStatus;
use Illuminate\Database\Eloquent\Casts\Attribute;
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
 * @property string|null $original_mime_type
 * @property string|null $result_mime_type
 * @property-read mixed $original_url
 * @property-read mixed $result_url
 * @property-read \App\Models\User $user
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Generation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Generation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Generation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Generation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Generation whereError($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Generation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Generation whereOriginalDisk($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Generation whereOriginalMimeType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Generation whereOriginalPath($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Generation whereResultDisk($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Generation whereResultMimeType($value)
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
    protected static function booted(): void
    {
        static::deleting(function (Generation $generation) {
            if ($generation->original_path && $generation->original_disk) {
                Storage::disk($generation->original_disk)->delete($generation->original_path);
            }

            if ($generation->result_path && $generation->result_disk) {
                Storage::disk($generation->result_disk)->delete($generation->result_path);
            }
        });
    }

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

    protected function originalUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->original_path
                ? route('cartoonify.file', ['generation' => $this->id, 'type' => 'original'])
                : null,
        );
    }

    protected function resultUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->result_path && $this->result_disk
                ? route('cartoonify.file', ['generation' => $this->id, 'type' => 'result'])
                : null,
        );
    }
}
