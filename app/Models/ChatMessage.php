<?php

namespace Pterodactyl\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatMessage extends Model
{
    /**
     * The resource name for this model.
     */
    public const RESOURCE_NAME = 'chat_message';

    /**
     * The table associated with the model.
     */
    protected $table = 'chat_messages';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'message',
    ];

    /**
     * Validation rules for this model.
     */
    public static array $validationRules = [
        'user_id' => ['required', 'numeric', 'exists:users,id'],
        'message' => ['required', 'string', 'max:1000'],
    ];

    /**
     * Gets the user who sent this chat message.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
