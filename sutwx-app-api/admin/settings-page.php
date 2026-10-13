<?php
/**
 * 后台「设置 → 小程序设置」页面：主题预设下拉 + 自定义色选择器 + 小程序凭证。
 *
 * @package SutwxAppApi
 * @version 0.4.0
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'Sutwx_Settings' ) ) {
	require_once SUTWX_API_DIR . 'includes/class-settings.php';
}
if ( ! class_exists( 'Sutwx_Credentials' ) ) {
	require_once SUTWX_API_DIR . 'includes/class-credentials.php';
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

		self::maybe_save_credentials();

		$config    = Sutwx_Settings::get_theme_config();
		$preset_id = $config['presetId'];
		$custom    = isset( $config['custom'] ) && is_array( $config['custom'] ) ? $config['custom'] : array();
		$locked    = Sutwx_Credentials::is_locked();
		$app_id    = Sutwx_Credentials::get_app_id();
		$app_secret_masked = Sutwx_Credentials::get_app_secret( true );
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

			<hr />

			<h2><?php echo esc_html__( '微信小程序凭证', 'sutwx-app-api' ); ?></h2>
			<?php if ( $locked ) : ?>
				<div class="notice notice-info inline">
					<p>
						<?php echo esc_html__( '已通过 wp-config.php 常量（SUTWX_WX_APPID / SUTWX_WX_APPSECRET）固定，后台为只读。', 'sutwx-app-api' ); ?>
					</p>
				</div>
			<?php endif; ?>
			<form method="post" action="">
				<?php wp_nonce_field( 'sutwx_creds_save', 'sutwx_creds_nonce' ); ?>
				<table class="form-table">
					<tr>
						<th scope="row">
							<label for="sutwx_app_id"><?php echo esc_html__( 'AppID', 'sutwx-app-api' ); ?></label>
						</th>
						<td>
							<input type="text" name="appId" id="sutwx_app_id" class="regular-text"
								value="<?php echo esc_attr( $app_id ); ?>"
								<?php disabled( $locked ); ?> />
						</td>
					</tr>
					<tr>
						<th scope="row">
							<label for="sutwx_app_secret"><?php echo esc_html__( 'AppSecret', 'sutwx-app-api' ); ?></label>
						</th>
						<td>
							<input type="password" name="appSecret" id="sutwx_app_secret" class="regular-text"
								value="<?php echo esc_attr( $app_secret_masked ); ?>" autocomplete="new-password"
								<?php disabled( $locked ); ?> />
							<p class="description">
								<?php echo esc_html__( '留空或保持脱敏值表示不修改。未配置凭证时 /api/auth/login 将返回 503。', 'sutwx-app-api' ); ?>
							</p>
						</td>
					</tr>
				</table>
				<?php submit_button( __( '保存凭证', 'sutwx-app-api' ) ); ?>
			</form>
		</div>
		<?php
	}

	/**
	 * 处理凭证表单提交（BE-003）。
	 */
	private static function maybe_save_credentials() {
		if ( ! isset( $_POST['sutwx_creds_nonce'] )
			|| ! wp_verify_nonce( wp_unslash( $_POST['sutwx_creds_nonce'] ), 'sutwx_creds_save' ) ) {
			return;
		}

		Sutwx_Credentials::update( self::collect_credentials() );
		echo '<div class="notice notice-success is-dismissible"><p>'
			. esc_html__( '已保存小程序凭证。', 'sutwx-app-api' )
			. '</p></div>';
	}

	/**
	 * 从 $_POST 收集凭证字段。
	 *
	 * @return array
	 */
	private static function collect_credentials() {
		return array(
			'appId'     => isset( $_POST['appId'] ) ? sanitize_text_field( wp_unslash( $_POST['appId'] ) ) : '',
			'appSecret' => isset( $_POST['appSecret'] ) ? sanitize_text_field( wp_unslash( $_POST['appSecret'] ) ) : '',
		);
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
