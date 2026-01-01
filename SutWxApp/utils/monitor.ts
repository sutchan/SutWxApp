/**
 * 文件名: monitor.ts
 * 版本号: 1.0.0
 * 更新日期: 2025-12-29 20:30
 * 描述: 监控和日志工具类，用于收集和上报错误、性能数据等
 */

// 微信小程序全局变量声明
declare const App: any;
declare function getApp(): any;

interface MonitorConfig {
  enable: boolean;
  debug: boolean;
  reportUrl: string;
  sampleRate: number;
  batchSize: number;
  batchInterval: number;
}

interface LogData {
  level: "log" | "info" | "warn" | "error" | "performance";
  message: string;
  timestamp: number;
  tag: string;
  data?: any;
  stack?: string;
}

class MonitorUtil {
  private config: MonitorConfig;
  private logQueue: LogData[] = [];
  private timer: number | null = null;
  private performanceData: any = {};
  private isInitialized = false;

  constructor() {
    this.config = {
      enable: true,
      debug: false,
      reportUrl: "https://monitor.example.com/report",
      sampleRate: 1,
      batchSize: 10,
      batchInterval: 5000,
    };

    this.init();
  }

  /**
   * 初始化监控系统
   */
  private init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // 注册全局错误监听
    this.registerErrorListeners();

    // 注册性能监控
    this.registerPerformanceListeners();

    // 启动日志队列处理
    this.startLogQueue();

    console.log("[Monitor] 监控系统初始化完成");
  }

  /**
   * 注册全局错误监听
   */
  private registerErrorListeners() {
    // 监听全局错误
    if (typeof window !== "undefined") {
      window.addEventListener("error", (event) => {
        this.error("[Global] 全局错误", event.error, { event });
      });

      // 监听未处理的Promise拒绝
      window.addEventListener("unhandledrejection", (event) => {
        this.error("[Global] Promise拒绝", event.reason, { event });
      });
    }

    // 监听小程序错误
    if (typeof App !== "undefined") {
      // 在app.js中注册onError和onUnhandledRejection
      // 这里只定义方法，具体注册在app.js中
    }
  }

  /**
   * 注册性能监控
   */
  private registerPerformanceListeners() {
    // 记录页面加载时间
    if (typeof wx !== "undefined") {
      this.performanceData.startTime = Date.now();
    }
  }

  /**
   * 启动日志队列处理
   */
  private startLogQueue() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timer = window.setInterval(() => {
      this.processLogQueue();
    }, this.config.batchInterval);
  }

  /**
   * 处理日志队列
   */
  private processLogQueue() {
    if (this.logQueue.length === 0) return;

    const logs = [...this.logQueue];
    this.logQueue = [];

    this.reportLogs(logs);
  }

  /**
   * 上报日志
   * @param logs 日志数组
   */
  private reportLogs(logs: LogData[]) {
    if (!this.config.enable || this.config.sampleRate < Math.random()) {
      return;
    }

    // 如果是调试模式，只打印不发送
    if (this.config.debug) {
      console.log("[Monitor] 调试模式，日志未上报:", logs);
      return;
    }

    // 实际上报逻辑
    console.log("[Monitor] 上报日志:", logs);

    // 这里应该实现实际的上报逻辑，例如使用wx.request或其他方式
    if (typeof wx !== "undefined") {
      wx.request({
        url: this.config.reportUrl,
        method: "POST",
        data: {
          logs,
          appVersion: getApp()?.globalData?.version || "1.0.0",
          platform: (wx as any).getSystemInfoSync().platform,
          timestamp: Date.now(),
        },
        success: (res) => {
          console.log("[Monitor] 日志上报成功", res);
        },
        fail: (err) => {
          console.error("[Monitor] 日志上报失败", err);
        },
      });
    }
  }

  /**
   * 普通日志
   * @param message 日志消息
   * @param data 附加数据
   * @param tag 日志标签
   */
  log(message: string, data?: any, tag: string = "default") {
    this.addLog("log", message, data, tag);
  }

  /**
   * 信息日志
   * @param message 日志消息
   * @param data 附加数据
   * @param tag 日志标签
   */
  info(message: string, data?: any, tag: string = "default") {
    this.addLog("info", message, data, tag);
  }

  /**
   * 警告日志
   * @param message 日志消息
   * @param data 附加数据
   * @param tag 日志标签
   */
  warn(message: string, data?: any, tag: string = "default") {
    this.addLog("warn", message, data, tag);
  }

  /**
   * 错误日志
   * @param message 日志消息
   * @param error 错误对象
   * @param data 附加数据
   * @param tag 日志标签
   */
  error(message: string, error: any, data?: any, tag: string = "default") {
    let stack = "";
    if (error instanceof Error) {
      stack = error.stack || "";
    }
    this.addLog("error", message, { error, ...data }, tag, stack);
  }

  /**
   * 性能日志
   * @param message 日志消息
   * @param data 性能数据
   * @param tag 日志标签
   */
  performance(message: string, data: any, tag: string = "performance") {
    this.addLog("performance", message, data, tag);
  }

  /**
   * 添加日志到队列
   * @param level 日志级别
   * @param message 日志消息
   * @param data 附加数据
   * @param tag 日志标签
   * @param stack 错误栈
   */
  private addLog(
    level: LogData["level"],
    message: string,
    data?: any,
    tag: string = "default",
    stack?: string,
  ) {
    const log: LogData = {
      level,
      message,
      timestamp: Date.now(),
      tag,
      data,
      stack,
    };

    this.logQueue.push(log);

    // 如果队列超过批量大小，立即处理
    if (this.logQueue.length >= this.config.batchSize) {
      this.processLogQueue();
    }

    // 调试模式下实时打印
    if (this.config.debug) {
      const logPrefix = `[Monitor][${level.toUpperCase()}][${tag}]`;
      // 根据日志级别选择合适的console方法
      const consoleMethod = level === "performance" ? "log" : level;
      console[consoleMethod](logPrefix, message, data || "");
    }
  }

  /**
   * 页面性能监控
   * @param pageName 页面名称
   */
  pagePerformance(pageName: string) {
    const endTime = Date.now();
    const duration = endTime - this.performanceData.startTime;

    this.performance(`页面加载性能 - ${pageName}`, {
      pageName,
      duration,
      startTime: this.performanceData.startTime,
      endTime,
    });

    this.performanceData.startTime = Date.now();
  }

  /**
   * 网络请求监控
   * @param url 请求URL
   * @param method 请求方法
   * @param duration 请求持续时间
   * @param statusCode 状态码
   */
  networkPerformance(
    url: string,
    method: string,
    duration: number,
    statusCode: number,
  ) {
    this.performance("网络请求性能", {
      url,
      method,
      duration,
      statusCode,
      timestamp: Date.now(),
    });
  }
}

const monitorUtil = new MonitorUtil();

export default monitorUtil;
