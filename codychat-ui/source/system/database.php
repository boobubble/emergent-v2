<?php
// base system prefix
define('BOOM_PREFIX', 'tc_');

// optional base domain
define('BOOM_DOMAIN', '');

// default redis configuration
define('REDIS_IP', '127.0.0.1');
define('REDIS_PORT', 6379);
define('REDIS_TIMEOUT', 0.2);
define('REDIS_PASS', '');

// Database credentials: use system/database.local.php (not committed) or environment variables.
$__boomDbLocal = __DIR__ . '/database.local.php';
if (is_readable($__boomDbLocal)) {
	require $__boomDbLocal;
}

if (!defined('BOOM_DHOST')) {
	define('BOOM_DHOST', getenv('BOOM_DHOST') ?: 'localhost');
}
if (!defined('BOOM_DUSER')) {
	define('BOOM_DUSER', getenv('BOOM_DUSER') ?: '');
}
if (!defined('BOOM_DPASS')) {
	define('BOOM_DPASS', getenv('BOOM_DPASS') ?: '');
}
if (!defined('BOOM_DNAME')) {
	define('BOOM_DNAME', getenv('BOOM_DNAME') ?: '');
}

// base system main path do not modify
define('BOOM_PATH', dirname(__DIR__));

// do not modify those variables
define('BOOM_CRYPT', '1334627B896a-Oe65fO84470b7bbd-83aM82a6-');
define('BOOM_INSTALL', 1);
define('BOOM', 1);
?>
