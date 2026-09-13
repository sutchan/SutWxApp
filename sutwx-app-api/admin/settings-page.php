<?php
/**
 * 后台「设置 → 小程序设置」页面：主题预设下拉 + 自定义色选择器。
 *
 * @package SutwxAppApi
 * @version 0.3.0
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'Sutwx_Settings' ) ) {
	require_once SUTWX_API_DIR . 'includes/class-settings.php';
}

/**
 * 设置页渲染。
 */
class Sutwx_Settings_Page {

	/**
	 * 渲染页面（处理提交 + 表单）。
	 */
	public static function render() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( '权限不足', 'sutwx-app-api' ) );
		}

		if ( isset( $_POST['sutwx_theme_nonce'] )
			&& wp_verify_nonce( wp_unslash( $_POST['sutwx_theme_nonce'] ), 'sutwx_theme_save' ) ) {
			Sutwx_Settings::update_theme_config( self::collect_post() );
			echo '<div class="notice notice-success is-dismissible"><p>'
				. esc_html__( '已保存主题配置。小程序重启即应用新主题。', 'sutwx-app-api' )
				. '</p></div>';
		}

		$config    = Sutwx_Settings::get_theme_config();
		$preset_id = $config['presetId'];
		$custom    = isset( $config['custom'] ) && is_array( $config['custom'] ) ? $config['custom'] : array();
		?>
		<div class="wrap">
			<h1><?php echo esc_html__( '小程序设置', 'sutwx-app-api' ); ?></h1>
			<form method="post" action="">
				<?php wp_nonce_field( 'sutwx_theme_save', 'sutwx_theme_nonce' ); ?>
				<table class="form-table">
					<tr>
						<th scope="row">
							<label for="sutwx_preset"><?php echo esc_html__( '主题预设', 'sutwx-app-api' ); ?></label>
						</th>
						<td>
							<select name="presetId" id="sutwx_preset">
								<?php foreach ( Sutwx_Settings::THEME_PRESETS as $id => $name ) : ?>
									<option value="<?php echo esc_attr( $id ); ?>" <?php selected( $preset_id, $id ); ?>>
										<?php echo esc_html( $name ); ?>
									</option>
								<?php endforeach; ?>
							</select>
							<p class="description"><?php echo esc_html__( '切换预设后，小程序重启即应用新主题（导航栏 + tabBar + 全站 CSS 变量）。', 'sutwx-app-api' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><?php echo esc_html__( '自定义主题色', 'sutwx-app-api' ); ?></th>
						<td>
							<p class="description"><?php echo esc_html__( '留空表示沿用所选预设的色值；填写后将按字段覆盖预设。仅接受合法十六进制颜色（#RGB / #RRGGBB）。', 'sutwx-app-api' ); ?></p>
							<table>
								<?php foreach ( Sutwx_Settings::THEME_KEYS as $key ) :
									$value = isset( $custom[ $key ] ) ? $custom[ $key ] : ''; ?>
									<tr>
										<td><code><?php echo esc_html( $key ); ?></code></td>
										<td>
											<input type="color" name="custom[<?php echo esc_attr( $key ); ?>]"
												id="sutwx_custom_<?php echo esc_attr( $key ); ?>"
												value="<?php echo esc_attr( $value ); ?>" />
										</td>
									</tr>
								<?php endforeach; ?>
							</table>
						</td>
					</tr>
				</table>
				<?php submit_button( __( '保存主题配置', 'sutwx-app-api' ) ); ?>
			</form>
		</div>
		<?php
	}

	/**
	 * 从 $_POST 收集原始配置（基础净化）。
	 *
	 * @return array
	 */
	private static function collect_post() {
		$raw = array(
			'presetId' => isset( $_POST['presetId'] )
				? sanitize_text_field( wp_unslash( $_POST['presetId'] ) )
				: '',
		);
		if ( isset( $_POST['custom'] ) && is_array( $_POST['custom'] ) ) {
			$raw['custom'] = array_map(
				function ( $v ) {
					return sanitize_text_field( wp_unslash( $v ) );
				},
				$_POST['custom']
			);
		}
		return $raw;
	}
}
