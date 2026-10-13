<?php
/**
 * 缓存与限频单测（独立运行，无需 WP/WC 环境）：
 *   php tests/run-cache-tests.php   （退出码 0=通过 / 1=失败）
 *
 * 覆盖：Transients 命中/失效、空结果不缓存、分组版本号清缓存、IP 限频与配额递减（BE-004/005）。
 *
 * @package SutwxAppApi
 * @version 0.4.0
 */

require __DIR__ . '/stubs-runtime.php';

require dirname( __DIR__ ) . '/includes/class-cache.php';
require dirname( __DIR__ ) . '/includes/class-rate-limit.php';

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

echo "== Transients 缓存命中（BE-004） ==\n";

$calls = 0;
$loader = function () use ( &$calls ) {
	$calls++;
	return array( 'list' => array( 'item-' . $calls ), 'total' => $calls );
};

$first  = Sutwx_Cache::remember( 'product', array( 'page' => 1 ), $loader, 300 );
$second = Sutwx_Cache::remember( 'product', array( 'page' => 1 ), $loader, 300 );

check( 1 === $calls, '相同参数第二次命中缓存，回调仅执行 1 次' );
check( $first === $second, '命中返回与首次一致的数据' );
check( 'item-1' === $second['list'][0], '缓存数据内容正确' );

Sutwx_Cache::remember( 'product', array( 'page' => 2 ), $loader, 300 );
check( 2 === $calls, '不同参数各自缓存' );

echo "== 空结果不缓存 ==\n";

$null_calls = 0;
$null_loader = function () use ( &$null_calls ) {
	$null_calls++;
	return null;
};
Sutwx_Cache::remember( 'post', array( 'detail' => 999 ), $null_loader, 300 );
Sutwx_Cache::remember( 'post', array( 'detail' => 999 ), $null_loader, 300 );
check( 2 === $null_calls, '空结果每次回源（避免「不存在」被固化）' );

echo "== 分组版本号精准失效 ==\n";

$version_before = Sutwx_Cache::version( 'product' );
$key_before     = Sutwx_Cache::key( 'product', array( 'page' => 1 ) );

$calls = 0;
Sutwx_Cache::remember( 'product', array( 'page' => 1 ), $loader, 300 );
check( 1 === $calls, '失效后重建前已重新计算' );

Sutwx_Cache::bump( 'product' );
$version_after = Sutwx_Cache::version( 'product' );
$key_after     = Sutwx_Cache::key( 'product', array( 'page' => 1 ) );

check( $version_after === $version_before + 1, 'bump 递增版本号' );
check( $key_before !== $key_after, '版本号变化导致缓存键变化（等效清缓存）' );

Sutwx_Cache::remember( 'product', array( 'page' => 1 ), $loader, 300 );
check( 2 === $calls, '版本号变化后回源重建缓存' );
check( Sutwx_Cache::version( 'post' ) === 1, '其他分组版本不受影响（精准失效）' );

echo "== 内容变更钩子 ==\n";

$post       = new stdClass();
$post->post_type = 'product';
Sutwx_Cache::on_save_post( 1, $post );
check( Sutwx_Cache::version( 'product' ) === $version_after + 1, '保存商品 → product 分组失效' );
check( Sutwx_Cache::version( 'category' ) === 2, '保存商品同时失效 category 分组' );

$post->post_type = 'post';
Sutwx_Cache::on_save_post( 2, $post );
check( Sutwx_Cache::version( 'post' ) === 2, '保存文章 → post 分组失效' );

Sutwx_Cache::on_theme_change();
check( Sutwx_Cache::version( 'theme' ) === 2, '主题变更 → theme 分组失效' );

echo "== IP 限频（BE-005） ==\n";

$_SERVER['REMOTE_ADDR'] = '10.0.0.1';
check( '10.0.0.1' === Sutwx_Rate_Limit::client_ip(), '读取客户端 IP' );

$bucket = 'unit-' . mt_rand( 1, 999999 );
$first  = Sutwx_Rate_Limit::check( $bucket, 3, 60 );
check( $first['ok'] && 2 === $first['remaining'], '首次请求通过，剩余配额递减' );
check( 3 === $first['limit'], 'limit 回传正确' );
check( $first['reset'] > time(), 'reset 为未来时间戳' );

$second = Sutwx_Rate_Limit::check( $bucket, 3, 60 );
$third  = Sutwx_Rate_Limit::check( $bucket, 3, 60 );
check( $second['ok'] && 1 === $second['remaining'], '第二次通过' );
check( ! $third['ok'] && 0 === $third['remaining'], '超过上限后拒绝' );
check( 0 === $third['remaining'], '超限时 remaining=0' );

$other = Sutwx_Rate_Limit::check( $bucket . '-other', 3, 60 );
check( $other['ok'], '不同桶互不影响' );

$_SERVER['REMOTE_ADDR'] = '10.0.0.2';
$other_ip = Sutwx_Rate_Limit::check( $bucket, 3, 60 );
check( $other_ip['ok'], '不同 IP 互不影响' );

echo "== 限频常量 ==\n";

check( Sutwx_Rate_Limit::LIMIT_AUTH < Sutwx_Rate_Limit::LIMIT_PUBLIC, '鉴权端点限频更严格（防 code2session 爆破）' );
check( 300 === Sutwx_Cache::TTL && 600 === Sutwx_Cache::TTL_DETAIL, '列表 5 分钟 / 详情 10 分钟' );

echo "\n" . ( $failures ? "失败 {$failures} 项\n" : "全部通过\n" );
exit( $failures ? 1 : 0 );
