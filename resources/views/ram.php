<?php
// Simple RAM monitor for Pterodactyl panel
$meminfo = file_get_contents('/proc/meminfo');
preg_match('/^MemTotal:\s+(\d+)/m', $meminfo, $total);
preg_match('/^MemAvailable:\s+(\d+)/m', $meminfo, $avail);
$total_kb = intval($total[1] ?? 0);
$avail_kb = intval($avail[1] ?? 0);
$used_kb = $total_kb - $avail_kb;
$percent = $total_kb > 0 ? round(($used_kb / $total_kb) * 100) : 0;
$used_gb = round($used_kb / 1048576, 1);
$total_gb = round($total_kb / 1048576, 1);
$color = $percent < 70 ? '#30d158' : ($percent < 90 ? '#ff9f0a' : '#ff3b30');
header('Content-Type: application/javascript');
header('Cache-Control: no-cache');
?>
(function() {
    var bar = document.getElementById('ram-bar');
    var text = document.getElementById('ram-text');
    if (bar) {
        bar.style.width = '<?= $percent ?>%';
        bar.style.background = '<?= $color ?>';
    }
    if (text) {
        text.innerHTML = '<?= $used_gb ?> / <?= $total_gb ?> GB (<?= $percent ?>%)';
    }
})();
