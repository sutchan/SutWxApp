<?php
/**
 * 运行时桩：option / transient / 用户 / 过滤器（供鉴权与缓存单测独立运行）。
 *
 * 与 bootstrap.php（映射层 WP/WC 桩）分离，避免相互污染。
 *
 * @package SutwxAppApi
 * @version 0.4.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', dirname( __DIR__ ) . '/' );
}

$GLOBALS['sutwx_options']    = array();
$GLOBALS['sutwx_transients'] = array();
$GLOBALS['sutwx_users']      = array();
$GLOBALS['sutwx_uid_seq']    = 100;

// ---------------------------------------------------------------------------
// option / transient
// ---------------------------------------------------------------------------

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

if ( ! function_exists( 'set_transient' ) ) {
	function set_transient( $key, $value, $ttl = 0 ) {
		$GLOBALS['sutwx_transients'][ $key ] = array(
			'value' => $value,
			'exp'   => time() + max( 1, (int) $ttl ),
		);
		return true;
	}
}

if ( ! function_exists( 'get_transient' ) ) {
	function get_transient( $key ) {
		if ( ! isset( $GLOBALS['sutwx_transients'][ $key ] ) ) {
			return false;
		}
		if ( $GLOBALS['sutwx_transients'][ $key ]['exp'] < time() ) {
			unset( $GLOBALS['sutwx_transients'][ $key ] );
			return false;
		}
		return $GLOBALS['sutwx_transients'][ $key ]['value'];
	}
}

// ---------------------------------------------------------------------------
// 用户
// ---------------------------------------------------------------------------

if ( ! function_exists( 'get_users' ) ) {
	function get_users( $args ) {
		$meta_key   = isset( $args['meta_key'] ) ? $args['meta_key'] : '';
		$meta_value = isset( $args['meta_value'] ) ? $args['meta_value'] : '';
		foreach ( $GLOBALS['sutwx_users'] as $uid => $user ) {
			if ( isset( $user['meta'][ $meta_key ] ) && $user['meta'][ $meta_key ] === $meta_value ) {
				$found     = new stdClass();
				$found->ID = $uid;
				return array( $found );
			}
		}
		return array();
	}
}

if ( ! function_exists( 'wp_insert_user' ) ) {
	function wp_insert_user( $data ) {
		$uid = ++$GLOBALS['sutwx_uid_seq'];
		$GLOBALS['sutwx_users'][ $uid ] = array(
			'display_name' => isset( $data['display_name'] ) ? $data['display_name'] : '',
			'meta'         => array(),
		);
		return $uid;
	}
}

if ( ! function_exists( 'update_user_meta' ) ) {
	function update_user_meta( $uid, $key, $value ) {
		if ( ! isset( $GLOBALS['sutwx_users'][ $uid ] ) ) {
			$GLOBALS['sutwx_users'][ $uid ] = array( 'display_name' => '', 'meta' => array() );
		}
		$GLOBALS['sutwx_users'][ $uid ]['meta'][ $key ] = $value;
		return true;
	}
}

if ( ! function_exists( 'get_user_meta' ) ) {
	function get_user_meta( $uid, $key, $single = true ) {
		return isset( $GLOBALS['sutwx_users'][ $uid ]['meta'][ $key ] )
			? $GLOBALS['sutwx_users'][ $uid ]['meta'][ $key ]
			: '';
	}
}

if ( ! function_exists( 'get_userdata' ) ) {
	function get_userdata( $uid ) {
		if ( ! isset( $GLOBALS['sutwx_users'][ $uid ] ) ) {
			return null;
		}
		$user              = new stdClass();
		$user->ID          = $uid;
		$user->display_name = $GLOBALS['sutwx_users'][ $uid ]['display_name'];
		return $user;
	}
}

// ---------------------------------------------------------------------------
// 过滤器与清洗
// ---------------------------------------------------------------------------

if ( ! function_exists( 'apply_filters' ) ) {
	function apply_filters( $tag, $value ) {
		if ( 'sutwx_code2session_response' === $tag && isset( $GLOBALS['sutwx_code2session_stub'] ) ) {
			return $GLOBALS['sutwx_code2session_stub'];
		}
		return $value;
	}
}

if ( ! function_exists( 'sanitize_text_field' ) ) {
	function sanitize_text_field( $value ) {
		return trim( strip_tags( (string) $value ) );
	}
}

if ( ! function_exists( '__' ) ) {
	function __( $text, $domain = null ) {
		return $text;
	}
}
