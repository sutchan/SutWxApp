<?php
/**
 * SUT微信小程序插件激活测试脚本
 * 用于排查插件激活失败的原因
 */

// 定义WordPress常量
if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', dirname( dirname( __FILE__ ) ) . '/' );
}

// 加载插件主文件
echo "正在加载插件文件...\n";
require_once dirname( __FILE__ ) . '/sut-wechat-mini.php';

echo "插件文件加载成功\n";

echo "\n=== 环境检查 ===\n";
echo "PHP版本: " . phpversion() . " (需要 >= 7.0)\n";

// 检查翻译文件是否存在
echo "\n=== 翻译文件检查 ===\n";
$languages_dir = dirname( __FILE__ ) . '/languages/';
echo "语言目录: " . $languages_dir . "\n";

$mo_files = glob( $languages_dir . '*.mo' );
$po_files = glob( $languages_dir . '*.po' );

if ( empty( $mo_files ) ) {
    echo "警告: 未找到.mo编译翻译文件！这可能是插件激活失败的主要原因。\n";
    echo "请使用msgfmt工具将.po文件编译为.mo文件。\n";
}

if ( ! empty( $po_files ) ) {
    echo "找到以下.po文件: \n";
    foreach ( $po_files as $po_file ) {
        echo "- " . basename( $po_file ) . "\n";
    }
}

// 检查文件权限
echo "\n=== 文件权限检查 ===\n";
$logs_dir = dirname( __FILE__ ) . '/logs/';
if ( ! is_dir( $logs_dir ) ) {
    echo "日志目录不存在，尝试创建...\n";
    if ( wp_mkdir_p( $logs_dir ) ) {
        echo "日志目录创建成功\n";
    } else {
        echo "警告: 无法创建日志目录，可能导致日志功能异常\n";
    }
}

// 检查加载器类
echo "\n=== 插件加载器检查 ===\n";
if ( class_exists( 'SUT_WeChat_Mini_Loader' ) ) {
    echo "加载器类已存在\n";
    try {
        $loader = sut_wechat_mini();
        echo "成功获取插件实例\n";
        echo "插件版本: " . $loader->get_version() . "\n";
        echo "插件是否已配置: " . ( $loader->is_configured() ? '是' : '否' ) . "\n";
    } catch ( Exception $e ) {
        echo "错误: 获取插件实例失败 - " . $e->getMessage() . "\n";
    }
} else {
    echo "错误: 加载器类不存在\n";
}

// 输出调试信息
echo "\n=== 调试信息 ===\n";
if ( function_exists( 'sut_wechat_mini_get_debug_info' ) ) {
    $debug_info = sut_wechat_mini_get_debug_info();
    echo "WordPress版本: " . $debug_info['status']['wp_version'] . "\n";
    echo "SSL状态: " . ( $debug_info['status']['ssl'] ? '已启用' : '未启用' ) . "\n";
    echo "服务器: " . $debug_info['server']['SERVER_SOFTWARE'] . "\n";
    echo "PHP内存限制: " . $debug_info['server']['PHP_MEMORY_LIMIT'] . "\n";
}

if ( empty( $mo_files ) ) {
    echo "\n=== 解决方案建议 ===\n";
    echo "1. 安装gettext工具（包含msgfmt命令）\n";
    echo "2. 运行以下命令编译翻译文件：\n";
    foreach ( $po_files as $po_file ) {
        $mo_file = str_replace( '.po', '.mo', $po_file );
        echo "   msgfmt " . basename( $po_file ) . " -o " . basename( $mo_file ) . "\n";
    }
    echo "3. 如果没有gettext工具，可以使用在线PO到MO转换工具\n";
    echo "4. 编译完成后重试激活插件\n";
}