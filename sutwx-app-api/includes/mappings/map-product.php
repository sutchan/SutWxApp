<?php
/**
 * WC 商品 → 小程序商品 DTO。
 * 字段契约：openspec/specs/backend/spec.md 与 SutWxApp/models/product.js（mapWooCommerceProduct）。
 *
 * @package SutwxAppApi
 * @version 0.2.0
 */

defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'sutwx_product_price' ) ) {
	/**
	 * 商品展示价（真实环境由 wc_get_price_to_display 计算折扣/含税价）。
	 *
	 * @param object $product WC_Product。
	 * @return float
	 */
	function sutwx_product_price( $product ) {
		if ( function_exists( 'wc_get_price_to_display' ) ) {
			return (float) wc_get_price_to_display( $product );
		}
		return (float) $product->get_price();
	}
}

if ( ! function_exists( 'sutwx_build_specs' ) ) {
	/**
	 * 规格列表：与小程序 models/product.js buildSpecs 逻辑对齐——
	 * 简单商品返回单一默认规格；可变商品以 variation 属性选项展开。
	 *
	 * @param object $product WC_Product。
	 * @param float  $price   当前价。
	 * @param int    $stock   库存。
	 * @return array
	 */
	function sutwx_build_specs( $product, $price, $stock ) {
		$default = array(
			array(
				'id'    => 0,
				'name'  => '默认规格',
				'price' => $price,
				'stock' => $stock,
			),
		);

		$attributes = method_exists( $product, 'get_attributes' ) ? (array) $product->get_attributes() : array();
		$specs      = array();
		$idx        = 0;

		foreach ( $attributes as $attribute ) {
			if ( ! is_object( $attribute )
				|| ! method_exists( $attribute, 'get_variation' )
				|| ! $attribute->get_variation() ) {
				continue;
			}
			$options = method_exists( $attribute, 'get_options' ) ? (array) $attribute->get_options() : array();
			$name    = method_exists( $attribute, 'get_name' ) ? (string) $attribute->get_name() : '';

			foreach ( $options as $option ) {
				$specs[] = array(
					'id'    => $idx++,
					'name'  => ( '' !== $name ? $name : '规格' ) . ': ' . (string) $option,
					'price' => $price,
					'stock' => $stock,
				);
			}
		}

		return $specs ? $specs : $default;
	}
}

if ( ! function_exists( 'sutwx_map_product' ) ) {
	/**
	 * 单个 WC 商品 → 商品 DTO（无效输入返回 null）。
	 *
	 * @param object $product WC_Product。
	 * @return array|null
	 */
	function sutwx_map_product( $product ) {
		if ( ! is_object( $product ) || ! method_exists( $product, 'get_id' ) ) {
			return null;
		}

		$price   = round( sutwx_product_price( $product ), 2 );
		$regular = round( (float) $product->get_regular_price(), 2 );
		$on_sale = method_exists( $product, 'is_on_sale' )
			? (bool) $product->is_on_sale()
			: ( $regular > $price );

		// 主图 + 画廊图（字符串 URL 数组，与小程序 DTO 对齐）。
		$image  = sutwx_attachment_url( $product->get_image_id() );
		$images = array();
		if ( '' !== $image ) {
			$images[] = $image;
		}
		foreach ( (array) $product->get_gallery_image_ids() as $gallery_id ) {
			$url = sutwx_attachment_url( $gallery_id );
			if ( '' !== $url ) {
				$images[] = $url;
			}
		}
		if ( ! $images ) {
			$images = array( '' );
		}

		// 分类：取第一个（小程序取 cats[0]）。
		$category_ids  = array_values( (array) $product->get_category_ids() );
		$category_id   = $category_ids ? (int) $category_ids[0] : 0;
		$category_name = '';
		if ( $category_id > 0 && function_exists( 'get_term' ) ) {
			$term = get_term( $category_id );
			if ( $term && ! is_wp_error( $term ) && isset( $term->name ) ) {
				$category_name = (string) $term->name;
			}
		}

		$stock_status = (string) $product->get_stock_status();
		if ( '' === $stock_status ) {
			$stock_status = 'instock';
		}
		$stock = $product->get_manage_stock()
			? (int) $product->get_stock_quantity()
			: ( 'outofstock' === $stock_status ? 0 : 99 );

		$desc = sutwx_strip_text( $product->get_short_description() );
		if ( '' === $desc ) {
			$desc = sutwx_strip_text( $product->get_description() );
		}

		return array(
			'id'           => (int) $product->get_id(),
			'name'         => (string) $product->get_name(),
			'price'        => $price,
			'originPrice'  => $regular > $price ? $regular : null,
			'image'        => $images[0],
			'images'       => $images,
			'categoryId'   => $category_id,
			'categoryName' => $category_name,
			'sales'        => (int) $product->get_total_sales(),
			'stock'        => $stock,
			'stockStatus'  => $stock_status,
			'sku'          => (string) $product->get_sku(),
			'desc'         => $desc,
			'description'  => (string) $product->get_description(),
			'isFavorite'   => false,
			'rating'       => (float) $product->get_average_rating(),
			'reviewCount'  => (int) $product->get_review_count(),
			'specs'        => sutwx_build_specs( $product, $price, $stock ),
			'type'         => (string) $product->get_type() ? (string) $product->get_type() : 'simple',
			'permalink'    => (string) $product->get_permalink(),
			'onSale'       => $on_sale,
			'featured'     => method_exists( $product, 'is_featured' ) ? (bool) $product->is_featured() : false,
		);
	}
}

if ( ! function_exists( 'sutwx_map_products' ) ) {
	/**
	 * 批量映射（过滤无效项）。
	 *
	 * @param array $products WC_Product 数组。
	 * @return array
	 */
	function sutwx_map_products( $products ) {
		if ( ! is_array( $products ) ) {
			return array();
		}
		$mapped = array();
		foreach ( $products as $product ) {
			$item = sutwx_map_product( $product );
			if ( $item ) {
				$mapped[] = $item;
			}
		}
		return $mapped;
	}
}
