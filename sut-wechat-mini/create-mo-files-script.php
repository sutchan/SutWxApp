<?php
/**
 * 编译PO文件为MO文件的脚本
 * WordPress插件必须有MO文件才能加载翻译，否则会导致激活失败
 */

// 定义语言目录
$languages_dir = dirname( __FILE__ ) . '/languages/';

// 检查目录是否存在
if ( ! is_dir( $languages_dir ) ) {
    die( "错误：语言目录不存在\n" );
}

// 获取所有PO文件
$po_files = glob( $languages_dir . '*.po' );

if ( empty( $po_files ) ) {
    die( "错误：未找到PO文件\n" );
}

// 检查是否有gettext扩展
if ( ! function_exists( 'msgfmt_create' ) ) {
    echo "警告：PHP gettext扩展未安装，无法自动编译MO文件\n";
    echo "\n=== 手动编译MO文件指南 ===\n";
    echo "1. 安装gettext工具（包含msgfmt命令）\n";
    echo "2. 打开命令行工具，导航到语言目录：\n";
    echo "   cd " . $languages_dir . "\n";
    echo "3. 运行以下命令编译每个PO文件：\n";
    
    foreach ( $po_files as $po_file ) {
        $mo_file = str_replace( '.po', '.mo', $po_file );
        echo "   msgfmt " . basename( $po_file ) . " -o " . basename( $mo_file ) . "\n";
    }
    
    echo "\n重要提示：WordPress插件必须有对应的MO文件才能正常加载翻译文本，\n";
    echo "否则可能导致插件激活失败或功能异常。请尽快创建缺失的MO文件。\n";
    exit( 1 );
}

// 自动编译MO文件
$success = true;
echo "开始编译MO文件...\n";

foreach ( $po_files as $po_file ) {
    $mo_file = str_replace( '.po', '.mo', $po_file );
    echo "编译 " . basename( $po_file ) . " -> " . basename( $mo_file ) . "... ";
    
    try {
        $po = new Gettext\Translations();
        $po->loadFromFile( $po_file );
        $po->toMoFile( $mo_file );
        echo "成功\n";
    } catch ( Exception $e ) {
        echo "失败：" . $e->getMessage() . "\n";
        $success = false;
    }
}

if ( $success ) {
    echo "\n所有MO文件编译成功！现在可以尝试激活插件了。\n";
} else {
    echo "\n部分MO文件编译失败，请检查错误信息并手动编译。\n";
}