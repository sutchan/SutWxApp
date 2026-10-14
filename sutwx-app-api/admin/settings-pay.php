<?php
/**
 * 后台设置页「微信支付商户凭证」区块（BE-007，拆自 settings-page.php 以保持单文件精简）。
 *
 * @package SutwxAppApi
 * @version 0.5.0
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'Sutwx_Pay_Credentials' ) ) {
	require_once SUTWX_API_DIR . 'includes/class-pay-credentials.php';
}

/**
 * 支付凭证表单渲染与保存。
 */
class Sutwx_Settings_Pay {

	/**
	 * 处理支付凭证表单提交。
	 */
	public static function maybe_save() {
		if ( ! isset( $_POST['sutwx_pay_nonce'] )
			|| ! wp_verify_nonce( wp_unslash( $_POST['sutwx_pay_nonce'] ), 'sutwx_pay_save' ) ) {
			return;
		}

		if ( self::is_locked() ) {
			return;
		}

		Sutwx_Pay_Credentials::update( self::collect() );
		echo '<div class="notice notice-success is-dismissible"><p>'
			. esc_html__( '已保存微信支付商户凭证。', 'sutwx-app-api' )
			. '</p></div>';
	}

	/**
	 * 渲染支付凭证表单。
	 */
	public static function render() {
		$locked = self::is_locked();
		$option = Sutwx_Pay_Credentials::get_option();
		$mask   = function ( $value ) {
			return Sutwx_Credentials::mask( (string) $value );
		};
		?>
		<h2><?php echo esc_html__( '微信支付商户凭证', 'sutwx-app-api' ); ?></h2>
		<?php if ( $locked ) : ?>
			<div class="notice notice-info inline">
				<p>
					<?php echo esc_html__( '已通过 wp-config.php 常量固定（SUTWX_WX_MCHID / SUTWX_WX_MCH_SERIAL / SUTWX_WX_MCH_KEY / SUTWX_WX_API_V3_KEY），后台为只读。', 'sutwx-app-api' ); ?>
				</p>
			</div>
		<?php endif; ?>
		<form method="post" action="">
			<?php wp_nonce_field( 'sutwx_pay_save', 'sutwx_pay_nonce' ); ?>
			<table class="form-table">
				<tr>
					<th scope="row">
						<label for="sutwx_mch_id"><?php echo esc_html__( '商户号（mchid）', 'sutwx-app-api' ); ?></label>
					</th>
					<td>
						<input type="text" name="mchId" id="sutwx_mch_id" class="regular-text"
							value="<?php echo esc_attr( Sutwx_Pay_Credentials::get_mch_id() ); ?>
							" <?php disabled( $locked ); ?> />
					</td>
				</tr>
				<tr>
					<th scope="row">
						<label for="sutwx_mch_serial"><?php echo esc_html__( 'API 证书序列号', 'sutwx-app-api' ); ?></label>
					</th>
					<td>
						<input type="text" name="serialNo" id="sutwx_mch_serial" class="regular-text"
							value="<?php echo esc_attr( Sutwx_Pay_Credentials::get_serial_no() ); ?>
							" <?php disabled( $locked ); ?> />
						<p class="description">
							<?php echo esc_html__( '商户平台 → 账户中心 → API 安全 → API 证书序列号。', 'sutwx-app-api' ); ?>
						</p>
					</td>
				</tr>
				<tr>
					<th scope="row">
						<label for="sutwx_mch_key"><?php echo esc_html__( '商户 API 私钥（apiclient_key.pem）', 'sutwx-app-api' ); ?></label>
					</th>
					<td>
						<textarea name="privateKey" id="sutwx_mch_key" class="large-text code" rows="4"
							<?php disabled( $locked ); ?>><?php echo esc_textarea( isset( $option['privateKey'] ) ? $mask( $option['privateKey'] ) : '' ); ?></textarea>
						<p class="description">
							<?php echo esc_html__( '粘贴完整 PEM 内容（含 BEGIN/END 行）。保持脱敏值表示不修改。', 'sutwx-app-api' ); ?>
						</p>
					</td>
				</tr>
				<tr>
					<th scope="row">
						<label for="sutwx_api_v3_key"><?php echo esc_html__( 'APIv3 密钥', 'sutwx-app-api' ); ?></label>
					</th>
					<td>
						<input type="password" name="apiV3Key" id="sutwx_api_v3_key" class="regular-text"
							value="<?php echo esc_attr( isset( $option['apiV3Key'] ) ? $mask( $option['apiV3Key'] ) : '' ); ?>"
							autocomplete="new-password" <?php disabled( $locked ); ?> />
						<p class="description">
							<?php echo esc_html__( '32 字节，用于解密回调通知与平台证书。未配置时 /api/pay/* 返回 503。', 'sutwx-app-api' ); ?>
						</p>
					</td>
				</tr>
			</table>
			<?php submit_button( __( '保存支付凭证', 'sutwx-app-api' ) ); ?>
		</form>
		<?php
	}

	/**
	 * 从 $_POST 收集支付凭证字段。
	 *
	 * @return array
	 */
	private static function collect() {
		$raw = array();
		foreach ( array( 'mchId', 'serialNo', 'apiV3Key' ) as $field ) {
			if ( isset( $_POST[ $field ] ) ) {
				$raw[ $field ] = sanitize_text_field( wp_unslash( $_POST[ $field ] ) );
			}
		}
		if ( isset( $_POST['privateKey'] ) ) {
			$raw['privateKey'] = trim( (string) wp_unslash( $_POST['privateKey'] ) );
		}
		return $raw;
	}

	/**
	 * 支付凭证是否被常量锁定。
	 *
	 * @return bool
	 */
	private static function is_locked() {
		return defined( 'SUTWX_WX_MCHID' ) && defined( 'SUTWX_WX_MCH_KEY' );
	}
}
