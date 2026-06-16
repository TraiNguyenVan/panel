<?php

namespace Pterodactyl\Http\ViewComposers;

use Illuminate\View\View;
use Pterodactyl\Services\Helpers\AssetHashService;

class AssetComposer
{
    /**
     * AssetComposer constructor.
     */
    public function __construct(private AssetHashService $assetHashService)
    {
    }

    /**
     * Provide access to the asset service in the views.
     */
    public function compose(View $view): void
    {
        $view->with('asset', $this->assetHashService);
        $hostRam = ['total' => 0, 'used' => 0];
        if (is_readable('/proc/meminfo')) {
            $meminfo = file_get_contents('/proc/meminfo');
            preg_match('/MemTotal:\s+(\d+) kB/', $meminfo, $totalMatches);
            preg_match('/MemAvailable:\s+(\d+) kB/', $meminfo, $availMatches);
            
            $total = isset($totalMatches[1]) ? (int)$totalMatches[1] * 1024 : 0;
            $available = isset($availMatches[1]) ? (int)$availMatches[1] * 1024 : 0;
            $used = $total - $available;
            
            $hostRam = ['total' => $total, 'used' => $used];
        }

        $view->with('siteConfiguration', [
            'name' => config('app.name') ?? 'Pterodactyl',
            'locale' => config('app.locale') ?? 'en',
            'recaptcha' => [
                'enabled' => config('recaptcha.enabled', false),
                'siteKey' => config('recaptcha.website_key') ?? '',
            ],
            'host_ram' => $hostRam,
        ]);
    }
}
