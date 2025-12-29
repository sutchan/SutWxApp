/**
 * 文件名: wechat-miniprogram.d.ts
 * 版本号: 1.0.0
 * 更新日期: 2025-12-29 14:45
 * 描述: 微信小程序TypeScript类型定义文件，提供完整的微信小程序API类型支持
 */

declare namespace wx {
  /**
   * 微信小程序应用实例
   */
  interface AppInstance {
    onLaunch(options: LaunchOptions): void;
    onShow(options: ShowOptions): void;
    onHide(): void;
    onError(msg: string): void;
    onPageNotFound(res: PageNotFoundOptions): void;
    onUnhandledRejection(res: UnhandledRejectionOptions): void;
    globalData: GlobalData;
  }

  /**
   * 全局数据接口
   */
  interface GlobalData {
    userInfo: UserInfo | null;
    token: string | null;
    openid: string | null;
    appId: string;
    baseUrl: string;
    version: string;
    debug: boolean;
  }

  /**
   * 启动参数
   */
  interface LaunchOptions {
    path: string;
    query: Record<string, string>;
    referrerInfo: ReferrerInfo;
    scene: number;
  }

  /**
   * 显示参数
   */
  interface ShowOptions {
    path: string;
    query: Record<string, string>;
    referrerInfo: ReferrerInfo;
    scene: number;
  }

  /**
   * 页面不存在参数
   */
  interface PageNotFoundOptions {
    path: string;
    query: Record<string, string>;
    isEntryPage: boolean;
  }

  /**
   * 未处理Promise拒绝参数
   */
  interface UnhandledRejectionOptions {
    reason: string;
    promise: Promise<unknown>;
  }

  /**
   * 来源信息
   */
  interface ReferrerInfo {
    appId: string;
    extraData: Record<string, unknown>;
  }

  /**
   * 用户信息
   */
  interface UserInfo {
    nickName: string;
    avatarUrl: string;
    gender: number;
    city: string;
    province: string;
    country: string;
    language: string;
  }

  /**
   * 用户Profile信息
   */
  interface UserProfileInfo {
    nickName: string;
    avatarUrl: string;
    gender: number;
    city: string;
    province: string;
    country: string;
    language: string;
  }

  /**
   * 登录响应
   */
  interface LoginRes {
    code: string;
    errMsg: string;
  }

  /**
   * 用户登录凭证
   */
  interface Code2SessionRes {
    openid: string;
    session_key: string;
    unionid: string;
    errcode: number;
    errmsg: string;
  }

  /**
   * 系统信息
   */
  interface SystemInfo {
    brand: string;
    model: string;
    platform: string;
    system: string;
    version: string;
    SDKVersion: string;
    hostname: string;
    fontSizeSetting: number;
    screenWidth: number;
    screenHeight: number;
    windowWidth: number;
    windowHeight: number;
    statusBarHeight: number;
    language: string;
    theme: string;
    safeArea: SafeArea;
    enableDebug: boolean;
    deviceOrientation: string;
  }

  /**
   * 安全区域
   */
  interface SafeArea {
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
  }

  /**
   * 网络请求配置
   */
  interface RequestOptions {
    url: string;
    data?: RequestData;
    header?: Record<string, string>;
    method?: RequestMethod;
    dataType?: string;
    responseType?: string;
    enableHttp2?: boolean;
    enableQuic?: boolean;
    enableCache?: boolean;
    success?: (res: RequestSuccess) => void;
    fail?: (res: RequestFail) => void;
    complete?: (res: RequestComplete) => void;
  }

  /**
   * 请求数据
   */
  type RequestData = string | Record<string, unknown> | ArrayBuffer;

  /**
   * 请求方法
   */
  type RequestMethod =
    | "GET"
    | "HEAD"
    | "POST"
    | "PUT"
    | "DELETE"
    | "CONNECT"
    | "OPTIONS"
    | "TRACE";

  /**
   * 请求成功响应
   */
  interface RequestSuccess {
    data: unknown;
    statusCode: number;
    header: Record<string, string>;
    cookies: string[];
  }

  /**
   * 请求失败响应
   */
  interface RequestFail {
    errMsg: string;
    errCode: number;
  }

  /**
   * 请求完成响应
   */
  interface RequestComplete {
    errMsg: string;
  }

  /**
   * 下载任务配置
   */
  interface DownloadFileOptions {
    url: string;
    header?: Record<string, string>;
    filePath?: string;
    success?: (res: DownloadFileSuccess) => void;
    fail?: (res: DownloadFileFail) => void;
    complete?: (res: DownloadFileComplete) => void;
  }

  /**
   * 下载成功响应
   */
  interface DownloadFileSuccess {
    tempFilePath: string;
    statusCode: number;
  }

  /**
   * 下载失败响应
   */
  interface DownloadFileFail {
    errMsg: string;
  }

  /**
   * 下载完成响应
   */
  interface DownloadFileComplete {
    errMsg: string;
  }

  /**
   * 上传任务配置
   */
  interface UploadFileOptions {
    url: string;
    filePath: string;
    name: string;
    header?: Record<string, string>;
    formData?: Record<string, string>;
    success?: (res: UploadFileSuccess) => void;
    fail?: (res: UploadFileFail) => void;
    complete?: (res: UploadFileComplete) => void;
  }

  /**
   * 上传成功响应
   */
  interface UploadFileSuccess {
    data: string;
    statusCode: number;
  }

  /**
   * 上传失败响应
   */
  interface UploadFileFail {
    errMsg: string;
  }

  /**
   * 上传完成响应
   */
  interface UploadFileComplete {
    errMsg: string;
  }

  /**
   * WebSocket连接配置
   */
  interface ConnectSocketOptions {
    url: string;
    header?: Record<string, string>;
    method?: RequestMethod;
    protocols?: string[];
    success?: () => void;
    fail?: (res: ConnectSocketFail) => void;
    complete?: () => void;
  }

  /**
   * WebSocket连接失败响应
   */
  interface ConnectSocketFail {
    errMsg: string;
  }

  /**
   * 消息通道配置
   */
  interface MessageChannelOptions {
    success?: () => void;
    fail?: () => void;
  }

  /**
   * 支付参数
   */
  interface RequestPaymentOptions {
    timeStamp: string;
    nonceStr: string;
    package: string;
    signType: "MD5" | "HMAC-SHA256";
    paySign: string;
    success?: (res: RequestPaymentSuccess) => void;
    fail?: (res: RequestPaymentFail) => void;
    complete?: (res: RequestPaymentComplete) => void;
  }

  /**
   * 支付成功响应
   */
  interface RequestPaymentSuccess {
    errMsg: string;
  }

  /**
   * 支付失败响应
   */
  interface RequestPaymentFail {
    errMsg: string;
  }

  /**
   * 支付完成响应
   */
  interface RequestPaymentComplete {
    errMsg: string;
  }

  /**
   * 订阅消息参数
   */
  interface RequestSubscribeMessageOptions {
    tmplIds: string[];
    success?: (res: RequestSubscribeMessageSuccess) => void;
    fail?: (res: RequestSubscribeMessageFail) => void;
    complete?: (res: RequestSubscribeMessageComplete) => void;
  }

  /**
   * 订阅消息成功响应
   */
  interface RequestSubscribeMessageSuccess {
    errMsg: string;
    [key: string]: string;
  }

  /**
   * 订阅消息失败响应
   */
  interface RequestSubscribeMessageFail {
    errMsg: string;
  }

  /**
   * 订阅消息完成响应
   */
  interface RequestSubscribeMessageComplete {
    errMsg: string;
  }

  /**
   * 授权设置
   */
  interface AuthSetting {
    "scope.userInfo": boolean;
    "scope.userLocation": boolean;
    "scope.address": boolean;
    "scope.invoiceTitle": boolean;
    "scope.werun": boolean;
    "scope.record": boolean;
    "scope.camera": boolean;
  }

  /**
   * 地理位置配置
   */
  interface GetLocationOptions {
    type?: "wgs84" | "gcj02";
    altitude?: boolean;
    success: (res: GetLocationSuccess) => void;
    fail?: (res: GetLocationFail) => void;
    complete?: (res: GetLocationComplete) => void;
  }

  /**
   * 获取位置成功响应
   */
  interface GetLocationSuccess {
    latitude: number;
    longitude: number;
    speed: number;
    accuracy: number;
    altitude: number;
    verticalAccuracy: number;
    horizontalAccuracy: number;
  }

  /**
   * 获取位置失败响应
   */
  interface GetLocationFail {
    errMsg: string;
  }

  /**
   * 获取位置完成响应
   */
  interface GetLocationComplete {
    errMsg: string;
  }

  /**
   * 扫码配置
   */
  interface ScanCodeOptions {
    onlyFromCamera?: boolean;
    scanType?: string[];
    success: (res: ScanCodeSuccess) => void;
    fail?: (res: ScanCodeFail) => void;
    complete?: (res: ScanCodeComplete) => void;
  }

  /**
   * 扫码成功响应
   */
  interface ScanCodeSuccess {
    result: string;
    charSet: string;
    path: string;
    scanType: string;
  }

  /**
   * 扫码失败响应
   */
  interface ScanCodeFail {
    errMsg: string;
  }

  /**
   * 扫码完成响应
   */
  interface ScanCodeComplete {
    errMsg: string;
  }

  /**
   * 图片配置
   */
  interface ChooseImageOptions {
    count?: number;
    sizeType?: ("original" | "compressed")[];
    sourceType?: ("album" | "camera")[];
    success: (res: ChooseImageSuccess) => void;
    fail?: (res: ChooseImageFail) => void;
    complete?: (res: ChooseImageComplete) => void;
  }

  /**
   * 选择图片成功响应
   */
  interface ChooseImageSuccess {
    tempFilePaths: string[];
    tempFiles: TempFile[];
  }

  /**
   * 临时文件
   */
  interface TempFile {
    path: string;
    size: number;
  }

  /**
   * 选择图片失败响应
   */
  interface ChooseImageFail {
    errMsg: string;
  }

  /**
   * 选择图片完成响应
   */
  interface ChooseImageComplete {
    errMsg: string;
  }

  /**
   * 预览图片配置
   */
  interface PreviewImageOptions {
    current?: string | number;
    urls: string[];
    success?: () => void;
    fail?: (res: PreviewImageFail) => void;
    complete?: () => void;
  }

  /**
   * 预览图片失败响应
   */
  interface PreviewImageFail {
    errMsg: string;
  }

  /**
   * 获取图片信息配置
   */
  interface GetImageInfoOptions {
    src: string;
    success?: (res: GetImageInfoSuccess) => void;
    fail?: (res: GetImageInfoFail) => void;
    complete?: (res: GetImageInfoComplete) => void;
  }

  /**
   * 获取图片信息成功响应
   */
  interface GetImageInfoSuccess {
    width: number;
    height: number;
    path: string;
    orientation: string;
    type: string;
  }

  /**
   * 获取图片信息失败响应
   */
  interface GetImageInfoFail {
    errMsg: string;
  }

  /**
   * 获取图片信息完成响应
   */
  interface GetImageInfoComplete {
    errMsg: string;
  }

  /**
   * 保存图片到相册配置
   */
  interface SaveImageToPhotosAlbumOptions {
    filePath: string;
    success?: () => void;
    fail?: (res: SaveImageToPhotosAlbumFail) => void;
    complete?: () => void;
  }

  /**
   * 保存图片到相册失败响应
   */
  interface SaveImageToPhotosAlbumFail {
    errMsg: string;
  }

  /**
   * 录音配置
   */
  interface StartRecordOptions {
    duration?: number;
    sampleRate?: number;
    numberOfChannels?: number;
    encodeBitRate?: number;
    format?: "mp3" | "aac" | "wav" | "PCM";
    success?: (res: StartRecordSuccess) => void;
    fail?: (res: StartRecordFail) => void;
    complete?: (res: StartRecordComplete) => void;
  }

  /**
   * 录音开始成功响应
   */
  interface StartRecordSuccess {
    tempFilePath: string;
  }

  /**
   * 录音开始失败响应
   */
  interface StartRecordFail {
    errMsg: string;
  }

  /**
   * 录音开始完成响应
   */
  interface StartRecordComplete {
    errMsg: string;
  }

  /**
   * 停止录音配置
   */
  interface StopRecordOptions {
    success?: (res: StopRecordSuccess) => void;
    fail?: (res: StopRecordFail) => void;
    complete?: (res: StopRecordComplete) => void;
  }

  /**
   * 停止录音成功响应
   */
  interface StopRecordSuccess {
    tempFilePath: string;
  }

  /**
   * 停止录音失败响应
   */
  interface StopRecordFail {
    errMsg: string;
  }

  /**
   * 停止录音完成响应
   */
  interface StopRecordComplete {
    errMsg: string;
  }

  /**
   * 音频播放配置
   */
  interface AudioContextOptions {
    src: string;
    loop?: boolean;
    autoplay?: boolean;
    obeyMuteSwitch?: boolean;
    startTime?: number;
  }

  /**
   * 视频配置
   */
  interface CreateVideoOptions {
    url: string;
    styles?: VideoStyle;
    success?: (res: CreateVideoSuccess) => void;
    fail?: (res: CreateVideoFail) => void;
    complete?: (res: CreateVideoComplete) => void;
  }

  /**
   * 视频样式
   */
  interface VideoStyle {
    left?: string;
    top?: string;
    width?: string;
    height?: string;
    position?: "absolute" | "fixed";
  }

  /**
   * 创建视频成功响应
   */
  interface CreateVideoSuccess {
    type: string;
  }

  /**
   * 创建视频失败响应
   */
  interface CreateVideoFail {
    errMsg: string;
  }

  /**
   * 创建视频完成响应
   */
  interface CreateVideoComplete {
    errMsg: string;
  }

  /**
   * 视频组件上下文
   */
  interface VideoContext {
    play: () => void;
    pause: () => void;
    stop: () => void;
    seek: (position: number) => void;
    sendDanmu: (danmu: DanmuData) => void;
  }

  /**
   * 弹幕数据
   */
  interface DanmuData {
    text: string;
    color?: string;
  }

  /**
   * 拍摄视频配置
   */
  interface ChooseVideoOptions {
    compressed?: boolean;
    maxDuration?: number;
    camera?: "back" | "front";
    sourceType?: ("album" | "camera")[];
    success: (res: ChooseVideoSuccess) => void;
    fail?: (res: ChooseVideoFail) => void;
    complete?: (res: ChooseVideoComplete) => void;
  }

  /**
   * 选择视频成功响应
   */
  interface ChooseVideoSuccess {
    tempFilePath: string;
    duration: number;
    size: number;
    height: number;
    width: number;
  }

  /**
   * 选择视频失败响应
   */
  interface ChooseVideoFail {
    errMsg: string;
  }

  /**
   * 选择视频完成响应
   */
  interface ChooseVideoComplete {
    errMsg: string;
  }

  /**
   * 封面图配置
   */
  interface SaveVideoToPhotosAlbumOptions {
    filePath: string;
    success?: () => void;
    fail?: (res: SaveVideoToPhotosAlbumFail) => void;
    complete?: () => void;
  }

  /**
   * 保存视频到相册失败响应
   */
  interface SaveVideoToPhotosAlbumFail {
    errMsg: string;
  }

  /**
   * 背景音频播放配置
   */
  interface GetBackgroundAudioManagerOptions {
    src?: string;
    title?: string;
    epname?: string;
    singer?: string;
    coverImgUrl?: string;
    startTime?: number;
    protocol?: string;
  }

  /**
   * 背景音频管理器
   */
  interface BackgroundAudioManager {
    src: string;
    startTime: number;
    title: string;
    epname: string;
    singer: string;
    coverImgUrl: string;
    protocol: string;
    play: () => void;
    pause: () => void;
    stop: () => void;
    seek: (position: number) => void;
    onCanplay: (callback: () => void) => void;
    onPlay: (callback: () => void) => void;
    onPause: (callback: () => void) => void;
    onStop: (callback: () => void) => void;
    onEnded: (callback: () => void) => void;
    onTimeUpdate: (callback: () => void) => void;
    onPrev: (callback: () => void) => void;
    onNext: (callback: () => void) => void;
    onError: (callback: (err: string) => void) => void;
    onWaiting: (callback: () => void) => void;
  }

  /**
   * 音频组件上下文
   */
  interface AudioContext {
    setSrc: (src: string) => void;
    play: () => void;
    pause: () => void;
    stop: () => void;
    seek: (position: number) => void;
  }

  /**
   * 相机组件上下文
   */
  interface CameraContext {
    takePhoto: (opts: {
      quality: "high" | "normal" | "low";
      success: (res: { tempImagePath: string }) => void;
    }) => void;
    startRecord: (opts: { success?: () => void; fail?: () => void }) => void;
    stopRecord: (opts: {
      success?: (res: { tempVideoPath: string }) => void;
      fail?: () => void;
    }) => void;
  }

  /**
   * 实时音视频通话配置
   */
  interface CreateLivePusherContextOptions {
    url: string;
    mode: "RTC" | "live";
    autopush?: boolean;
    enableCamera?: boolean;
    autoFocus?: boolean;
    orientation: "vertical" | "horizontal";
    beauty: number;
    whiteness: number;
    aspect: "4:3" | "16:9";
    zoom: boolean;
    devicePosition: "front" | "back";
    minBitrate: number;
    maxBitrate: number;
    audioVolumeType: "voicecall" | "media";
    audioReverbType: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
    success?: () => void;
    fail?: () => void;
    complete?: () => void;
  }

  /**
   * 实时音视频回推配置
   */
  interface CreateLivePlayerContextOptions {
    url: string;
    mode: "live" | "RTC";
    autoplay?: boolean;
    muted?: boolean;
    orientation: "vertical" | "horizontal";
    minBitrate: number;
    maxBitrate: number;
    audioVolumeType: "voicecall" | "media";
    audioReverbType: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
    success?: () => void;
    fail?: () => void;
    complete?: () => void;
  }

  /**
   * 联系人配置
   */
  interface AddPhoneContactOptions {
    firstName: string;
    lastName?: string;
    mobilePhoneNumber?: string;
    workPhoneNumber?: string;
    hostPhoneNumber?: string;
    email?: string;
    organization?: string;
    title?: string;
    workAddress?: string;
    workAddressCity?: string;
    homeAddress?: string;
    homeAddressCity?: string;
    homeFaxNumber?: string;
    workFaxNumber?: string;
    homePhoneNumber?: string;
    success?: () => void;
    fail?: () => void;
    complete?: () => void;
  }

  /**
   * 客服消息配置
   */
  interface SendCustomerServiceMessageOptions {
    msgType: "text" | "image" | "card";
    text?: { content: string };
    image?: { mediaId: string };
    card?: {
      cardId: string;
      title: string;
      description?: string;
      url?: string;
      thumbUrl?: string;
    };
  }

  /**
   * 客服消息内容
   */
  interface CustomerServiceMessageContent {
    type:
      | "text"
      | "image"
      | "video"
      | "voice"
      | "news"
      | "music"
      | "link"
      | "miniprogrampage";
    content?: string;
    picUrl?: string;
    mediaId?: string;
    title?: string;
    description?: string;
    url?: string;
    thumbUrl?: string;
    pagepath?: string;
  }

  /**
   * 广告组件配置
   */
  interface AdRewardedVideoAd {
    load: () => Promise<void>;
    show: () => Promise<void>;
    offClose: (callback: () => void) => void;
    onClose: (callback: (res: { isEnded: boolean }) => void) => void;
    onError: (callback: (err: { errMsg: string }) => void) => void;
    destroy: () => void;
  }

  /**
   * 会员卡配置
   */
  interface AddCardOptions {
    cardList: CardInfo[];
    success?: (res: AddCardSuccess) => void;
    fail?: (res: AddCardFail) => void;
    complete?: (res: AddCardComplete) => void;
  }

  /**
   * 会员卡信息
   */
  interface CardInfo {
    cardId: string;
    cardExt: string;
  }

  /**
   * 会员卡成功响应
   */
  interface AddCardSuccess {
    cardList: CardResult[];
  }

  /**
   * 会员卡结果
   */
  interface CardResult {
    code: string;
    cardId: string;
    isSuccess: boolean;
  }

  /**
   * 会员卡失败响应
   */
  interface AddCardFail {
    errMsg: string;
  }

  /**
   * 会员卡完成响应
   */
  interface AddCardComplete {
    errMsg: string;
  }

  /**
   * 卡券详情配置
   */
  interface OpenCardOptions {
    cardList: OpenCardInfo[];
    success?: () => void;
    fail?: (res: OpenCardFail) => void;
    complete?: () => void;
  }

  /**
   * 卡券信息
   */
  interface OpenCardInfo {
    cardId: string;
    code: string;
  }

  /**
   * 打开卡券失败响应
   */
  interface OpenCardFail {
    errMsg: string;
  }

  /**
   * 发票配置
   */
  interface ChooseInvoiceOptions {
    success: (res: ChooseInvoiceSuccess) => void;
    fail?: (res: ChooseInvoiceFail) => void;
    complete?: (res: ChooseInvoiceComplete) => void;
  }

  /**
   * 选择发票成功响应
   */
  interface ChooseInvoiceSuccess {
    invoiceInfo: InvoiceInfo;
  }

  /**
   * 发票信息
   */
  interface InvoiceInfo {
    title: string;
    phone: string;
    amount: string;
    billingTime: string;
    billingNo: string;
    billingCode: string;
    info: string;
  }

  /**
   * 选择发票失败响应
   */
  interface ChooseInvoiceFail {
    errMsg: string;
  }

  /**
   * 选择发票完成响应
   */
  interface ChooseInvoiceComplete {
    errMsg: string;
  }

  /**
   * 支付商户配置
   */
  interface RequestMerchantPaymentOptions {
    timestamp: string;
    nonceStr: string;
    package: string;
    signType: "MD5" | "HMAC-SHA256";
    paySign: string;
    success?: (res: RequestMerchantPaymentSuccess) => void;
    fail?: (res: RequestMerchantPaymentFail) => void;
    complete?: (res: RequestMerchantPaymentComplete) => void;
  }

  /**
   * 支付商户成功响应
   */
  interface RequestMerchantPaymentSuccess {
    errMsg: string;
  }

  /**
   * 支付商户失败响应
   */
  interface RequestMerchantPaymentFail {
    errMsg: string;
  }

  /**
   * 支付商户完成响应
   */
  interface RequestMerchantPaymentComplete {
    errMsg: string;
  }

  /**
   * 生物认证配置
   */
  interface CheckIsSupportSoterOptions {
    success: (res: CheckIsSupportSoterSuccess) => void;
    fail?: (res: CheckIsSupportSoterFail) => void;
    complete?: (res: CheckIsSupportSoterComplete) => void;
  }

  /**
   * 检查生物认证支持成功响应
   */
  interface CheckIsSupportSoterSuccess {
    supportMode: ("fingerPrint" | "facial" | "speech")[];
  }

  /**
   * 检查生物认证支持失败响应
   */
  interface CheckIsSupportSoterFail {
    errMsg: string;
  }

  /**
   * 检查生物认证支持完成响应
   */
  interface CheckIsSupportSoterComplete {
    errMsg: string;
  }

  /**
   * 启动生物认证配置
   */
  interface StartSoterAuthenticationOptions {
    challenge: string;
    authMode: "fingerPrint" | "facial" | "speech";
    success?: (res: StartSoterAuthenticationSuccess) => void;
    fail?: (res: StartSoterAuthenticationFail) => void;
    complete?: (res: StartSoterAuthenticationComplete) => void;
  }

  /**
   * 启动生物认证成功响应
   */
  interface StartSoterAuthenticationSuccess {
    errMsg: string;
    authMode: string;
    resultJSON: string;
    resultJSONSignature: string;
  }

  /**
   * 启动生物认证失败响应
   */
  interface StartSoterAuthenticationFail {
    errMsg: string;
  }

  /**
   * 启动生物认证完成响应
   */
  interface StartSoterAuthenticationComplete {
    errMsg: string;
  }

  /**
   * 隐私协议配置
   */
  interface RequirePrivacyAuthorizeOptions {
    success?: () => void;
    fail?: () => void;
    complete?: () => void;
  }

  /**
   * 微信支付参数
   */
  interface TradePayOptions {
    timeStamp: string;
    nonceStr: string;
    package: string;
    signType: "MD5" | "HMAC-SHA256";
    paySign: string;
    success?: (res: TradePaySuccess) => void;
    fail?: (res: TradePayFail) => void;
    complete?: (res: TradePayComplete) => void;
  }

  /**
   * 微信支付成功响应
   */
  interface TradePaySuccess {
    errMsg: string;
  }

  /**
   * 微信支付失败响应
   */
  interface TradePayFail {
    errMsg: string;
  }

  /**
   * 微信支付完成响应
   */
  interface TradePayComplete {
    errMsg: string;
  }

  /**
   * 虚拟支付配置
   */
  interface RequestVirtualPaymentOptions {
    amount: number;
    signType: "HMAC-SHA256";
    sign: string;
    success?: (res: RequestVirtualPaymentSuccess) => void;
    fail?: (res: RequestVirtualPaymentFail) => void;
    complete?: (res: RequestVirtualPaymentComplete) => void;
  }

  /**
   * 虚拟支付成功响应
   */
  interface RequestVirtualPaymentSuccess {
    errMsg: string;
    paymentResult: string;
  }

  /**
   * 虚拟支付失败响应
   */
  interface RequestVirtualPaymentFail {
    errMsg: string;
  }

  /**
   * 虚拟支付完成响应
   */
  interface RequestVirtualPaymentComplete {
    errMsg: string;
  }

  /**
   * 数据上报配置
   */
  interface ReportAnalyticsOptions {
    eventName: string;
    data: Record<string, unknown>;
  }

  /**
   * 启动小程序配置
   */
  interface NavigateToMiniProgramOptions {
    appId: string;
    path?: string;
    extraData?: Record<string, unknown>;
    envVersion?: "develop" | "trial" | "release";
    success?: (res: NavigateToMiniProgramSuccess) => void;
    fail?: (res: NavigateToMiniProgramFail) => void;
    complete?: (res: NavigateToMiniProgramComplete) => void;
  }

  /**
   * 启动小程序成功响应
   */
  interface NavigateToMiniProgramSuccess {
    errMsg: string;
  }

  /**
   * 启动小程序失败响应
   */
  interface NavigateToMiniProgramFail {
    errMsg: string;
  }

  /**
   * 启动小程序完成响应
   */
  interface NavigateToMiniProgramComplete {
    errMsg: string;
  }

  /**
   * 返回小程序配置
   */
  interface NavigateBackMiniProgramOptions {
    extraData?: Record<string, unknown>;
    success?: () => void;
    fail?: () => void;
    complete?: () => void;
  }

  /**
   * 退出小程序配置
   */
  interface ExitMiniProgramOptions {
    success?: () => void;
    fail?: () => void;
    complete?: () => void;
  }

  /**
   * 登录配置
   */
  interface LoginOptions {
    timeout?: number;
    success: (res: LoginSuccess) => void;
    fail?: (res: LoginFail) => void;
    complete?: (res: LoginComplete) => void;
  }

  /**
   * 登录成功响应
   */
  interface LoginSuccess {
    code: string;
    errMsg: string;
  }

  /**
   * 登录失败响应
   */
  interface LoginFail {
    errMsg: string;
  }

  /**
   * 登录完成响应
   */
  interface LoginComplete {
    errMsg: string;
  }

  /**
   * 检查登录状态配置
   */
  interface CheckSessionOptions {
    success?: () => void;
    fail?: (res: CheckSessionFail) => void;
    complete?: (res: CheckSessionComplete) => void;
  }

  /**
   * 检查登录状态失败响应
   */
  interface CheckSessionFail {
    errMsg: string;
  }

  /**
   * 检查登录状态完成响应
   */
  interface CheckSessionComplete {
    errMsg: string;
  }

  /**
   * 获取用户信息配置
   */
  interface GetUserProfileOptions {
    desc: string;
    lang?: "en" | "zh_CN" | "zh_TW";
    success: (res: GetUserProfileSuccess) => void;
    fail?: (res: GetUserProfileFail) => void;
    complete?: (res: GetUserProfileComplete) => void;
  }

  /**
   * 获取用户信息成功响应
   */
  interface GetUserProfileSuccess {
    userInfo: UserProfileInfo;
    rawData: string;
    signature: string;
    encryptedData: string;
    iv: string;
  }

  /**
   * 获取用户信息失败响应
   */
  interface GetUserProfileFail {
    errMsg: string;
  }

  /**
   * 获取用户信息完成响应
   */
  interface GetUserProfileComplete {
    errMsg: string;
  }

  /**
   * 获取授权配置
   */
  interface GetSettingOptions {
    withSubscriptions?: boolean;
    success: (res: GetSettingSuccess) => void;
    fail?: (res: GetSettingFail) => void;
    complete?: (res: GetSettingComplete) => void;
  }

  /**
   * 获取授权配置成功响应
   */
  interface GetSettingSuccess {
    authSetting: AuthSetting;
    subscriptionsSetting: SubscriptionsSetting;
  }

  /**
   * 订阅配置
   */
  interface SubscriptionsSetting {
    mainSwitch: boolean;
    itemSettings: Record<string, number>;
  }

  /**
   * 获取授权配置失败响应
   */
  interface GetSettingFail {
    errMsg: string;
  }

  /**
   * 获取授权配置完成响应
   */
  interface GetSettingComplete {
    errMsg: string;
  }

  /**
   * 打开授权设置页配置
   */
  interface OpenSettingOptions {
    success?: (res: OpenSettingSuccess) => void;
    fail?: (res: OpenSettingFail) => void;
    complete?: (res: OpenSettingComplete) => void;
  }

  /**
   * 打开授权设置页成功响应
   */
  interface OpenSettingSuccess {
    authSetting: AuthSetting;
  }

  /**
   * 打开授权设置页失败响应
   */
  interface OpenSettingFail {
    errMsg: string;
  }

  /**
   * 打开授权设置页完成响应
   */
  interface OpenSettingComplete {
    errMsg: string;
  }

  /**
   * 获取开放数据域
   */
  interface GetOpenDataContextOptions {
    type: "worker";
    success: (res: GetOpenDataContextSuccess) => void;
    fail?: (res: GetOpenDataContextFail) => void;
    complete?: (res: GetOpenDataContextComplete) => void;
  }

  /**
   * 获取开放数据域成功响应
   */
  interface GetOpenDataContextSuccess {
    openDataContext: OpenDataContext;
  }

  /**
   * 开放数据域
   */
  interface OpenDataContext {
    worker: Worker;
  }

  /**
   * 工作线程
   */
  interface Worker {
    postMessage: (message: unknown) => void;
    onMessage: (callback: (message: unknown) => void) => void;
    terminate: () => void;
  }

  /**
   * 获取加速计数据配置
   */
  interface StartAccelerometerOptions {
    interval?: "game" | "ui" | "normal";
    success?: () => void;
    fail?: (res: StartAccelerometerFail) => void;
    complete?: (res: StartAccelerometerComplete) => void;
  }

  /**
   * 启动加速计失败响应
   */
  interface StartAccelerometerFail {
    errMsg: string;
  }

  /**
   * 启动加速计完成响应
   */
  interface StartAccelerometerComplete {
    errMsg: string;
  }

  /**
   * 获取罗盘数据配置
   */
  interface StartCompassOptions {
    success?: () => void;
    fail?: (res: StartCompassFail) => void;
    complete?: (res: StartCompassComplete) => void;
  }

  /**
   * 启动罗盘失败响应
   */
  interface StartCompassFail {
    errMsg: string;
  }

  /**
   * 启动罗盘完成响应
   */
  interface StartCompassComplete {
    errMsg: string;
  }

  /**
   * 获取设备方向配置
   */
  interface StartDeviceMotionListeningOptions {
    interval?: "game" | "ui" | "normal";
    success?: () => void;
    fail?: (res: StartDeviceMotionListeningFail) => void;
    complete?: (res: StartDeviceMotionListeningComplete) => void;
  }

  /**
   * 启动设备方向监听失败响应
   */
  interface StartDeviceMotionListeningFail {
    errMsg: string;
  }

  /**
   * 启动设备方向监听完成响应
   */
  interface StartDeviceMotionListeningComplete {
    errMsg: string;
  }

  /**
   * 获取陀螺仪数据配置
   */
  interface StartGyroscopeOptions {
    interval?: "game" | "ui" | "normal";
    success?: () => void;
    fail?: (res: StartGyroscopeFail) => void;
    complete?: (res: StartGyroscopeComplete) => void;
  }

  /**
   * 启动陀螺仪失败响应
   */
  interface StartGyroscopeFail {
    errMsg: string;
  }

  /**
   * 启动陀螺仪完成响应
   */
  interface StartGyroscopeComplete {
    errMsg: string;
  }

  /**
   * 性能监控配置
   */
  interface PerformanceMonitorOptions {
    onPerformanceTick: (res: PerformanceData) => void;
  }

  /**
   * 性能数据
   */
  interface PerformanceData {
    entryType: string;
    name: string;
    startTime: number;
    duration: number;
    navigationStart: number;
    redirectStart: number;
    redirectEnd: number;
    fetchStart: number;
    domainLookupStart: number;
    domainLookupEnd: number;
    connectStart: number;
    secureConnectionStart: number;
    connectEnd: number;
    requestStart: number;
    responseStart: number;
    responseEnd: number;
    domContentLoadedCost: number;
    domContentLoaded: number;
    loadCost: number;
    firstScreenCost: number;
  }

  /**
   * 微信小程序全局API
   */
  const app: AppInstance;
  function getApp(): AppInstance;
  function getCurrentPages(): PageInstance[];
  function getAppProxy(): unknown;

  /**
   * 生命周期函数
   */
  function onLaunch(callback: (options: LaunchOptions) => void): void;
  function onShow(callback: (options: ShowOptions) => void): void;
  function onHide(callback: () => void): void;
  function onError(callback: (msg: string) => void): void;
  function onPageNotFound(callback: (res: PageNotFoundOptions) => void): void;
  function onUnhandledRejection(
    callback: (res: UnhandledRejectionOptions) => void,
  ): void;

  /**
   * 路由功能
   */
  function navigateTo(options: NavigateToOptions): void;
  function redirectTo(options: RedirectToOptions): void;
  function reLaunch(options: ReLaunchOptions): void;
  function switchTab(options: SwitchTabOptions): void;
  function navigateBack(options?: NavigateBackOptions): void;

  /**
   * 跳转参数
   */
  interface NavigateToOptions {
    url: string;
    events?: Record<string, (res: unknown) => void>;
    success?: () => void;
    fail?: (res: NavigateToFail) => void;
    complete?: () => void;
  }

  interface NavigateToFail {
    errMsg: string;
  }

  interface RedirectToOptions {
    url: string;
    success?: () => void;
    fail?: (res: RedirectToFail) => void;
    complete?: () => void;
  }

  interface RedirectToFail {
    errMsg: string;
  }

  interface ReLaunchOptions {
    url: string;
    success?: () => void;
    fail?: (res: ReLaunchFail) => void;
    complete?: () => void;
  }

  interface ReLaunchFail {
    errMsg: string;
  }

  interface SwitchTabOptions {
    url: string;
    success?: () => void;
    fail?: (res: SwitchTabFail) => void;
    complete?: () => void;
  }

  interface SwitchTabFail {
    errMsg: string;
  }

  interface NavigateBackOptions {
    delta?: number;
  }

  /**
   * 动画功能
   */
  function createAnimation(options: AnimationOptions): Animation;

  interface AnimationOptions {
    duration?: number;
    timingFunction?: string;
    delay?: number;
    transformOrigin?: string;
  }

  interface Animation {
    export: () => unknown;
    step: (options: AnimationStepOptions) => Animation;
    opacity: (value: number) => Animation;
    backgroundColor: (value: string) => Animation;
    width: (value: string) => Animation;
    height: (value: string) => Animation;
    top: (value: string) => Animation;
    left: (value: string) => Animation;
    bottom: (value: string) => Animation;
    right: (value: string) => Animation;
    rotate: (value: number) => Animation;
    rotateX: (value: number) => Animation;
    rotateY: (value: number) => Animation;
    rotateZ: (value: number) => Animation;
    scale: (value: number) => Animation;
    scaleX: (value: number) => Animation;
    scaleY: (value: number) => Animation;
    translateX: (value: number) => Animation;
    translateY: (value: number) => Animation;
    skewX: (value: number) => Animation;
    skewY: (value: number) => Animation;
  }

  interface AnimationStepOptions {
    duration?: number;
    timingFunction?: string;
    delay?: number;
    transformOrigin?: string;
  }

  /**
   * 节点查询
   */
  function createSelectorQuery(): SelectorQuery;

  interface SelectorQuery {
    select: (selector: string) => Node;
    selectAll: (selector: string) => NodeList;
    selectViewport: () => Node;
    in: (component: ComponentInstance) => SelectorQuery;
    exec: (callback?: (res: unknown[]) => void) => void;
  }

  interface Node {
    boundingClientRect: (
      callback?: (rect: BoundingClientRect) => void,
    ) => SelectorQuery;
    scrolling: (callback?: (res: Scrolling) => void) => SelectorQuery;
    context: (callback?: (res: NodeContext) => void) => SelectorQuery;
    node: (callback?: (res: Node) => void) => SelectorQuery;
  }

  interface NodeList {
    boundingClientRect: (
      callback?: (res: BoundingClientRect[]) => void,
    ) => SelectorQuery;
    scrolling: (callback?: (res: Scrolling[]) => void) => SelectorQuery;
    context: (callback?: (res: NodeContext[]) => void) => SelectorQuery;
    node: (callback?: (res: Node[]) => void) => SelectorQuery;
  }

  interface BoundingClientRect {
    id: string;
    dataset: Record<string, string>;
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
  }

  interface Scrolling {
    id: string;
    dataset: Record<string, string>;
    scrollLeft: number;
    scrollTop: number;
    scrollWidth: number;
    scrollHeight: number;
  }

  interface NodeContext {
    id: string;
    dataset: Record<string, string>;
    context: CanvasRenderingContext | WebGLRenderingContext;
  }

  interface Node {
    id: string;
    dataset: Record<string, string>;
    node: unknown;
  }

  /**
   * 节点布局相交
   */
  function createIntersectionObserver(
    component: ComponentInstance,
    options?: IntersectionObserverOptions,
  ): IntersectionObserver;

  interface IntersectionObserverOptions {
    thresholds?: number[];
    initialRatio?: number;
    observeAll?: boolean;
  }

  interface IntersectionObserver {
    relativeTo: (selector: string, margins?: Margins) => IntersectionObserver;
    relativeToViewport: (margins?: Margins) => IntersectionObserver;
    observe: (callback: (res: IntersectionObserverObserve) => void) => void;
    disconnect: () => void;
  }

  interface Margins {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  }

  interface IntersectionObserverObserve {
    id: string;
    dataset: Record<string, string>;
    intersectionRatio: number;
    intersectionRect: IntersectionRect;
    boundingClientRect: BoundingClientRect;
    relativeRect: RelativeRect;
    time: number;
  }

  interface IntersectionRect {
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
  }

  interface RelativeRect {
    left: number;
    right: number;
    top: number;
    bottom: number;
  }

  /**
   * 画布
   */
  function createCanvasContext(
    canvasId: string,
    component?: ComponentInstance,
  ): CanvasContext;
  function createSelectorQuery(): SelectorQuery;

  interface CanvasContext {
    fillRect: (
      x: number,
      y: number,
      width: number,
      height: number,
    ) => CanvasContext;
    strokeRect: (
      x: number,
      y: number,
      width: number,
      height: number,
    ) => CanvasContext;
    clearRect: (
      x: number,
      y: number,
      width: number,
      height: number,
    ) => CanvasContext;
    fill: () => CanvasContext;
    stroke: () => CanvasContext;
    beginPath: () => CanvasContext;
    moveTo: (x: number, y: number) => CanvasContext;
    lineTo: (x: number, y: number) => CanvasContext;
    rect: (
      x: number,
      y: number,
      width: number,
      height: number,
    ) => CanvasContext;
    arc: (
      x: number,
      y: number,
      radius: number,
      startAngle: number,
      endAngle: number,
      counterclockwise?: boolean,
    ) => CanvasContext;
    quadraticCurveTo: (
      cpx: number,
      cpy: number,
      x: number,
      y: number,
    ) => CanvasContext;
    bezierCurveTo: (
      cp1x: number,
      cp1y: number,
      cp2x: number,
      cp2y: number,
      x: number,
      y: number,
    ) => CanvasContext;
    fillText: (
      text: string,
      x: number,
      y: number,
      maxWidth?: number,
    ) => CanvasContext;
    setFontSize: (fontSize: number) => CanvasContext;
    setFillStyle: (color: string) => CanvasContext;
    setStrokeStyle: (color: string) => CanvasContext;
    setLineWidth: (lineWidth: number) => CanvasContext;
    setLineCap: (lineCap: "butt" | "round" | "square") => CanvasContext;
    setLineJoin: (lineJoin: "bevel" | "round" | "miter") => CanvasContext;
    setMiterLimit: (miterLimit: number) => CanvasContext;
    save: () => CanvasContext;
    restore: () => CanvasContext;
    draw: (reserve?: boolean, callback?: () => void) => void;
    measureText: (text: string) => { width: number };
    translate: (x: number, y: number) => CanvasContext;
    rotate: (angle: number) => CanvasContext;
    scale: (scaleWidth: number, scaleHeight: number) => CanvasContext;
    resetTransform: () => CanvasContext;
    clip: () => CanvasContext;
    globalAlpha: (alpha: number) => CanvasContext;
  }

  /**
   * 组件实例
   */
  interface ComponentInstance {
    setData: (data: Record<string, unknown>) => void;
    hasBehavior: (behavior: unknown) => boolean;
    triggerEvent: (
      name: string,
      detail?: unknown,
      options?: TriggerEventOptions,
    ) => void;
    createSelectorQuery: () => SelectorQuery;
    createIntersectionObserver: (
      options?: IntersectionObserverOptions,
    ) => IntersectionObserver;
    selectComponent: (selector: string) => unknown;
    selectAllComponents: (selector: string) => unknown[];
    getRelationNodes: (relationKey: string) => unknown[];
    groupSetData: (callback: () => void) => void;
  }

  interface TriggerEventOptions {
    bubbles?: boolean;
    composed?: boolean;
    capturePhase?: boolean;
  }

  /**
   * 页面实例
   */
  interface PageInstance {
    data: Record<string, unknown>;
    setData: (data: Record<string, unknown>) => void;
    onLoad: (query: Record<string, string>) => void;
    onShow: () => void;
    onReady: () => void;
    onHide: () => void;
    onUnload: () => void;
    onPullDownRefresh: () => void;
    onReachBottom: () => void;
    onShareAppMessage: (res: ShareAppMessage) => ShareAppMessageReturn;
    onShareTimeline: () => ShareTimelineReturn;
    onAddToFavorites: (res: AddToFavorites) => AddToFavoritesReturn;
    onPageScroll: (scrollObject: PageScrollObject) => void;
    onTabItemTap: (tabItem: TabItemTapObject) => void;
    triggerEvent: (
      name: string,
      detail?: unknown,
      options?: TriggerEventOptions,
    ) => void;
    createSelectorQuery: () => SelectorQuery;
    createIntersectionObserver: (
      options?: IntersectionObserverOptions,
    ) => IntersectionObserver;
    selectComponent: (selector: string) => unknown;
    selectAllComponents: (selector: string) => unknown[];
    getOpenerEventChannel: () => EventChannel;
    route: string;
  }

  interface ShareAppMessage {
    from: "button" | "menu";
    target?: unknown;
    webViewUrl?: string;
  }

  interface ShareAppMessageReturn {
    title: string;
    path?: string;
    imageUrl?: string;
  }

  interface ShareTimelineReturn {
    title: string;
    query?: string;
    imageUrl?: string;
  }

  interface AddToFavorites {
    view: { imageUrl: string; type: string };
    node: { path: string; query: string };
  }

  interface AddToFavoritesReturn {
    title: string;
    imageUrl?: string;
    query?: string;
  }

  interface PageScrollObject {
    scrollTop: number;
  }

  interface TabItemTapObject {
    index: number;
    pagePath: string;
    text: string;
  }

  interface EventChannel {
    emit: (name: string, args?: unknown) => void;
    on: (name: string, callback: (args?: unknown) => void) => void;
    once: (name: string, callback: (args?: unknown) => void) => void;
    off: (name: string, callback?: (args?: unknown) => void) => void;
  }

  /**
   * 组件构造器
   */
  interface ComponentConstructor {
    (options: ComponentOptions): ComponentInstance;
  }

  interface ComponentOptions {
    properties?: Record<string, PropertyOptions>;
    data?: Record<string, unknown>;
    methods?: Record<string, unknown>;
    behaviors?: string[];
    created?: () => void;
    attached?: () => void;
    ready?: () => void;
    moved?: () => void;
    detached?: () => void;
    relations?: Record<string, RelationOptions>;
    externalClasses?: string[];
    options?: ComponentOptionsConfig;
    lifetimes?: ComponentLifetimes;
    pageLifetimes?: PageLifetimes;
    definitionFilter?: (defFields: unknown, options: unknown) => void;
  }

  interface PropertyOptions {
    type?: unknown;
    value?: unknown;
    observer?: (newVal: unknown, oldVal: unknown, changedPath: string) => void;
  }

  interface RelationOptions {
    type: "parent" | "child" | "ancestor" | "descendant";
    linked?: (target: unknown) => void;
    linkChanged?: (target: unknown) => void;
    unlinked?: (target: unknown) => void;
    target?: string;
  }

  interface ComponentOptionsConfig {
    multipleSlots?: boolean;
    addGlobalClass?: boolean;
    virtualHost?: string;
  }

  interface ComponentLifetimes {
    created?: () => void;
    attached?: () => void;
    ready?: () => void;
    moved?: () => void;
    detached?: () => void;
  }

  interface PageLifetimes {
    show?: () => void;
    hide?: () => void;
    resize?: (size: { windowWidth: number; windowHeight: number }) => void;
  }

  /**
   * Behavior构造器
   */
  interface BehaviorConstructor {
    (options: BehaviorOptions): BehaviorInstance;
  }

  interface BehaviorOptions {
    properties?: Record<string, PropertyOptions>;
    data?: Record<string, unknown>;
    methods?: Record<string, unknown>;
    behaviors?: string[];
    created?: () => void;
    attached?: () => void;
    ready?: () => void;
    lifetimes?: ComponentLifetimes;
    definitionFilter?: (defFields: unknown, options: unknown) => void;
  }

  interface BehaviorInstance {
    properties?: Record<string, PropertyOptions>;
    data?: Record<string, unknown>;
    methods?: Record<string, unknown>;
  }

  /**
   * 界面API
   */
  function showToast(options: ShowToastOptions): void;
  function hideToast(): void;
  function showModal(options: ShowModalOptions): void;
  function showLoading(options: ShowLoadingOptions): void;
  function hideLoading(): void;
  function showActionSheet(options: ShowActionSheetOptions): void;
  function setNavigationBarTitle(options: SetNavigationBarTitleOptions): void;
  function setNavigationBarColor(options: SetNavigationBarColorOptions): void;
  function setBackgroundColor(options: SetBackgroundColorOptions): void;
  function setTabBarItem(options: SetTabBarItemOptions): void;
  function setTabBarStyle(options: SetTabBarStyleOptions): void;
  function showTabBar(options: ShowTabBarOptions): void;
  function hideTabBar(options: HideTabBarOptions): void;
  function setTopBarText(options: SetTopBarTextOptions): void;

  interface ShowToastOptions {
    title: string;
    icon?: "success" | "error" | "loading" | "none";
    image?: string;
    duration?: number;
    mask?: boolean;
    success?: () => void;
    fail?: () => void;
    complete?: () => void;
  }

  interface ShowModalOptions {
    title: string;
    content: string;
    showCancel?: boolean;
    cancelText?: string;
    cancelColor?: string;
    confirmText?: string;
    confirmColor?: string;
    success?: (res: ShowModalSuccess) => void;
    fail?: () => void;
    complete?: () => void;
  }

  interface ShowModalSuccess {
    confirm: boolean;
    cancel: boolean;
  }

  interface ShowLoadingOptions {
    title: string;
    mask?: boolean;
    success?: () => void;
    fail?: () => void;
    complete?: () => void;
  }

  interface ShowActionSheetOptions {
    itemList: string[];
    itemColor?: string;
    success?: (res: ShowActionSheetSuccess) => void;
    fail?: () => void;
    complete?: () => void;
  }

  interface ShowActionSheetSuccess {
    tapIndex: number;
  }

  interface SetNavigationBarTitleOptions {
    title: string;
    success?: () => void;
    fail?: () => void;
    complete?: () => void;
  }

  interface SetNavigationBarColorOptions {
    frontColor: string;
    backgroundColor: string;
    animation?: SetNavigationBarColorAnimation;
    success?: () => void;
    fail?: () => void;
    complete?: () => void;
  }

  interface SetNavigationBarColorAnimation {
    duration: number;
    timingFunc: string;
  }

  interface SetBackgroundColorOptions {
    backgroundColor?: string;
    backgroundColorTop?: string;
    backgroundColorBottom?: string;
  }

  interface SetTabBarItemOptions {
    index: number;
    text?: string;
    iconPath?: string;
    selectedIconPath?: string;
    success?: () => void;
    fail?: () => void;
    complete?: () => void;
  }

  interface SetTabBarStyleOptions {
    color?: string;
    selectedColor?: string;
    backgroundColor?: string;
    borderStyle?: string;
    success?: () => void;
    fail?: () => void;
    complete?: () => void;
  }

  interface ShowTabBarOptions {
    animation?: boolean;
    success?: () => void;
    fail?: () => void;
    complete?: () => void;
  }

  interface HideTabBarOptions {
    animation?: boolean;
    success?: () => void;
    fail?: () => void;
    complete?: () => void;
  }

  interface SetTopBarTextOptions {
    text: string;
    success?: () => void;
    fail?: () => void;
    complete?: () => void;
  }

  /**
   * 导航设置
   */
  function nextTick(callback: () => void): void;

  /**
   * 界面交互
   */
  function showToast(options: ShowToastOptions): void;
  function showLoading(options: ShowLoadingOptions): void;
  function hideToast(): void;
  function hideLoading(): void;
  function showModal(options: ShowModalOptions): Promise<ShowModalSuccess>;
  function showActionSheet(
    options: ShowActionSheetOptions,
  ): Promise<ShowActionSheetSuccess>;

  /**
   * 滚动
   */
  function pageScrollTo(options: PageScrollToOptions): void;

  interface PageScrollToOptions {
    scrollTop: number;
    duration?: number;
    success?: () => void;
    fail?: () => void;
    complete?: () => void;
  }

  /**
   * 动画
   */
  function createAnimation(options: AnimationOptions): Animation;

  /**
   * 绘图
   */
  function createCanvasContext(
    canvasId: string,
    component?: ComponentInstance,
  ): CanvasContext;
  function canvasToTempFilePath(
    options: CanvasToTempFilePathOptions,
    component?: ComponentInstance,
  ): void;

  interface CanvasToTempFilePathOptions {
    canvasId: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    destWidth?: number;
    destHeight?: number;
    fileType?: "png" | "jpg";
    quality?: number;
    success?: (res: CanvasToTempFilePathSuccess) => void;
    fail?: (res: CanvasToTempFilePathFail) => void;
    complete?: (res: CanvasToTempFilePathComplete) => void;
  }

  interface CanvasToTempFilePathSuccess {
    tempFilePath: string;
  }

  interface CanvasToTempFilePathFail {
    errMsg: string;
  }

  interface CanvasToTempFilePathComplete {
    errMsg: string;
  }

  /**
   * 下拉刷新
   */
  function startPullDownRefresh(options: StartPullDownRefreshOptions): void;

  interface StartPullDownRefreshOptions {
    success?: () => void;
    fail?: (res: StartPullDownRefreshFail) => void;
    complete?: () => void;
  }

  interface StartPullDownRefreshFail {
    errMsg: string;
  }

  function stopPullDownRefresh(): void;

  /**
   * 节点查询
   */
  function createSelectorQuery(): SelectorQuery;

  /**
   * 节点布局相交
   */
  function createIntersectionObserver(
    component?: ComponentInstance,
    options?: IntersectionObserverOptions,
  ): IntersectionObserver;

  /**
   * 媒体API
   */
  function getBackgroundAudioManager(): BackgroundAudioManager;
  function getRecorderManager(): RecorderManager;
  function getCameraContext(): CameraContext;
  function createCameraContext(): CameraContext;

  interface RecorderManager {
    start: (options: RecorderManagerStartOptions) => void;
    stop: () => void;
    pause: () => void;
    resume: () => void;
    onStart: (callback: () => void) => void;
    onPause: (callback: () => void) => void;
    onStop: (callback: (res: RecorderManagerStopOptions) => void) => void;
    onError: (callback: (res: RecorderManagerErrorOptions) => void) => void;
    onFrameRecorded: (
      callback: (res: RecorderManagerFrameRecordedOptions) => void,
    ) => void;
    onInterruptionBegin: (callback: () => void) => void;
    onInterruptionEnd: (callback: () => void) => void;
  }

  interface RecorderManagerStartOptions {
    duration?: number;
    sampleRate?: number;
    numberOfChannels?: number;
    encodeBitRate?: number;
    format?: "mp3" | "aac" | "wav" | "PCM";
  }

  interface RecorderManagerStopOptions {
    tempFilePath: string;
    duration: number;
    fileSize: number;
  }

  interface RecorderManagerErrorOptions {
    errMsg: string;
  }

  interface RecorderManagerFrameRecordedOptions {
    frameBuffer: ArrayBuffer;
    isLastFrame: boolean;
  }

  /**
   * 位置API
   */
  function getLocation(options: GetLocationOptions): void;
  function chooseLocation(options: ChooseLocationOptions): void;
  function openLocation(options: OpenLocationOptions): void;

  interface ChooseLocationOptions {
    success: (res: ChooseLocationSuccess) => void;
    fail?: (res: ChooseLocationFail) => void;
    complete?: (res: ChooseLocationComplete) => void;
  }

  interface ChooseLocationSuccess {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  }

  interface ChooseLocationFail {
    errMsg: string;
  }

  interface ChooseLocationComplete {
    errMsg: string;
  }

  interface OpenLocationOptions {
    latitude: number;
    longitude: number;
    scale?: number;
    name?: string;
    address?: string;
    success?: () => void;
    fail?: (res: OpenLocationFail) => void;
    complete?: () => void;
  }

  interface OpenLocationFail {
    errMsg: string;
  }

  /**
   * 设备API
   */
  function getSystemInfo(options: GetSystemInfoOptions): void;
  function getDeviceInfo(): DeviceInfo;
  function getAppBaseInfo(): AppBaseInfo;
  function getWindowInfo(): WindowInfo;
  function getScreenBrightness(options: GetScreenBrightnessOptions): void;
  function setScreenBrightness(options: SetScreenBrightnessOptions): void;
  function setKeepScreenOn(options: SetKeepScreenOnOptions): void;
  function vibrateShort(options: VibrateShortOptions): void;
  function vibrateLong(options: VibrateLongOptions): void;
  function onAccelerometerChange(
    callback: (res: AccelerometerChange) => void,
  ): void;
  function startAccelerometer(options: StartAccelerometerOptions): void;
  function stopAccelerometer(): void;
  function onCompassChange(callback: (res: CompassChange) => void): void;
  function startCompass(options: StartCompassOptions): void;
  function stopCompass(): void;
  function onDeviceMotionChange(
    callback: (res: DeviceMotionChange) => void,
  ): void;
  function startDeviceMotionListening(
    options: StartDeviceMotionListeningOptions,
  ): void;
  function stopDeviceMotionListening(): void;
  function onGyroscopeChange(callback: (res: GyroscopeChange) => void): void;
  function startGyroscope(options: StartGyroscopeOptions): void;
  function stopGyroscope(): void;
  function addPhoneContact(options: AddPhoneContactOptions): void;
  function getBiometricManager(): BiometricManager;
  function checkIsSupportSoter(options: CheckIsSupportSoterOptions): void;
  function startSoterAuthentication(
    options: StartSoterAuthenticationOptions,
  ): void;
  function checkIsSupportFacialRecognition(
    options: CheckIsSupportFacialRecognitionOptions,
  ): void;
  function startFacialRecognitionVerify(
    options: StartFacialRecognitionVerifyOptions,
  ): void;

  interface GetSystemInfoOptions {
    success: (res: SystemInfo) => void;
    fail?: (res: GetSystemInfoFail) => void;
    complete?: (res: GetSystemInfoComplete) => void;
  }

  interface GetSystemInfoFail {
    errMsg: string;
  }

  interface GetSystemInfoComplete {
    errMsg: string;
  }

  interface DeviceInfo {
    brand: string;
    model: string;
    platform: string;
    system: string;
    SDKVersion: string;
  }

  interface AppBaseInfo {
    appId: string;
    appName: string;
    appPath: string;
    version: string;
    SDKVersion: string;
  }

  interface WindowInfo {
    pixelRatio: number;
    screenWidth: number;
    screenHeight: number;
    windowWidth: number;
    windowHeight: number;
    statusBarHeight: number;
    safeArea: SafeArea;
    theme: string;
  }

  interface GetScreenBrightnessOptions {
    success?: (res: GetScreenBrightnessSuccess) => void;
    fail?: (res: GetScreenBrightnessFail) => void;
    complete?: (res: GetScreenBrightnessComplete) => void;
  }

  interface GetScreenBrightnessSuccess {
    value: number;
  }

  interface GetScreenBrightnessFail {
    errMsg: string;
  }

  interface GetScreenBrightnessComplete {
    errMsg: string;
  }

  interface SetScreenBrightnessOptions {
    value: number;
    success?: () => void;
    fail?: () => void;
    complete?: () => void;
  }

  interface SetKeepScreenOnOptions {
    keepScreenOn: boolean;
    success?: () => void;
    fail?: () => void;
    complete?: () => void;
  }

  interface VibrateShortOptions {
    type?: "light" | "heavy";
    success?: () => void;
    fail?: (res: VibrateShortFail) => void;
    complete?: () => void;
  }

  interface VibrateShortFail {
    errMsg: string;
  }

  interface VibrateLongOptions {
    success?: () => void;
    fail?: (res: VibrateLongFail) => void;
    complete?: () => void;
  }

  interface VibrateLongFail {
    errMsg: string;
  }

  interface AccelerometerChange {
    x: number;
    y: number;
    z: number;
  }

  interface CompassChange {
    direction: number;
  }

  interface DeviceMotionChange {
    alpha: number;
    beta: number;
    gamma: number;
  }

  interface GyroscopeChange {
    x: number;
    y: number;
    z: number;
  }

  interface BiometricManager {
    checkIsSupport: (res: {
      supportMode: ("fingerPrint" | "facial" | "speech")[];
      errMsg: string;
    }) => void;
    checkIsAvailable: (res: { isAvailable: boolean; errMsg: string }) => void;
    startAuth: (res: { token: string; errMsg: string }) => void;
  }

  interface CheckIsSupportFacialRecognitionOptions {
    checkAliveType: number;
    success?: (res: CheckIsSupportFacialRecognitionSuccess) => void;
    fail?: (res: CheckIsSupportFacialRecognitionFail) => void;
    complete?: (res: CheckIsSupportFacialRecognitionComplete) => void;
  }

  interface CheckIsSupportFacialRecognitionSuccess {
    errMsg: string;
    supportMode: ("fingerPrint" | "facial" | "speech")[];
  }

  interface CheckIsSupportFacialRecognitionFail {
    errMsg: string;
  }

  interface CheckIsSupportFacialRecognitionComplete {
    errMsg: string;
  }

  interface StartFacialRecognitionVerifyOptions {
    checkAliveType: number;
    success?: (res: StartFacialRecognitionVerifySuccess) => void;
    fail?: (res: StartFacialRecognitionVerifyFail) => void;
    complete?: (res: StartFacialRecognitionVerifyComplete) => void;
  }

  interface StartFacialRecognitionVerifySuccess {
    errMsg: string;
    verifyResult: string;
  }

  interface StartFacialRecognitionVerifyFail {
    errMsg: string;
  }

  interface StartFacialRecognitionVerifyComplete {
    errMsg: string;
  }

  /**
   * 网络API
   */
  function request(options: RequestOptions): RequestTask;
  function downloadFile(options: DownloadFileOptions): DownloadTask;
  function uploadFile(options: UploadFileOptions): UploadTask;
  function connectSocket(options: ConnectSocketOptions): SocketTask;
  function sendSocketMessage(options: SendSocketMessageOptions): void;
  function closeSocket(options: CloseSocketOptions): void;

  interface RequestTask {
    abort: () => void;
    onHeadersReceived: (callback: (res: OnHeadersReceivedData) => void) => void;
    offHeadersReceived: (
      callback?: (res: OnHeadersReceivedData) => void,
    ) => void;
  }

  interface OnHeadersReceivedData {
    header: Record<string, string>;
  }

  interface DownloadTask {
    abort: () => void;
    onProgressUpdate: (callback: (res: DownloadProgressUpdate) => void) => void;
    offProgressUpdate: (
      callback?: (res: DownloadProgressUpdate) => void,
    ) => void;
    onHeadersReceived: (callback: (res: OnHeadersReceivedData) => void) => void;
    offHeadersReceived: (
      callback?: (res: OnHeadersReceivedData) => void,
    ) => void;
  }

  interface DownloadProgressUpdate {
    progress: number;
    totalBytesWritten: number;
    totalBytesExpectedToWrite: number;
  }

  interface UploadTask {
    abort: () => void;
    onProgressUpdate: (callback: (res: UploadProgressUpdate) => void) => void;
    offProgressUpdate: (callback?: (res: UploadProgressUpdate) => void) => void;
    onHeadersReceived: (callback: (res: OnHeadersReceivedData) => void) => void;
    offHeadersReceived: (
      callback?: (res: OnHeadersReceivedData) => void,
    ) => void;
  }

  interface UploadProgressUpdate {
    progress: number;
    totalBytesWritten: number;
    totalBytesExpectedToWrite: number;
  }

  interface SocketTask {
    send: (options: SendSocketMessageOptions) => void;
    close: (options: CloseSocketOptions) => void;
    onOpen: (callback: (res: OnSocketOpenOptions) => void) => void;
    onClose: (callback: (res: OnSocketCloseOptions) => void) => void;
    onError: (callback: (res: OnSocketErrorOptions) => void) => void;
    onMessage: (callback: (res: OnSocketMessageOptions) => void) => void;
  }

  interface SendSocketMessageOptions {
    data: string | ArrayBuffer;
    success?: () => void;
    fail?: (res: SendSocketMessageFail) => void;
    complete?: () => void;
  }

  interface SendSocketMessageFail {
    errMsg: string;
  }

  interface CloseSocketOptions {
    code?: number;
    reason?: string;
    success?: () => void;
    fail?: (res: CloseSocketFail) => void;
    complete?: () => void;
  }

  interface CloseSocketFail {
    errMsg: string;
  }

  interface OnSocketOpenOptions {
    header: Record<string, string>;
  }

  interface OnSocketCloseOptions {
    code: number;
    reason: string;
  }

  interface OnSocketErrorOptions {
    errMsg: string;
  }

  interface OnSocketMessageOptions {
    data: string | ArrayBuffer;
  }

  /**
   * 存储API
   */
  function setStorage(options: SetStorageOptions): void;
  function setStorageSync(key: string, data: unknown): void;
  function getStorage(options: GetStorageOptions): void;
  function getStorageSync(key: string): unknown;
  function removeStorage(options: RemoveStorageOptions): void;
  function removeStorageSync(key: string): void;
  function clearStorage(): void;
  function clearStorageSync(): void;
  function getStorageInfo(options: GetStorageInfoOptions): void;
  function getStorageInfoSync(): StorageInfo;

  interface SetStorageOptions {
    key: string;
    data: unknown;
    success?: () => void;
    fail?: (res: SetStorageFail) => void;
    complete?: () => void;
  }

  interface SetStorageFail {
    errMsg: string;
  }

  interface GetStorageOptions {
    key: string;
    success: (res: GetStorageSuccess) => void;
    fail?: (res: GetStorageFail) => void;
    complete?: (res: GetStorageComplete) => void;
  }

  interface GetStorageSuccess {
    data: unknown;
  }

  interface GetStorageFail {
    errMsg: string;
  }

  interface GetStorageComplete {
    errMsg: string;
  }

  interface RemoveStorageOptions {
    key: string;
    success?: () => void;
    fail?: (res: RemoveStorageFail) => void;
    complete?: () => void;
  }

  interface RemoveStorageFail {
    errMsg: string;
  }

  interface GetStorageInfoOptions {
    success: (res: StorageInfo) => void;
    fail?: (res: GetStorageInfoFail) => void;
    complete?: (res: GetStorageInfoComplete) => void;
  }

  interface GetStorageInfoFail {
    errMsg: string;
  }

  interface GetStorageInfoComplete {
    errMsg: string;
  }

  interface StorageInfo {
    currentSize: number;
    limitSize: number;
    keys: string[];
  }

  /**
   * 开放能力API
   */
  function login(options: LoginOptions): void;
  function checkSession(options: CheckSessionOptions): void;
  function getUserProfile(options: GetUserProfileOptions): void;
  function requestPayment(options: RequestPaymentOptions): void;
  function navigateToMiniProgram(options: NavigateToMiniProgramOptions): void;
  function navigateBackMiniProgram(
    options: NavigateBackMiniProgramOptions,
  ): void;
  function exitMiniProgram(options: ExitMiniProgramOptions): void;
  function getSetting(options: GetSettingOptions): void;
  function openSetting(options: OpenSettingOptions): void;
  function reportAnalytics(
    eventName: string,
    data: Record<string, unknown>,
  ): void;
  function getOpenDataContext(options: GetOpenDataContextOptions): void;
  function createRewardedVideoAd(
    options: CreateRewardedVideoAdOptions,
  ): AdRewardedVideoAd;

  interface CreateRewardedVideoAdOptions {
    adUnitId: string;
    multiton?: boolean;
  }

  /**
   * 基础库版本
   */
  const SDKVersion: string;
  const environment: string;
}
