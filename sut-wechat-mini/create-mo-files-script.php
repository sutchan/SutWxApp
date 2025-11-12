锘??php
/**
 * 缂傛牞鐦O閺傚洣娆㈡稉绡桹閺傚洣娆㈤惃鍕壖閺? * WordPress閹绘帊娆㈣箛鍛淬€忛張濉嶰閺傚洣娆㈤幍宥堝厴閸旂姾娴囩紙鏄忕槯閿涘苯鎯侀崚娆庣窗鐎佃壈鍤у┑鈧ú璇层亼鐠? */

// 鐎规矮绠熺拠顓♀枅閻╊喖缍?$languages_dir = dirname( __FILE__ ) . '/languages/';

// 濡偓閺屻儳娲拌ぐ鏇熸Ц閸氾箑鐡ㄩ崷?if ( ! is_dir( $languages_dir ) ) {
    die( "闁挎瑨顕ら敍姘愁嚔鐟封偓閻╊喖缍嶆稉宥呯摠閸︹晿n" );
}

// 閼惧嘲褰囬幍鈧張濉扥閺傚洣娆?$po_files = glob( $languages_dir . '*.po' );

if ( empty( $po_files ) ) {
    die( "闁挎瑨顕ら敍姘弓閹垫儳鍩孭O閺傚洣娆n" );
}

// 濡偓閺屻儲妲搁崥锔芥箒gettext閹碘晛鐫?if ( ! function_exists( 'msgfmt_create' ) ) {
    echo "鐠€锕€鎲￠敍姝匟P gettext閹碘晛鐫嶉張顏勭暔鐟佸拑绱濋弮鐘崇《閼奉亜濮╃紓鏍槯MO閺傚洣娆n";
    echo "\n=== 閹靛濮╃紓鏍槯MO閺傚洣娆㈤幐鍥у础 ===\n";
    echo "1. 鐎瑰顥奼ettext瀹搞儱鍙块敍鍫濆瘶閸氱幀sgfmt閸涙垝鎶ら敍濉";
    echo "2. 閹垫挸绱戦崨鎴掓姢鐞涘苯浼愰崗鍑ょ礉鐎佃壈鍩呴崚鎷岊嚔鐟封偓閻╊喖缍嶉敍姝昻";
    echo "   cd " . $languages_dir . "\n";
    echo "3. 鏉╂劘顢戞禒銉ょ瑓閸涙垝鎶ょ紓鏍槯濮ｅ繋閲淧O閺傚洣娆㈤敍姝昻";
    
    foreach ( $po_files as $po_file ) {
        $mo_file = str_replace( '.po', '.mo', $po_file );
        echo "   msgfmt " . basename( $po_file ) . " -o " . basename( $mo_file ) . "\n";
    }
    
    echo "\n闁插秷顩﹂幓鎰仛閿涙瓙ordPress閹绘帊娆㈣箛鍛淬€忛張澶婎嚠鎼存梻娈慚O閺傚洣娆㈤幍宥堝厴濮濓絽鐖堕崝鐘烘祰缂堟槒鐦ч弬鍥ㄦ拱閿涘n";
    echo "閸氾箑鍨崣顖濆厴鐎佃壈鍤ч幓鎺嶆濠碘偓濞茶銇戠拹銉﹀灗閸旂喕鍏樺鍌氱埗閵嗗倽顕亸钘夋彥閸掓稑缂撶紓鍝勩亼閻ㄥ嚜O閺傚洣娆㈤妴淇搉";
    exit( 1 );
}

// 閼奉亜濮╃紓鏍槯MO閺傚洣娆?$success = true;
echo "瀵偓婵绱拠鎱歄閺傚洣娆?..\n";

foreach ( $po_files as $po_file ) {
    $mo_file = str_replace( '.po', '.mo', $po_file );
    echo "缂傛牞鐦?" . basename( $po_file ) . " -> " . basename( $mo_file ) . "... ";
    
    try {
        $po = new Gettext\Translations();
        $po->loadFromFile( $po_file );
        $po->toMoFile( $mo_file );
        echo "閹存劕濮沑n";
    } catch ( Exception $e ) {
        echo "婢惰精瑙﹂敍? . $e->getMessage() . "\n";
        $success = false;
    }
}

if ( $success ) {
    echo "\n閹碘偓閺堝O閺傚洣娆㈢紓鏍槯閹存劕濮涢敍浣哄箛閸︺劌褰叉禒銉ョ毦鐠囨洘绺哄ú缁樺絻娴犳湹绨￠妴淇搉";
} else {
    echo "\n闁劌鍨嶮O閺傚洣娆㈢紓鏍槯婢惰精瑙﹂敍宀冾嚞濡偓閺屻儵鏁婄拠顖欎繆閹垰鑻熼幍瀣З缂傛牞鐦ч妴淇搉";
}\n