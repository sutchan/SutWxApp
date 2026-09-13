<?php
/**
 * 主题配置单元测试（独立运行，无需 WP/WC 环境）：
 *   php tests/run-settings-tests.php   （退出码 0=通过 / 1=失败）
 *
 * @package SutwxAppApi
 * @version 0.3.0
 */

require __DIR__ . '/bootstrap.php';

// option 桩（独立运行时注入，避免依赖 WP 选项 API）
if ( ! function_exists( 'get_option' ) ) {
	$GLOBALS['sutwx_options'] = array();
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

require dirname( __DIR__ ) . '/includes/sanitize.php';
require dirname( __DIR__ ) . '/includes/class-settings.php';

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

echo "== 颜色校验 ==\n";

check( sutwx_is_valid_color( '#2E7D32' ), '合法 #RRGGBB（大写）' );
check( sutwx_is_valid_color( '#2e7d32' ), '合法 #RRGGBB（小写）' );
check( sutwx_is_valid_color( '#FFF' ), '合法 #RGB' );
check( false === sutwx_is_valid_color( 'red' ), '非法颜色名' );
check( false === sutwx_is_valid_color( '#12' ), '非法长度' );
check( false === sutwx_is_valid_color( '#GGG' ), '非法十六进制' );
check( false === sutwx_is_valid_color( 123 ), '非字符串' );

check( '#2e7d32' === sutwx_sanitize_color( '#2E7D32' ), 'sanitize 转小写' );
check( null === sutwx_sanitize_color( 'bad' ), '非法返回 null' );
check( null === sutwx_sanitize_color( '#2e7d32 ' ), '前后空格被 trim 后合法' );

echo "== 预设/字段常量对齐小程序 ==\n";

check( 5 === count( Sutwx_Settings::THEME_PRESETS ), '预设 5 套' );
check( 11 === count( Sutwx_Settings::THEME_KEYS ), '字段 11 个' );
check( Sutwx_Settings::is_valid_preset( 'sut-green' ), 'sut-green 合法' );
check( false === Sutwx_Settings::is_valid_preset( 'nope' ), '未知预设非法' );

echo "== custom 字段过滤 ==\n";

$filtered = Sutwx_Settings::sanitize_custom(
	array(
		'primaryColor' => '#2E7D32',
		'textPrimary'  => 'red',
		'ghostKey'     => '#FFFFFF',
	)
);
check( 1 === count( $filtered ), '仅保留 1 个合法字段' );
check( '#2e7d32' === $filtered['primaryColor'], '合法字段小写保留' );
check( ! isset( $filtered['textPrimary'] ), '非法颜色字段被丢弃' );
check( ! isset( $filtered['ghostKey'] ), '白名单外字段被丢弃' );

echo "== 整份配置清洗 ==\n";

$clean = Sutwx_Settings::sanitize_theme_config(
	array(
		'presetId' => 'unknown',
		'custom'   => array( 'primaryLight' => '#F1F8E9' ),
	)
);
check( 'sut-green' === $clean['presetId'], '非法 presetId 回退默认' );
check( '#f1f8e9' === $clean['custom']['primaryLight'], 'custom 合法保留' );

$clean2 = Sutwx_Settings::sanitize_theme_config(
	array( 'presetId' => 'sky-blue' )
);
check( 'sky-blue' === $clean2['presetId'] && ! isset( $clean2['custom'] ), '无 custom 时不出空 custom' );

echo "== 读写闭环 ==\n";

Sutwx_Settings::update_theme_config(
	array(
		'presetId' => 'sky-blue',
		'custom'   => array( 'primaryColor' => '#1976D2' ),
	)
);
$cfg = Sutwx_Settings::get_theme_config();
check( 'sky-blue' === $cfg['presetId'], '读取 presetId=sky-blue' );
check( '#1976d2' === $cfg['custom']['primaryColor'], '读取 custom.primaryColor（小写）' );

// 模拟后台提交包含非法字段，写入后应保持清洗
Sutwx_Settings::update_theme_config(
	array(
		'presetId' => 'violet',
		'custom'   => array( 'primaryColor' => 'invalid', 'primaryDark' => '#4A148C' ),
	)
);
$cfg2 = Sutwx_Settings::get_theme_config();
check( '#4a148c' === $cfg2['custom']['primaryDark'], '合法字段保留' );
check( ! isset( $cfg2['custom']['primaryColor'] ), '非法颜色不落库' );

echo "\n" . ( $failures ? "失败 {$failures} 项\n" : "全部通过\n" );
exit( $failures ? 1 : 0 );
