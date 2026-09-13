<?php
/**
 * 主题配置管理：option 读写与字段校验（与小程序 models/theme.js 对齐）。
 *
 * @package SutwxAppApi
 * @version 0.3.0
 */

defined( 'ABSPATH' ) || exit;

require_once SUTWX_API_DIR . 'includes/sanitize.php';

/**
 * 主题配置（option: sutwx_theme）读写与校验。
 */
class Sutwx_Settings {

	/**
	 * 主题字段白名单（与小程序 models/theme.js 的 THEME_KEYS 严格一致）。
	 */
	const THEME_KEYS = array(
		'primaryColor',
		'primaryLight',
		'primaryDark',
		'textPrimary',
		'textSecondary',
		'textTertiary',
		'textInverse',
		'borderColor',
		'backgroundPrimary',
		'backgroundSecondary',
		'backgroundTertiary',
	);

	/**
	 * 内置预设（与小程序 models/theme.js 的 THEME_PRESETS 严格一致：id => 中文名）。
	 */
	const THEME_PRESETS = array(
		'sut-green'    => '苏铁绿',
		'sky-blue'     => '天空蓝',
		'sunny-orange' => '暖阳橙',
		'violet'       => '紫罗兰',
		'graphite'     => '石墨黑',
	);

	const DEFAULT_PRESET = 'sut-green';

	/**
	 * 读取主题配置（缺省补 presetId=默认预设，custom 仅保留合法字段）。
	 *
	 * @return array{presetId:string,custom:array}
	 */
	public static function get_theme_config() {
		$option = get_option( SUTWX_API_THEME_OPTION, array() );
		$option = is_array( $option ) ? $option : array();

		$preset_id = isset( $option['presetId'] ) && self::is_valid_preset( $option['presetId'] )
			? $option['presetId']
			: self::DEFAULT_PRESET;

		$data = array( 'presetId' => $preset_id );

		if ( isset( $option['custom'] ) && is_array( $option['custom'] ) ) {
			$custom = self::sanitize_custom( $option['custom'] );
			if ( ! empty( $custom ) ) {
				$data['custom'] = $custom;
			}
		}

		return $data;
	}

	/**
	 * 校验并清洗 custom：仅保留白名单字段且值为合法颜色。
	 *
	 * @param array $custom 原始 custom。
	 * @return array
	 */
	public static function sanitize_custom( $custom ) {
		$out = array();
		if ( ! is_array( $custom ) ) {
			return $out;
		}
		foreach ( self::THEME_KEYS as $key ) {
			if ( isset( $custom[ $key ] ) ) {
				$color = sutwx_sanitize_color( $custom[ $key ] );
				if ( null !== $color ) {
					$out[ $key ] = $color;
				}
			}
		}
		return $out;
	}

	/**
	 * 校验 presetId 是否在白名单内。
	 *
	 * @param string $preset_id 预设 id。
	 * @return bool
	 */
	public static function is_valid_preset( $preset_id ) {
		return is_string( $preset_id ) && isset( self::THEME_PRESETS[ $preset_id ] );
	}

	/**
	 * 统一校验整份主题配置（用于写入前清洗）。
	 *
	 * @param array $raw 原始提交。
	 * @return array 可直接 update_option 的配置。
	 */
	public static function sanitize_theme_config( $raw ) {
		$raw = is_array( $raw ) ? $raw : array();

		$preset_id = isset( $raw['presetId'] ) && self::is_valid_preset( $raw['presetId'] )
			? $raw['presetId']
			: self::DEFAULT_PRESET;

		$config = array( 'presetId' => $preset_id );

		if ( isset( $raw['custom'] ) ) {
			$custom = self::sanitize_custom( $raw['custom'] );
			if ( ! empty( $custom ) ) {
				$config['custom'] = $custom;
			}
		}

		return $config;
	}

	/**
	 * 写入主题配置（含校验清洗）。
	 *
	 * @param array $raw 原始提交。
	 * @return bool
	 */
	public static function update_theme_config( $raw ) {
		$config = self::sanitize_theme_config( $raw );
		return update_option( SUTWX_API_THEME_OPTION, $config );
	}
}
