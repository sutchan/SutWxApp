<?php
/**
 * 缂栬瘧PO鏂囦欢涓篗O鏂囦欢鐨勮剼鏈? * WordPress鎻掍欢蹇呴』鏈塎O鏂囦欢鎵嶈兘鍔犺浇缈昏瘧锛屽惁鍒欎細瀵艰嚧婵€娲诲け璐? */

// 瀹氫箟璇█鐩綍
$languages_dir = dirname( __FILE__ ) . '/languages/';

// 妫€鏌ョ洰褰曟槸鍚﹀瓨鍦?if ( ! is_dir( $languages_dir ) ) {
    die( "閿欒锛氳瑷€鐩綍涓嶅瓨鍦╘n" );
}

// 鑾峰彇鎵€鏈塒O鏂囦欢
$po_files = glob( $languages_dir . '*.po' );

if ( empty( $po_files ) ) {
    die( "閿欒锛氭湭鎵惧埌PO鏂囦欢\n" );
}

// 妫€鏌ユ槸鍚︽湁gettext鎵╁睍
if ( ! function_exists( 'msgfmt_create' ) ) {
    echo "璀﹀憡锛歅HP gettext鎵╁睍鏈畨瑁咃紝鏃犳硶鑷姩缂栬瘧MO鏂囦欢\n";
    echo "\n=== 鎵嬪姩缂栬瘧MO鏂囦欢鎸囧崡 ===\n";
    echo "1. 瀹夎gettext宸ュ叿锛堝寘鍚玬sgfmt鍛戒护锛塡n";
    echo "2. 鎵撳紑鍛戒护琛屽伐鍏凤紝瀵艰埅鍒拌瑷€鐩綍锛歕n";
    echo "   cd " . $languages_dir . "\n";
    echo "3. 杩愯浠ヤ笅鍛戒护缂栬瘧姣忎釜PO鏂囦欢锛歕n";
    
    foreach ( $po_files as $po_file ) {
        $mo_file = str_replace( '.po', '.mo', $po_file );
        echo "   msgfmt " . basename( $po_file ) . " -o " . basename( $mo_file ) . "\n";
    }
    
    echo "\n閲嶈鎻愮ず锛歐ordPress鎻掍欢蹇呴』鏈夊搴旂殑MO鏂囦欢鎵嶈兘姝ｅ父鍔犺浇缈昏瘧鏂囨湰锛孿n";
    echo "鍚﹀垯鍙兘瀵艰嚧鎻掍欢婵€娲诲け璐ユ垨鍔熻兘寮傚父銆傝灏藉揩鍒涘缓缂哄け鐨凪O鏂囦欢銆俓n";
    exit( 1 );
}

// 鑷姩缂栬瘧MO鏂囦欢
$success = true;
echo "寮€濮嬬紪璇慚O鏂囦欢...\n";

foreach ( $po_files as $po_file ) {
    $mo_file = str_replace( '.po', '.mo', $po_file );
    echo "缂栬瘧 " . basename( $po_file ) . " -> " . basename( $mo_file ) . "... ";
    
    try {
        $po = new Gettext\Translations();
        $po->loadFromFile( $po_file );
        $po->toMoFile( $mo_file );
        echo "鎴愬姛\n";
    } catch ( Exception $e ) {
        echo "澶辫触锛? . $e->getMessage() . "\n";
        $success = false;
    }
}

if ( $success ) {
    echo "\n鎵€鏈塎O鏂囦欢缂栬瘧鎴愬姛锛佺幇鍦ㄥ彲浠ュ皾璇曟縺娲绘彃浠朵簡銆俓n";
} else {
    echo "\n閮ㄥ垎MO鏂囦欢缂栬瘧澶辫触锛岃妫€鏌ラ敊璇俊鎭苟鎵嬪姩缂栬瘧銆俓n";
}\n