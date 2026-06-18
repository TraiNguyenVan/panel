<?php

use Pterodactyl\Enum\ResourceLimit;
use Illuminate\Support\Facades\Route;
use Pterodactyl\Http\Controllers\Api\Client;
use Pterodactyl\Http\Middleware\Activity\ServerSubject;
use Pterodactyl\Http\Middleware\Activity\AccountSubject;
use Pterodactyl\Http\Middleware\RequireTwoFactorAuthentication;
use Pterodactyl\Http\Middleware\Api\Client\Server\ResourceBelongsToServer;
use Pterodactyl\Http\Middleware\Api\Client\Server\AuthenticateServerAccess;

/*
|--------------------------------------------------------------------------
| Client Control API
|--------------------------------------------------------------------------
|
| Endpoint: /api/client
|
*/
Route::get('/', [Client\ClientController::class, 'index'])->name('api:client.index');
Route::get('/permissions', [Client\ClientController::class, 'permissions']);
Route::get('/host-ram', function() {
    $hostRam = ['total' => 0, 'used' => 0, 'top_processes' => []];
    if (is_readable('/proc/meminfo')) {
        $meminfo = file_get_contents('/proc/meminfo');
        preg_match('/MemTotal:\s+(\d+) kB/', $meminfo, $totalMatches);
        preg_match('/MemAvailable:\s+(\d+) kB/', $meminfo, $availMatches);
        
        $total = isset($totalMatches[1]) ? (int)$totalMatches[1] * 1024 : 0;
        $available = isset($availMatches[1]) ? (int)$availMatches[1] * 1024 : 0;
        $used = $total - $available;
        
        $hostRam['total'] = $total;
        $hostRam['used'] = $used;
    }
    
    $procFile = storage_path('app/host_top_ram.txt');
    if (file_exists($procFile) && is_readable($procFile)) {
        $lines = file($procFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $parts = preg_split('/\s+/', trim($line));
            if (count($parts) >= 2) {
                // The last element is the size in KB, everything before is the command name
                $sizeKb = array_pop($parts);
                $name = implode(' ', $parts);
                $hostRam['top_processes'][] = [
                    'name' => $name,
                    'ram_bytes' => ((int) $sizeKb) * 1024
                ];
            }
        }
    }
    
    return response()->json($hostRam);
});

Route::get('/chat', function() {
    return response()->json(
        \Pterodactyl\Models\ChatMessage::with('user:id,username')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->reverse()
            ->values()
    );
});

Route::post('/chat', function(\Illuminate\Http\Request $request) {
    $request->validate([
        'message' => 'required|string|max:1000',
    ]);
    
    $chatMessage = \Pterodactyl\Models\ChatMessage::create([
        'user_id' => $request->user()->id,
        'message' => $request->input('message'),
    ]);
    
    $chatMessage->load('user:id,username');
    
    return response()->json($chatMessage, 201);
});

Route::prefix('/account')->middleware(AccountSubject::class)->group(function () {
    Route::prefix('/')->withoutMiddleware(RequireTwoFactorAuthentication::class)->group(function () {
        Route::get('/', [Client\AccountController::class, 'index'])->name('api:client.account');
        Route::get('/two-factor', [Client\TwoFactorController::class, 'index']);
        Route::post('/two-factor', [Client\TwoFactorController::class, 'store']);
        Route::post('/two-factor/disable', [Client\TwoFactorController::class, 'delete']);
    });

    Route::put('/email', [Client\AccountController::class, 'updateEmail'])
        ->middleware('throttle')
        ->name('api:client.account.update-email');
    Route::put('/password', [Client\AccountController::class, 'updatePassword'])->name('api:client.account.update-password');

    Route::get('/activity', Client\ActivityLogController::class)->name('api:client.account.activity');

    Route::get('/api-keys', [Client\ApiKeyController::class, 'index']);
    Route::post('/api-keys', [Client\ApiKeyController::class, 'store']);
    Route::delete('/api-keys/{identifier}', [Client\ApiKeyController::class, 'delete']);

    Route::prefix('/ssh-keys')->group(function () {
        Route::get('/', [Client\SSHKeyController::class, 'index']);
        Route::post('/', [Client\SSHKeyController::class, 'store']);
        Route::post('/remove', [Client\SSHKeyController::class, 'delete']);
    });
});

/*
|--------------------------------------------------------------------------
| Client Control API
|--------------------------------------------------------------------------
|
| Endpoint: /api/client/servers/{server}
|
*/
Route::group([
    'prefix' => '/servers/{server}',
    'middleware' => [
        ServerSubject::class,
        AuthenticateServerAccess::class,
        ResourceBelongsToServer::class,
    ],
], function () {
    Route::get('/', [Client\Servers\ServerController::class, 'index'])->name('api:client:server.view');
    Route::middleware([ResourceLimit::Websocket->middleware()])
        ->get('/websocket', Client\Servers\WebsocketController::class)
        ->name('api:client:server.ws');
    Route::get('/resources', Client\Servers\ResourceUtilizationController::class)->name('api:client:server.resources');
    Route::get('/activity', Client\Servers\ActivityLogController::class)->name('api:client:server.activity');

    Route::post('/command', [Client\Servers\CommandController::class, 'index']);
    Route::post('/power', [Client\Servers\PowerController::class, 'index']);

    Route::group(['prefix' => '/databases'], function () {
        Route::get('/', [Client\Servers\DatabaseController::class, 'index']);
        Route::middleware([ResourceLimit::Database->middleware()])
            ->post('/', [Client\Servers\DatabaseController::class, 'store']);
        Route::post('/{database}/rotate-password', [Client\Servers\DatabaseController::class, 'rotatePassword']);
        Route::delete('/{database}', [Client\Servers\DatabaseController::class, 'delete']);
    });

    Route::group(['prefix' => '/files'], function () {
        Route::get('/list', [Client\Servers\FileController::class, 'directory']);
        Route::get('/contents', [Client\Servers\FileController::class, 'contents']);
        Route::get('/download', [Client\Servers\FileController::class, 'download']);
        Route::put('/rename', [Client\Servers\FileController::class, 'rename']);
        Route::post('/copy', [Client\Servers\FileController::class, 'copy']);
        Route::post('/write', [Client\Servers\FileController::class, 'write']);
        Route::post('/compress', [Client\Servers\FileController::class, 'compress']);
        Route::post('/decompress', [Client\Servers\FileController::class, 'decompress']);
        Route::post('/delete', [Client\Servers\FileController::class, 'delete']);
        Route::post('/create-folder', [Client\Servers\FileController::class, 'create']);
        Route::post('/chmod', [Client\Servers\FileController::class, 'chmod']);
        Route::middleware([ResourceLimit::FilePull->middleware()])
            ->post('/pull', [Client\Servers\FileController::class, 'pull']);
        Route::get('/upload', Client\Servers\FileUploadController::class);
    });

    Route::group(['prefix' => '/schedules'], function () {
        Route::get('/', [Client\Servers\ScheduleController::class, 'index']);
        Route::middleware([ResourceLimit::Schedule->middleware()])
            ->post('/', [Client\Servers\ScheduleController::class, 'store']);
        Route::get('/{schedule}', [Client\Servers\ScheduleController::class, 'view']);
        Route::post('/{schedule}', [Client\Servers\ScheduleController::class, 'update']);
        Route::post('/{schedule}/execute', [Client\Servers\ScheduleController::class, 'execute']);
        Route::delete('/{schedule}', [Client\Servers\ScheduleController::class, 'delete']);

        Route::post('/{schedule}/tasks', [Client\Servers\ScheduleTaskController::class, 'store']);
        Route::post('/{schedule}/tasks/{task}', [Client\Servers\ScheduleTaskController::class, 'update']);
        Route::delete('/{schedule}/tasks/{task}', [Client\Servers\ScheduleTaskController::class, 'delete']);
    });

    Route::group(['prefix' => '/network'], function () {
        Route::get('/allocations', [Client\Servers\NetworkAllocationController::class, 'index']);
        Route::middleware([ResourceLimit::Allocation->middleware()])
            ->post('/allocations', [Client\Servers\NetworkAllocationController::class, 'store']);
        Route::post('/allocations/{allocation}', [Client\Servers\NetworkAllocationController::class, 'update']);
        Route::post('/allocations/{allocation}/primary', [Client\Servers\NetworkAllocationController::class, 'setPrimary']);
        Route::delete('/allocations/{allocation}', [Client\Servers\NetworkAllocationController::class, 'delete']);
    });

    Route::group(['prefix' => '/users'], function () {
        Route::get('/', [Client\Servers\SubuserController::class, 'index']);
        Route::middleware([ResourceLimit::Subuser->middleware()])
            ->post('/', [Client\Servers\SubuserController::class, 'store']);
        Route::get('/{user}', [Client\Servers\SubuserController::class, 'view']);
        Route::post('/{user}', [Client\Servers\SubuserController::class, 'update']);
        Route::delete('/{user}', [Client\Servers\SubuserController::class, 'delete']);
    });

    Route::group(['prefix' => '/backups'], function () {
        Route::get('/', [Client\Servers\BackupController::class, 'index']);
        Route::post('/', [Client\Servers\BackupController::class, 'store']);
        Route::get('/{backup}', [Client\Servers\BackupController::class, 'view']);
        Route::get('/{backup}/download', [Client\Servers\BackupController::class, 'download']);
        Route::post('/{backup}/lock', [Client\Servers\BackupController::class, 'toggleLock']);
        Route::middleware([ResourceLimit::Backup->middleware()])
            ->post('/{backup}/restore', [Client\Servers\BackupController::class, 'restore']);
        Route::delete('/{backup}', [Client\Servers\BackupController::class, 'delete']);
    });

    Route::group(['prefix' => '/startup'], function () {
        Route::get('/', [Client\Servers\StartupController::class, 'index']);
        Route::put('/variable', [Client\Servers\StartupController::class, 'update']);
    });

    Route::group(['prefix' => '/settings'], function () {
        Route::post('/rename', [Client\Servers\SettingsController::class, 'rename']);
        Route::post('/reinstall', [Client\Servers\SettingsController::class, 'reinstall']);
        Route::put('/docker-image', [Client\Servers\SettingsController::class, 'dockerImage']);
    });
});
