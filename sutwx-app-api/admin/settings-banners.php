<?php
/**
 * 后台「设置 → 小程序设置 → 轮播管理」（BE-008）。
 *
 * @package SutwxAppApi
 * @version 0.6.0
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'Sutwx_Banner_Settings' ) ) {
	require_once SUTWX_API_DIR . 'includes/class-banner-settings.php';
}

/**
 * 轮播管理设置区。
 */
class Sutwx_Settings_Banners {

	/**
	 * 处理轮播表单提交。
	 */
	public static function maybe_save() {
		if ( ! isset( $_POST['sutwx_banners_nonce'] )
			|| ! wp_verify_nonce( wp_unslash( $_POST['sutwx_banners_nonce'] ), 'sutwx_banners_save' ) ) {
			return;
		}

		$raw = isset( $_POST['banners'] ) && is_array( $_POST['banners'] ) ? $_POST['banners'] : array();
		Sutwx_Banner_Settings::update_all( $raw );

		echo '<div class="notice notice-success is-dismissible"><p>'
			. esc_html__( '已保存轮播配置，小程序端缓存随即失效。', 'sutwx-app-api' )
			. '</p></div>';
	}

	/**
	 * 渲染轮播管理表单。
	 */
	public static function render() {
		$rows = Sutwx_Banner_Settings::all();
		// 至少渲染 3 行空模板，便于新增。
		while ( count( $rows ) < 3 ) {
			$rows[] = array( 'id' => '', 'title' => '', 'image' => '', 'url' => '', 'sort' => 0, 'enabled' => false );
		}
		?>
		<h2><?php echo esc_html__( '轮播管理', 'sutwx-app-api' ); ?></h2>
		<p class="description">
			<?php echo esc_html__( '配置小程序首页轮播（最多 10 条）。图片需 https 绝对地址；跳转链接支持小程序页内路径（/pages/...）或 https 外链；留空图片的行会被忽略。', 'sutwx-app-api' ); ?>
		</p>
		<form method="post" action="">
			<?php wp_nonce_field( 'sutwx_banners_save', 'sutwx_banners_nonce' ); ?>
			<table class="widefat striped" id="sutwx-banners-table">
				<thead>
					<tr>
						<th><?php echo esc_html__( '标题', 'sutwx-app-api' ); ?></th>
						<th><?php echo esc_html__( '图片地址', 'sutwx-app-api' ); ?></th>
						<th><?php echo esc_html__( '跳转链接', 'sutwx-app-api' ); ?></th>
						<th><?php echo esc_html__( '排序', 'sutwx-app-api' ); ?></th>
						<th><?php echo esc_html__( '启用', 'sutwx-app-api' ); ?></th>
					</tr>
				</thead>
				<tbody>
				<?php foreach ( $rows as $i => $row ) : ?>
					<tr>
						<td>
							<input type="text" name="banners[<?php echo esc_attr( $i ); ?>][title]" class="regular-text"
								value="<?php echo esc_attr( $row['title'] ); ?>" maxlength="64" />
						</td>
						<td>
							<input type="url" name="banners[<?php echo esc_attr( $i ); ?>][image]" class="regular-text"
								value="<?php echo esc_attr( $row['image'] ); ?>" />
						</td>
						<td>
							<input type="text" name="banners[<?php echo esc_attr( $i ); ?>][url]" class="regular-text"
								value="<?php echo esc_attr( $row['url'] ); ?>" />
						</td>
						<td>
							<input type="number" name="banners[<?php echo esc_attr( $i ); ?>][sort]"
								value="<?php echo esc_attr( (string) (int) $row['sort'] ); ?>" min="0" class="small-text" />
						</td>
						<td>
							<input type="checkbox" name="banners[<?php echo esc_attr( $i ); ?>][enabled]" value="1"
								<?php checked( ! empty( $row['enabled'] ) ); ?> />
						</td>
					</tr>
				<?php endforeach; ?>
				</tbody>
			</table>
			<?php submit_button( __( '保存轮播配置', 'sutwx-app-api' ) ); ?>
		</form>
		<?php
	}
}


