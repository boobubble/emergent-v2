<?php
function bridgeLog($event, $context = []){
	$line = 'YAARZO_BRIDGE ' . $event;
	if(!empty($context)){
		$line .= ' ' . json_encode($context, JSON_UNESCAPED_SLASHES);
	}
	error_log($line);
}

function bridgeIsPrivateIp($ip){
	if(!filter_var($ip, FILTER_VALIDATE_IP)){
		return true;
	}
	return !filter_var(
		$ip,
		FILTER_VALIDATE_IP,
		FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
	);
}

function bridgeValidateAvatarUrl($url){
	if(!is_string($url) || $url === ''){
		return false;
	}
	if(!filter_var($url, FILTER_VALIDATE_URL)){
		return false;
	}
	$parts = parse_url($url);
	$scheme = strtolower((string)($parts['scheme'] ?? ''));
	if($scheme !== 'https'){
		return false;
	}
	$host = strtolower((string)($parts['host'] ?? ''));
	if($host === '' || $host === 'localhost'){
		return false;
	}
	if(substr($host, -6) === '.local' || substr($host, -5) === '.internal'){
		return false;
	}
	$ips = @gethostbynamel($host);
	if(is_array($ips)){
		foreach($ips as $ip){
			if(bridgeIsPrivateIp($ip)){
				return false;
			}
		}
	}
	$path = strtolower((string)($parts['path'] ?? ''));
	if($path !== '' && substr($path, -4) === '.svg'){
		return false;
	}
	return true;
}

function bridgeAvatarFingerprint($url){
	return substr(hash('sha256', $url), 0, 16);
}

function bridgeResolveChatName($desiredName, $userId, $connection){
	$desired = cleanBridgeName($desiredName);
	if($desired === ''){
		return null;
	}
	$uid = (int)$userId;
	$check = $connection->query(
		"SELECT user_id FROM boom_users WHERE user_name = '$desired' AND user_id != '$uid' LIMIT 1"
	);
	if($check && $check->num_rows > 0){
		return null;
	}
	return $desired;
}

function bridgeFallbackChatName($bridgeId){
	$short = preg_replace('/[^a-zA-Z0-9]/', '', substr($bridgeId, 0, 8));
	if($short === ''){
		$short = 'user';
	}
	return 'yz_' . $short;
}

function syncBridgeUserProfile($user, $bridge, $connection){
	$uid = (int)$user['user_id'];
	$sets = [];
	$sets[] = "user_ip = '{$bridge['ip']}'";
	$sets[] = "user_sex = '{$bridge['gender']}'";

	$resolved = bridgeResolveChatName($bridge['name'], $uid, $connection);
	if($resolved !== null && $resolved !== $user['user_name']){
		$sets[] = "user_name = '$resolved'";
	}
	else if($resolved === null && cleanBridgeName($bridge['name']) !== $user['user_name']){
		bridgeLog('username_collision', [
			'user_id' => $uid,
			'sub_id' => $user['sub_id'] ?? '',
			'desired' => $bridge['name'],
			'kept' => $user['user_name'],
		]);
	}

	$connection->query(
		"UPDATE boom_users SET " . implode(', ', $sets) . " WHERE user_id = '$uid'"
	);
	return bridgeUserDetails($uid);
}

function createBridgeUser($provider, $info){
	global $bmysqli, $bdata;
	$user = [];
	
	if(empty($info) || empty($provider)){
		return false;
	}
	$bridge_default = array(
		'id'=> '',
		'name'=> '',
		'age'=> 0,
		'gender'=> 3,
		'password'=> bridgeRandomPass(),
		'language'=> bridgeLanguage(),
		'avatar'=> '',
		'avatar_fp'=> '',
		'ip'=> bridgeGetIp(),
	);
	$bridge = array_merge($bridge_default, $info);
	
	$provider = bridgeEscape($provider);
	$bridge['id'] = bridgeEscape($bridge['id']);
	$bridge['name'] = bridgeEscape($bridge['name']);
	$bridge['age'] = bridgeEscape($bridge['age']);
	$bridge['gender'] = bridgeEscape($bridge['gender']);
	$bridge['password'] = bridgeEscape($bridge['password']);
	$bridge['language'] = bridgeEscape($bridge['language']);
	$bridge['avatar'] = bridgeEscape($bridge['avatar']);
	$bridge['avatar_fp'] = bridgeEscape($bridge['avatar_fp']);
	
	if(empty($bridge['id']) || empty($bridge['name'])){
		return false;
	}
	
	$bridge['identity'] = $provider . '_' . $bridge['id'];
	
	if(!is_numeric($bridge['age'])){
		$bridge['age'] = 0;
	}
	switch(strtolower($bridge['gender'])){
		case 'female':
			$bridge['gender'] = 2;
			break;
		case 'male':
			$bridge['gender'] = 1;
			break;
		default:
			$bridge['gender'] = 3;
			break;
	}
	if(!bridgeValidateAvatarUrl($bridge['avatar'])){
		$bridge['avatar'] = '';
		$bridge['avatar_fp'] = '';
	}
	
	$bridge_exist = $bmysqli->query(
		"SELECT * FROM `boom_users` WHERE `sub_id` = '{$bridge['identity']}' AND `sub_id` != '' LIMIT 2"
	);
	
	if($bridge_exist && $bridge_exist->num_rows > 1){
		bridgeLog('duplicate_sub_id', ['sub_id' => $bridge['identity']]);
		return false;
	}
	
	if($bridge_exist && $bridge_exist->num_rows === 1){
		$user = $bridge_exist->fetch_assoc();
		$user = syncBridgeUserProfile($user, $bridge, $bmysqli);
	}
	else {
		$bridge['name'] = getBridgeName($bridge['name'], $bmysqli);
		$bmysqli->query("INSERT INTO boom_users 
		(user_name, sub_id, user_password, user_ip, user_join, last_action,
		user_theme,  user_sex, user_age, user_language, user_timezone, user_roomid, user_verify)
		VALUES 
		('{$bridge['name']}', '{$bridge['identity']}', '{$bridge['password']}', '{$bridge['ip']}',
		'" . time() . "', '" . time() . "', '{$bdata['default_theme']}', '{$bridge['gender']}', '{$bridge['age']}', '{$bridge['language']}', '{$bdata['timezone']}', '0', 0)");
		
		$newid = $bmysqli->insert_id;
		$user = bridgeUserDetails($newid);
		if(!empty($user)){
			$bmysqli->query("INSERT INTO boom_exp (uid) VALUES ($newid)");
			$bmysqli->query("INSERT INTO boom_users_data (uid) VALUES ($newid)");
		}
	}
	
	if(!empty($user) && $bridge['avatar'] != ''){
		downloadBridgeAvatar($user, $bridge['avatar'], $provider, $bridge['avatar_fp']);
		$user = bridgeUserDetails($user['user_id']);
	}
	
	if(empty($user)){
		return false;
	}

	setBoomCookie($user);
	return $user;
}

// bridge functions
function bridgeMinutesUp($min){
	return time() + ($min * 60);
}
function bridgeVersion(){
	$fversion = 70;
	$pversion = PHP_MAJOR_VERSION . PHP_MINOR_VERSION;
	if($pversion >= 71){
		$fversion = 71;
	}
	if($pversion >= 72){
		$fversion = 72;
	}
	return 'php' . $fversion;
}
function bridgeRandomPass(){
	$text = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890++--';
	$text = substr(str_shuffle($text), 0, 10);
	return bridgeEncrypt($text);
}
function bridgeGetIp(){
    $client  = @$_SERVER['HTTP_CLIENT_IP'];
    $forward = @$_SERVER['HTTP_X_FORWARDED_FOR'];
    $cloud =   @$_SERVER["HTTP_CF_CONNECTING_IP"];
    $remote  = $_SERVER['REMOTE_ADDR'];
    if(filter_var($cloud, FILTER_VALIDATE_IP)) {
        $ip = $cloud;
    }
    else if(filter_var($client, FILTER_VALIDATE_IP)) {
        $ip = $client;
    }
    elseif(filter_var($forward, FILTER_VALIDATE_IP)){
        $ip = $forward;
    }
    else{
        $ip = $remote;
    }
    return bridgeEscape($ip);	
}
function cleanBridgeName($name){
	return str_replace(
		array(' ', "'", '"', '<', '>', ",",")","("),
		array('_', '', '', '', '', '', '', ''),
		$name
	);
}
function bridgeEncrypt($d){
	return sha1(str_rot13($d . BOOM_CRYPT));
}
function bridgeEscape($t){
	global $bmysqli;
	return $bmysqli->real_escape_string(trim(htmlspecialchars($t, ENT_QUOTES)));
}
function bridgeLanguage(){
	global $bdata;
	$l = $bdata['language'];
	if(isset($_COOKIE[BOOM_PREFIX . 'lang'])){
		$test_lang = bridgeEscape($_COOKIE[BOOM_PREFIX . 'bc_lang']);
		if(file_exists(BOOM_PATH . '/system/language/' . $test_lang . '/language.php')){
			$l = $test_lang;
		}
	}
	return $l;
}
function bridgeUserDetails($id){
	global $bmysqli;
	$user = [];
	$getuser = $bmysqli->query("SELECT * FROM boom_users WHERE user_id = '$id'");
	if($getuser->num_rows > 0){
		$user = $getuser->fetch_assoc();
	}
	return $user;
}
function downloadBridgeAvatar($user, $url, $prefix, $fingerprint = ''){
	global $bmysqli;
	$url = bridgeEscape($url);
	if(!bridgeValidateAvatarUrl($url)){
		return false;
	}
	if($fingerprint === ''){
		$fingerprint = bridgeAvatarFingerprint($url);
	}
	$fingerprint = bridgeEscape($fingerprint);
	$img = $prefix . '_' . $fingerprint . '.jpg';
	if($user['user_tumb'] === $img){
		return true;
	}
	$path = BOOM_PATH . '/avatar/' . $img;
	$fh = @fopen($path, 'wb');
	if($fh === false){
		bridgeLog('avatar_open_failed', ['user_id' => $user['user_id']]);
		return false;
	}
	$curl = curl_init($url);
	curl_setopt($curl, CURLOPT_FILE, $fh);
	curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 5);
	curl_setopt($curl, CURLOPT_TIMEOUT, 10);
	curl_setopt($curl, CURLOPT_HEADER, false);
	curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, true);
	curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 2);
	curl_setopt($curl, CURLOPT_PROTOCOLS, CURLPROTO_HTTPS);
	curl_setopt($curl, CURLOPT_REDIR_PROTOCOLS, CURLPROTO_HTTPS);
	curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
	curl_setopt($curl, CURLOPT_MAXREDIRS, 2);
	curl_setopt($curl, CURLOPT_MAXFILESIZE, 5 * 1024 * 1024);
	$ok = curl_exec($curl);
	$httpCode = (int)curl_getinfo($curl, CURLINFO_HTTP_CODE);
	curl_close($curl);
	fclose($fh);
	if($ok === false || $httpCode >= 400){
		@unlink($path);
		bridgeLog('avatar_fetch_failed', ['user_id' => $user['user_id'], 'http' => $httpCode]);
		return false;
	}
	if(!file_exists($path)){
		return false;
	}
	$info = @getimagesize($path);
	$allowed = [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_GIF, IMAGETYPE_WEBP];
	if($info === false || !in_array($info[2], $allowed, true)){
		@unlink($path);
		bridgeLog('avatar_rejected_mime', ['user_id' => $user['user_id']]);
		return false;
	}
	unlinkBridgeAvatar($user['user_tumb']);
	$bmysqli->query("UPDATE boom_users SET user_tumb = '$img' WHERE user_id = '{$user['user_id']}'");
	return true;
}
function unlinkBridgeAvatar($file){
	if(stripos($file, 'default') === false){
		$delete =  BOOM_PATH . '/avatar/' . $file;
		if(file_exists($delete)){
			unlink($delete);
		}
	}
	return true;
}
function getBridgeName($name, $connection){
	$t = 0;
	$tcount = 0;
	$try = cleanBridgeName($name);
	while($t == 0){
		$tdouble = $connection->query("SELECT * FROM boom_users WHERE user_name = '$try'");
		if($tdouble->num_rows > 0){
			$tcount++;
			$try = cleanBridgeName($name) . $tcount;
		}
		else{
			$t = 1;
		}
	}
	return $try;
}
?>
