<?php
/**
 * 平台能力单元测试（独立运行，无需 WP/WC 环境）：
 *   php tests/run-platform-tests.php   （退出码 0=通过 / 1=失败）
 *
 * 覆盖：BE-008 banner 配置与映射、BE-010 结构化日志、SEC-001 限频分档常量。
 *
 * @package SutwxAppApi
 * @version 0.6.0
 */

require __DIR__ . '/bootstrap.php';

// option / transient / error_log 桩（与 run-cache-tests 相同的内存实现）。
$GLOBALS['sutwx_options']    = array();
$GLOBALS['sutwx_transients'] = array();
$GLOBALS['sutwx_log_lines']  = array();

if ( ! function_exists( 'get_option' ) ) {
	function get_option( $key, $default = false ) {
		return isset( $GLOBALS['sutwx_options'][ $key ] ) ? $GLOBALS['sutwx_options'][ $key ] : $default;
	}
}
if ( ! function_exists( 'update_option' ) ) {
	function update_option( $key, $value ) {
		$GLOBALS['sutwx_options'][ $key ] = $value;
		return true;
	}
}
if ( ! function_exists( 'get_transient' ) ) {
	function get_transient( $key ) {
		return isset( $GLOBALS['sutwx_transients'][ $key ] ) ? $GLOBALS['sutwx_transients'][ $key ] : false;
	}
}
if ( ! function_exists( 'set_transient' ) ) {
	function set_transient( $key, $value, $ttl = 0 ) {
		$GLOBALS['sutwx_transients'][ $key ] = $value;
		return true;
	}
}
// error_log 为 PHP 内置函数，无法用同名桩覆盖；重定向到临时文件后读文件计数。
$sutwx_log_file = sys_get_temp_dir() . '/sutwx-platform-tests-' . getmypid() . '.log';
ini_set( 'error_log', $sutwx_log_file );
file_put_contents( $sutwx_log_file, '' );

require dirname( __DIR__ ) . '/includes/class-cache.php';
require dirname( __DIR__ ) . '/includes/class-error-log.php';
require dirname( __DIR__ ) . '/includes/class-banner-settings.php';
require dirname( __DIR__ ) . '/includes/class-rate-limit.php';
require dirname( __DIR__ ) . '/includes/mappings/map-banner.php';

$failures = 0;

function check( $condition, $message ) {
	global $failures;
	if ( $condition ) {
		echo "  [PASS] {$message}\n";
	} else {
		$failures++;
		echo "  [FAIL] {$message}\n";
	}
}

function log_count() {
	global $sutwx_log_file;
	// 只统计 [sutwx] 前缀行，忽略同文件中的其他 PHP notice/warning。
	if ( ! file_exists( $sutwx_log_file ) ) {
		return 0;
	}
	return (int) preg_match_all( '/\[sutwx\] /', (string) file_get_contents( $sutwx_log_file ) );
}

function last_log_line() {
	global $sutwx_log_file;
	$lines = preg_grep( '/\[sutwx\] /', (array) file( $sutwx_log_file, FILE_IGNORE_NEW_LINES ) );
	$lines = array_values( (array) $lines );
	return (string) ( $lines ? $lines[ count( $lines ) - 1 ] : '' );
}

echo "== BE-010 结构化日志 ==\n";

Sutwx_Error_Log::set_enabled( false );
$before = log_count();
Sutwx_Error_Log::log( 'rest_error', array( 'code' => 'x' ) );
check( log_count() === $before, '开关关闭时普通事件不落盘' );

Sutwx_Error_Log::log( 'auth_failed', array( 'code' => 'token_expired', 'route' => '/auth/login' ) );
check( log_count() === $before + 1, 'auth_failed 必记（不受开关影响）' );
Sutwx_Error_Log::log( 'rate_limited', array() );
check( log_count() === $before + 2, 'rate_limited 必记' );
Sutwx_Error_Log::log( 'pay_exception', array() );
check( log_count() === $before + 3, 'pay_exception 必记' );

$last = last_log_line();
check( false !== strpos( $last, '"event":"pay_exception"' ), '日志行为单行 JSON 含 event' );
check( false !== strpos( $last, '[sutwx] ' ), '日志行带 [sutwx] 前缀' );

Sutwx_Error_Log::set_enabled( true );
Sutwx_Error_Log::log( 'monitor', array( 'code' => 'error', 'page' => 'pages/home/index' ) );
check( log_count() === $before + 4, '开关开启后普通事件落盘' );

check( '1.2.3.*' === Sutwx_Error_Log::anonymize_ip( '1.2.3.4' ), 'IPv4 脱敏去末段' );
check( '2001:db8::*' === Sutwx_Error_Log::anonymize_ip( '2001:db8::1' ), 'IPv6 取前 4 组' );
check( 'unknown' === Sutwx_Error_Log::anonymize_ip( 'not-an-ip' ), '非法 IP 归 unknown' );
check( 2048 === strlen( Sutwx_Error_Log::truncate( str_repeat( 'a', 4096 ) ) ), '超长字段截断到 2048' );
check( '' === Sutwx_Error_Log::current_route(), '无 REQUEST_URI 时路由为空' );

echo "== BE-008 Banner 配置与映射 ==\n";

$row = Sutwx_Banner_Settings::sanitize_row(
	array(
		'id'      => 'b1',
		'title'   => '  新品上线  ',
		'image'   => 'https://cdn.example.com/a.jpg',
		'url'     => '/pages/product/detail?id=1',
		'sort'    => -5,
		'enabled' => 1,
	)
);
check( 'b1' === $row['id'] && '新品上线' === $row['title'], '字段 trim 与透传' );
check( 0 === $row['sort'], '负数排序归零' );
check( true === $row['enabled'], 'enabled 归一为布尔' );

$bad = Sutwx_Banner_Settings::sanitize_row(
	array( 'id' => 'b2', 'image' => 'http://insecure.com/a.jpg', 'url' => 'javascript:alert(1)' )
);
check( '' === $bad['image'], '非 https 图片被清空' );
check( '' === $bad['url'], '非法协议跳转被清空' );

$gen = Sutwx_Banner_Settings::sanitize_row( array( 'image' => 'https://cdn.example.com/b.jpg' ) );
check( 0 === strpos( $gen['id'], 'banner-' ), '空 id 自动生成' );

Sutwx_Banner_Settings::update_all(
	array(
		array( 'id' => 'a', 'title' => 'A', 'image' => 'https://cdn.example.com/a.jpg', 'url' => '/pages/home/index', 'sort' => 2, 'enabled' => 1 ),
		array( 'id' => 'b', 'title' => 'B', 'image' => 'https://cdn.example.com/b.jpg', 'url' => 'https://sut.example.com', 'sort' => 1, 'enabled' => 1 ),
		array( 'id' => 'c', 'title' => 'C', 'image' => 'https://cdn.example.com/c.jpg', 'sort' => 0, 'enabled' => 0 ),
		array( 'id' => 'd', 'title' => 'D', 'image' => '', 'sort' => 0, 'enabled' => 1 ),
	)
);
$enabled = Sutwx_Banner_Settings::get_enabled();
check( 2 === count( $enabled ), '空 image 行被剔除、未启用行不输出' );
check( 'b' === $enabled[0]['id'] && 'a' === $enabled[1]['id'], '按 sort 升序输出' );

$bumped = Sutwx_Cache::version( 'banner' );
Sutwx_Banner_Settings::update_all( array() );
check( Sutwx_Cache::version( 'banner' ) === $bumped + 1, '保存后 banner 缓存分组失效' );
check( in_array( 'banner', Sutwx_Cache::GROUPS, true ), 'cache 分组注册 banner' );

$mapped = sutwx_map_banner( array( 'id' => 'a', 'title' => 'A', 'image' => 'i.png', 'url' => '/pages/home/index' ) );
check( 'page' === $mapped['type'], '页内路径映射 type=page' );
$mapped2 = sutwx_map_banner( array( 'id' => 'b', 'title' => 'B', 'image' => 'i.png', 'url' => 'https://sut.example.com' ) );
check( 'web' === $mapped2['type'], 'https 外链映射 type=web' );

echo "== SEC-001 限频分档 ==\n";

check( 60 === Sutwx_Rate_Limit::LIMIT_PUBLIC, '公开端点 60 次/分' );
check( 30 === Sutwx_Rate_Limit::LIMIT_AUTH, '鉴权端点 30 次/分' );
check( 10 === Sutwx_Rate_Limit::LIMIT_PAY, '支付端点 10 次/分' );
check( 10 === Sutwx_Rate_Limit::LIMIT_MONITOR, '监控上报 10 次/分' );
check( Sutwx_Rate_Limit::LIMIT_PAY <= Sutwx_Rate_Limit::LIMIT_AUTH, '支付档不高于鉴权档' );
check( Sutwx_Rate_Limit::LIMIT_AUTH < Sutwx_Rate_Limit::LIMIT_PUBLIC, '鉴权档严格于公开档' );

// monitor 桶与 public 桶独立计数。
$mon = 'mon-' . mt_rand( 1, 999999 );
$r1  = Sutwx_Rate_Limit::check( $mon, Sutwx_Rate_Limit::LIMIT_MONITOR, Sutwx_Rate_Limit::WINDOW );
check( $r1['ok'] && $r1['remaining'] === Sutwx_Rate_Limit::LIMIT_MONITOR - 1, 'monitor 桶首次通过并递减' );
$r2 = Sutwx_Rate_Limit::check( $mon . '-p', Sutwx_Rate_Limit::LIMIT_PUBLIC, Sutwx_Rate_Limit::WINDOW );
check( $r2['ok'] && $r2['remaining'] === Sutwx_Rate_Limit::LIMIT_PUBLIC - 1, 'public 桶独立计数' );
Sutwx_Error_Log::set_enabled( false );

echo "\n" . ( $failures ? "失败 {$failures} 项\n" : "全部通过\n" );
exit( $failures ? 1 : 0 );



