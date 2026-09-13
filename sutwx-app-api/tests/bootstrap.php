<?php
/**
 * 映射单测桩环境：提供 WP/WC 最小桩与假对象（均带 function_exists 守卫，
 * 可在 WP 环境共存；独立运行时 `php tests/run-mapping-tests.php`）。
 *
 * @package SutwxAppApi
 * @version 0.2.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', dirname( __DIR__ ) . '/' );
}

// ---------------------------------------------------------------------------
// WP 桩函数
// ---------------------------------------------------------------------------

if ( ! function_exists( 'wp_strip_all_tags' ) ) {
	function wp_strip_all_tags( $string ) {
		return trim( preg_replace( '/<[^>]*>/', '', (string) $string ) );
	}
}

if ( ! function_exists( 'wp_kses_post' ) ) {
	function wp_kses_post( $string ) {
		return (string) $string;
	}
}

if ( ! function_exists( 'is_wp_error' ) ) {
	function is_wp_error( $thing ) {
		return false;
	}
}

if ( ! function_exists( 'get_term' ) ) {
	function get_term( $id ) {
		return isset( $GLOBALS['sutwx_terms'][ (int) $id ] ) ? $GLOBALS['sutwx_terms'][ (int) $id ] : null;
	}
}

if ( ! function_exists( 'get_post' ) ) {
	function get_post( $post ) {
		return is_object( $post ) ? $post : null;
	}
}

if ( ! function_exists( 'get_permalink' ) ) {
	function get_permalink( $id ) {
		return 'https://example.com/?p=' . (int) $id;
	}
}

if ( ! function_exists( 'wp_get_attachment_url' ) ) {
	function wp_get_attachment_url( $id ) {
		return (int) $id > 0
			? 'https://example.com/wp-content/uploads/img-' . (int) $id . '.jpg'
			: '';
	}
}

if ( ! function_exists( 'get_post_meta' ) ) {
	function get_post_meta( $id, $key, $single ) {
		return isset( $GLOBALS['sutwx_post_meta'][ (int) $id ][ $key ] )
			? $GLOBALS['sutwx_post_meta'][ (int) $id ][ $key ]
			: '';
	}
}

if ( ! function_exists( 'get_term_meta' ) ) {
	function get_term_meta( $id, $key, $single ) {
		return isset( $GLOBALS['sutwx_term_meta'][ (int) $id ][ $key ] )
			? $GLOBALS['sutwx_term_meta'][ (int) $id ][ $key ]
			: '';
	}
}

if ( ! function_exists( 'wp_get_post_categories' ) ) {
	function wp_get_post_categories( $id ) {
		return isset( $GLOBALS['sutwx_post_cats'][ (int) $id ] ) ? $GLOBALS['sutwx_post_cats'][ (int) $id ] : array();
	}
}

if ( ! function_exists( 'get_the_author_meta' ) ) {
	function get_the_author_meta( $field, $id ) {
		return '作者甲';
	}
}

if ( ! function_exists( 'get_term_link' ) ) {
	function get_term_link( $term ) {
		return 'https://example.com/product-cat/' . $term->slug;
	}
}

if ( ! function_exists( '__' ) ) {
	function __( $text, $domain = null ) {
		return $text;
	}
}

// ---------------------------------------------------------------------------
// 假对象
// ---------------------------------------------------------------------------

/**
 * WC_Product_Attribute 假对象。
 */
class Fake_Attribute {
	private $name;
	private $options;
	private $variation;

	public function __construct( $name, $options, $variation = true ) {
		$this->name      = $name;
		$this->options   = $options;
		$this->variation = $variation;
	}
	public function get_variation() {
		return $this->variation;
	}
	public function get_options() {
		return $this->options;
	}
	public function get_name() {
		return $this->name;
	}
}

/**
 * WC_Product 假对象（覆盖映射层用到的 getter）。
 */
class Fake_Product {
	private $data;

	public function __construct( $data = array() ) {
		$defaults   = array(
			'id'                => 1,
			'name'              => '',
			'price'             => 0.0,
			'regular_price'     => 0.0,
			'image_id'          => 0,
			'gallery'           => array(),
			'category_ids'      => array(),
			'total_sales'       => 0,
			'manage_stock'      => false,
			'stock_quantity'    => null,
			'stock_status'      => 'instock',
			'sku'               => '',
			'short_description' => '',
			'description'       => '',
			'average_rating'    => 0.0,
			'review_count'      => 0,
			'attributes'        => array(),
			'type'              => 'simple',
			'permalink'         => '',
			'on_sale'           => false,
			'featured'          => false,
			'status'            => 'publish',
		);
		$this->data = array_merge( $defaults, $data );
	}
	public function get_id() {
		return $this->data['id'];
	}
	public function get_name() {
		return $this->data['name'];
	}
	public function get_price() {
		return $this->data['price'];
	}
	public function get_regular_price() {
		return $this->data['regular_price'];
	}
	public function get_image_id() {
		return $this->data['image_id'];
	}
	public function get_gallery_image_ids() {
		return $this->data['gallery'];
	}
	public function get_category_ids() {
		return $this->data['category_ids'];
	}
	public function get_total_sales() {
		return $this->data['total_sales'];
	}
	public function get_manage_stock() {
		return $this->data['manage_stock'];
	}
	public function get_stock_quantity() {
		return $this->data['stock_quantity'];
	}
	public function get_stock_status() {
		return $this->data['stock_status'];
	}
	public function get_sku() {
		return $this->data['sku'];
	}
	public function get_short_description() {
		return $this->data['short_description'];
	}
	public function get_description() {
		return $this->data['description'];
	}
	public function get_average_rating() {
		return $this->data['average_rating'];
	}
	public function get_review_count() {
		return $this->data['review_count'];
	}
	public function get_attributes() {
		return $this->data['attributes'];
	}
	public function get_type() {
		return $this->data['type'];
	}
	public function get_permalink() {
		return $this->data['permalink'];
	}
	public function is_on_sale() {
		return $this->data['on_sale'];
	}
	public function is_featured() {
		return $this->data['featured'];
	}
	public function get_status() {
		return $this->data['status'];
	}
}
