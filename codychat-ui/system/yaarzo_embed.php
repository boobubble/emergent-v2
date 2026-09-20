<?php
if (!defined('BOOM')) {
	die();
}

function yaarzoBridgeEnvFile(): string
{
	return '/etc/yaarzo/codychat-sso.env';
}

function yaarzoParentOrigins(): array
{
	$defaults = ['https://yaarzo.com', 'https://www.yaarzo.com'];
	$envFile = yaarzoBridgeEnvFile();
	if (!is_readable($envFile)) {
		return $defaults;
	}
	$env = parse_ini_file($envFile, false, INI_SCANNER_RAW);
	if (!is_array($env) || empty($env['YAARZO_PARENT_ORIGINS'])) {
		return $defaults;
	}
	$parts = explode(',', (string)$env['YAARZO_PARENT_ORIGINS']);
	$out = [];
	foreach ($parts as $part) {
		$o = trim($part);
		if ($o !== '' && filter_var($o, FILTER_VALIDATE_URL)) {
			$out[] = $o;
		}
	}
	return $out ?: $defaults;
}

function yaarzoParentOriginsJson(): string
{
	return json_encode(array_values(yaarzoParentOrigins()), JSON_UNESCAPED_SLASHES);
}

function notifyYaarzoParentLogoutScript(): string
{
	$origins = yaarzoParentOriginsJson();
	return <<<JS
function notifyYaarzoParentLogout(){
	if(window.parent === window){ return; }
	var origins = {$origins};
	for(var i = 0; i < origins.length; i++){
		try {
			window.parent.postMessage({ type: 'YAARZO_LOGOUT', source: 'codychat' }, origins[i]);
		} catch(e) {}
	}
}
JS;
}
