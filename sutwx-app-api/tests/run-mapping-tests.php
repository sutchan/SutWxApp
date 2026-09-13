<?php
/**
 * 映射函数单元测试（独立运行，无需 WP/WC 环境）：
 *   php tests/run-mapping-tests.php   （退出码 0=通过 / 1=失败）
 *
 * @package SutwxAppApi
 * @version 0.2.0
 */

require __DIR__ . '/bootstrap.php';
require dirname( __DIR__ ) . '/includes/sanitize.php';
require dirname( __DIR__ ) . '/includes/mappings/map-product.php';
require dirname( __DIR__ ) . '/includes/mappings/map-post.php';
require dirname( __DIR__ ) . '/includes/mappings/map-category.php';

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

function char_len( $text ) {
	return function_exists( 'mb_strlen' ) ? mb_strlen( $text, 'UTF-8' ) : strlen( $text );
}

echo "== map-product ==\n";

$GLOBALS['sutwx_terms'][11] = (object) array( 'name' => '绿植' );

$product = new Fake_Product(
	array(
		'id'                => 1,
		'name'              => '苏铁盆栽',
		'price'             => 80.0,
		'regular_price'     => 100.0,
		'image_id'          => 5,
		'gallery'           => array( 6 ),
		'category_ids'      => array( 11 ),
		'total_sales'       => 7,
		'sku'               => 'ST-001',
		'short_description' => '<p>好养活</p>',
		'description'       => '<p>长描述</p>',
		'average_rating'    => 4.5,
		'review_count'      => 12,
		'permalink'         => 'https://example.com/product/sutie',
		'on_sale'           => true,
		'featured'          => true,
	)
);
$d = sutwx_map_product( $product );

check( is_array( $d ) && 1 === $d['id'], '商品 ID 透传' );
check( 80.0 === $d['price'] && 100.0 === $d['originPrice'], '现价/原价（划线价）' );
check( true === $d['onSale'] && true === $d['featured'], 'onSale/featured' );
check( 'https://example.com/wp-content/uploads/img-5.jpg' === $d['image'], '主图 URL' );
check( 2 === count( $d['images'] ), '图集 = 主图 + 画廊' );
check( 11 === $d['categoryId'] && '绿植' === $d['categoryName'], '分类 ID/名称' );
check( 7 === $d['sales'] && 99 === $d['stock'] && 'instock' === $d['stockStatus'], '销量/缺省库存 99' );
check( '好养活' === $d['desc'], '短描述去标签' );
check( 1 === count( $d['specs'] ) && '默认规格' === $d['specs'][0]['name'], '简单商品单一默认规格' );
check( 4.5 === $d['rating'] && 12 === $d['reviewCount'], '评分/评论数' );
check( 'ST-001' === $d['sku'] && 'https://example.com/product/sutie' === $d['permalink'], 'SKU/链接' );

$variable = new Fake_Product(
	array(
		'id'         => 2,
		'name'       => '多规格商品',
		'type'       => 'variable',
		'price'      => 50.0,
		'regular_price' => 50.0,
		'attributes' => array(
			new Fake_Attribute( '颜色', array( '红', '绿' ) ),
			new Fake_Attribute( '尺寸', array( '大' ), false ),
		),
	)
);
$dv = sutwx_map_product( $variable );
check( 'variable' === $dv['type'], 'variable 类型透传' );
check( 2 === count( $dv['specs'] ) && '颜色: 红' === $dv['specs'][0]['name'], '可变规格仅展开 variation 属性' );

$no_image   = sutwx_map_product( new Fake_Product( array( 'image_id' => 0 ) ) );
$empty_name = sutwx_map_product( new Fake_Product( array( 'name' => '', 'price' => 0 ) ) );
check( '' === $no_image['image'] && array( '' ) === $no_image['images'], '无图缺省 image="" images=[""]' );
check( 'simple' === $empty_name['type'] && 0.0 === $empty_name['price'], '字段缺省值兜底' );
check( null === sutwx_map_product( null ), 'null → null' );
check( null === sutwx_map_product( 'bad' ), '非对象 → null' );

echo "== map-post ==\n";

$GLOBALS['sutwx_post_meta'][9]['_thumbnail_id'] = 3;
$GLOBALS['sutwx_post_cats'][9]                  = array( 21, 22 );

$post = (object) array(
	'ID'           => 9,
	'post_type'    => 'post',
	'post_status'  => 'publish',
	'post_title'   => '<b>养护指南</b>',
	'post_content' => '<p>' . str_repeat( '苏铁', 40 ) . '</p>',
	'post_excerpt' => '',
	'post_date'    => '2026-09-13 10:00:00',
	'post_author'  => 1,
);
$dp = sutwx_map_post( $post );

check( 9 === $dp['id'] && '养护指南' === $dp['title'], 'ID/标题去标签' );
check( 60 === char_len( $dp['excerpt'] ), '摘要截断 60 字（无摘要回退正文）' );
check( 'https://example.com/wp-content/uploads/img-3.jpg' === $dp['cover'], '特色图' );
check( '2026-09-13' === $dp['date'], '日期 YYYY-MM-DD' );
check( 21 === $dp['category'], '分类取第一个' );
check( '作者甲' === $dp['author'] && 'https://example.com/?p=9' === $dp['link'], '作者显示名/原文链接' );

$excerpted                 = clone $post;
$excerpted->post_excerpt   = '<p>手动摘要</p>';
$dp2                       = sutwx_map_post( $excerpted );
check( '手动摘要' === $dp2['excerpt'], '优先手动摘要' );
check( null === sutwx_map_post( (object) array( 'ID' => 2, 'post_type' => 'post', 'post_status' => 'draft' ) ), '草稿 → null' );
check( null === sutwx_map_post( (object) array( 'ID' => 3, 'post_type' => 'page', 'post_status' => 'publish' ) ), '非 post 类型 → null' );
check( null === sutwx_map_post( null ), 'null → null' );

echo "== map-category ==\n";

$GLOBALS['sutwx_term_meta'][11]['thumbnail_id'] = 8;

$term = (object) array(
	'term_id'     => 11,
	'name'        => '绿植',
	'slug'        => 'plants',
	'description' => '<p> desc </p>',
	'parent'      => 5,
	'count'       => 3,
	'taxonomy'    => 'product_cat',
);
$dc = sutwx_map_category( $term );

check( 11 === $dc['id'] && '绿植' === $dc['name'], 'ID/名称' );
check( 'https://example.com/wp-content/uploads/img-8.jpg' === $dc['icon'], '分类图标（thumbnail_id）' );
check( 3 === $dc['count'] && 5 === $dc['parentId'] && 'plants' === $dc['slug'], 'count/parentId/slug' );
check( 'desc' === $dc['description'], '描述去标签' );
check( 'https://example.com/product-cat/plants' === $dc['permalink'], '分类链接' );
check( null === sutwx_map_category( null ), 'null → null' );
check( 2 === count( sutwx_map_categories( array( $term, null, $term ) ) ), '批量过滤无效项' );

echo "\n" . ( $failures ? "失败 {$failures} 项\n" : "全部通过\n" );
exit( $failures ? 1 : 0 );
