/**
 * 文件名: cache.ts
 * 版本号: 1.0.0
 * 更新日期: 2025-12-29 15:45
 * 描述: 缓存工具类，提供请求缓存、数据缓存、缓存管理等功能
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

interface CacheOptions {
  expiresIn?: number;
  useStorage?: boolean;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
}

interface MemoryCache {
  [key: string]: CacheEntry<unknown>;
}

class CacheUtil {
  private memoryCache: MemoryCache;
  private readonly CACHE_PREFIX = "cache_";
  private readonly MAX_MEMORY_SIZE = 100;
  private readonly DEFAULT_EXPIRES_IN = 5 * 60 * 1000;
  private stats: CacheStats;
  private cleanupTimer: number | null = null;
  private readonly CLEANUP_INTERVAL = 60 * 1000;

  constructor() {
    this.memoryCache = {};
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      maxSize: this.MAX_MEMORY_SIZE,
    };
    this.startCleanupTimer();
  }

  /**
   * 启动定时清理任务
   */
  private startCleanupTimer(): void {
    if (typeof window !== "undefined") {
      this.cleanupTimer = window.setInterval(() => {
        this.cleanupExpired();
      }, this.CLEANUP_INTERVAL);
    }
  }

  /**
   * 停止定时清理任务
   */
  stopCleanupTimer(): void {
    if (this.cleanupTimer !== null) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * 获取缓存统计信息
   * @returns CacheStats 缓存统计
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * 重置缓存统计
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      size: Object.keys(this.memoryCache).length,
      maxSize: this.MAX_MEMORY_SIZE,
    };
  }

  /**
   * 生成缓存键
   * @param key 基础键名
   * @returns string 完整的缓存键
   */
  private generateCacheKey(key: string): string {
    return `${this.CACHE_PREFIX}${key}`;
  }

  /**
   * 检查数据是否过期
   * @param timestamp 时间戳
   * @param expiresIn 过期时间（毫秒）
   * @returns boolean 是否过期
   */
  private isExpired(timestamp: number, expiresIn: number): boolean {
    return Date.now() - timestamp > expiresIn;
  }

  /**
   * 安全获取wx对象
   */
  private getWx() {
    return typeof wx !== "undefined" ? wx : null;
  }

  /**
   * 获取数据
   * @param key 缓存键
   * @returns T | null 缓存的数据或null
   */
  get<T>(key: string): T | null {
    const cacheKey = this.generateCacheKey(key);

    if (this.memoryCache[cacheKey]) {
      const entry = this.memoryCache[cacheKey];
      if (!this.isExpired(entry.timestamp, entry.expiresIn)) {
        this.stats.hits++;
        return entry.data as T;
      } else {
        delete this.memoryCache[cacheKey];
        this.stats.size--;
      }
    }

    this.stats.misses++;

    try {
      const wx = this.getWx();
      if (wx && wx.getStorageSync) {
        const storageData = wx.getStorageSync(cacheKey);
        if (storageData && typeof storageData === "string") {
          const entry = JSON.parse(storageData) as CacheEntry<T>;
          if (!this.isExpired(entry.timestamp, entry.expiresIn)) {
            this.memoryCache[cacheKey] = entry;
            this.stats.size++;
            this.stats.hits++;
            return entry.data;
          } else {
            wx.removeStorageSync && wx.removeStorageSync(cacheKey);
          }
        }
      }
    } catch (error) {
      console.warn("[CacheUtil] 从存储读取缓存失败:", error);
    }

    return null;
  }

  /**
   * 设置缓存
   * @param key 缓存键
   * @param data 要缓存的数据
   * @param options 缓存选项
   */
  set<T>(key: string, data: T, options?: CacheOptions): void {
    const cacheKey = this.generateCacheKey(key);
    const expiresIn = options?.expiresIn ?? this.DEFAULT_EXPIRES_IN;
    const useStorage = options?.useStorage ?? true;

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresIn,
    };

    try {
      const wx = this.getWx();
      if (useStorage && wx && wx.setStorageSync) {
        wx.setStorageSync(cacheKey, JSON.stringify(entry));
      }

      if (!this.memoryCache[cacheKey]) {
        if (this.stats.size >= this.MAX_MEMORY_SIZE) {
          this.evictOldest();
        }
        this.stats.size++;
      }

      this.memoryCache[cacheKey] = entry as CacheEntry<unknown>;
    } catch (error) {
      console.warn("[CacheUtil] 保存缓存失败:", error);
    }
  }

  /**
   * 删除缓存
   * @param key 缓存键
   */
  delete(key: string): void {
    const cacheKey = this.generateCacheKey(key);

    delete this.memoryCache[cacheKey];
    this.stats.size--;

    try {
      const wx = this.getWx();
      if (wx && wx.removeStorageSync) {
        wx.removeStorageSync(cacheKey);
      }
    } catch (error) {
      console.warn("[CacheUtil] 删除缓存失败:", error);
    }
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.memoryCache = {};
    this.stats.size = 0;

    try {
      const wx = this.getWx();
      if (wx && wx.getStorageInfoSync && wx.removeStorageSync) {
        const keys = wx.getStorageInfoSync().keys;
        for (const key of keys) {
          if (key.startsWith(this.CACHE_PREFIX)) {
            wx.removeStorageSync(key);
          }
        }
      }
    } catch (error) {
      console.warn("[CacheUtil] 清空缓存失败:", error);
    }
  }

  /**
   * 检查缓存是否存在
   * @param key 缓存键
   * @returns boolean 缓存是否存在
   */
  has(key: string): boolean {
    const cacheKey = this.generateCacheKey(key);

    if (this.memoryCache[cacheKey]) {
      const entry = this.memoryCache[cacheKey];
      if (!this.isExpired(entry.timestamp, entry.expiresIn)) {
        return true;
      }
      delete this.memoryCache[cacheKey];
      this.stats.size--;
    }

    try {
      const wx = this.getWx();
      if (wx && wx.getStorageSync) {
        const storageData = wx.getStorageSync(cacheKey);
        if (storageData && typeof storageData === "string") {
          const entry = JSON.parse(storageData) as CacheEntry<unknown>;
          if (!this.isExpired(entry.timestamp, entry.expiresIn)) {
            this.memoryCache[cacheKey] = entry;
            this.stats.size++;
            return true;
          }
          if (wx.removeStorageSync) {
            wx.removeStorageSync(cacheKey);
          }
        }
      }
    } catch (error) {
      console.warn("[CacheUtil] 检查缓存失败:", error);
    }

    return false;
  }

  /**
   * 获取缓存剩余有效期
   * @param key 缓存键
   * @returns number 剩余有效期（毫秒），-1表示不存在或已过期
   */
  getTTL(key: string): number {
    const cacheKey = this.generateCacheKey(key);

    if (this.memoryCache[cacheKey]) {
      const entry = this.memoryCache[cacheKey];
      const remaining = entry.expiresIn - (Date.now() - entry.timestamp);
      return remaining > 0 ? remaining : -1;
    }

    try {
      const wx = this.getWx();
      if (wx && wx.getStorageSync) {
        const storageData = wx.getStorageSync(cacheKey);
        if (storageData && typeof storageData === "string") {
          const entry = JSON.parse(storageData) as CacheEntry<unknown>;
          const remaining = entry.expiresIn - (Date.now() - entry.timestamp);
          return remaining > 0 ? remaining : -1;
        }
      }
    } catch (error) {
      console.warn("[CacheUtil] 获取TTL失败:", error);
    }

    return -1;
  }

  /**
   * 刷新缓存有效期
   * @param key 缓存键
   * @param expiresIn 新的过期时间
   * @returns boolean 是否刷新成功
   */
  refresh(key: string, expiresIn?: number): boolean {
    const cacheKey = this.generateCacheKey(key);

    if (this.memoryCache[cacheKey]) {
      const entry = this.memoryCache[cacheKey];
      entry.expiresIn = expiresIn ?? entry.expiresIn;
      entry.timestamp = Date.now();
      return true;
    }

    try {
      const wx = this.getWx();
      if (wx && wx.getStorageSync && wx.setStorageSync) {
        const storageData = wx.getStorageSync(cacheKey);
        if (storageData && typeof storageData === "string") {
          const entry = JSON.parse(storageData) as CacheEntry<unknown>;
          entry.expiresIn = expiresIn ?? entry.expiresIn;
          entry.timestamp = Date.now();
          wx.setStorageSync(cacheKey, JSON.stringify(entry));
          this.memoryCache[cacheKey] = entry;
          return true;
        }
      }
    } catch (error) {
      console.warn("[CacheUtil] 刷新缓存失败:", error);
    }

    return false;
  }

  /**
   * 清理过期缓存
   * @returns number 清理的缓存数量
   */
  cleanupExpired(): number {
    let cleaned = 0;
    const now = Date.now();

    for (const key in this.memoryCache) {
      const entry = this.memoryCache[key];
      if (now - entry.timestamp > entry.expiresIn) {
        delete this.memoryCache[key];
        cleaned++;
        this.stats.size--;
      }
    }

    try {
      const wx = this.getWx();
      if (
        wx &&
        wx.getStorageInfoSync &&
        wx.getStorageSync &&
        wx.removeStorageSync
      ) {
        const keys = wx.getStorageInfoSync().keys;
        for (const key of keys) {
          if (key.startsWith(this.CACHE_PREFIX)) {
            const storageData = wx.getStorageSync(key);
            if (storageData && typeof storageData === "string") {
              const entry = JSON.parse(storageData) as CacheEntry<unknown>;
              if (now - entry.timestamp > entry.expiresIn) {
                wx.removeStorageSync(key);
                cleaned++;
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn("[CacheUtil] 清理存储缓存失败:", error);
    }

    if (cleaned > 0) {
      console.info(`[CacheUtil] 清理了 ${cleaned} 个过期缓存`);
    }

    return cleaned;
  }

  /**
   * 清除最旧的缓存
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    for (const key in this.memoryCache) {
      if (this.memoryCache[key].timestamp < oldestTimestamp) {
        oldestTimestamp = this.memoryCache[key].timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      delete this.memoryCache[oldestKey];
      this.stats.size--;
    }
  }

  /**
   * 获取所有缓存键
   * @returns string[] 缓存键数组
   */
  keys(): string[] {
    const keys: string[] = [];

    for (const key in this.memoryCache) {
      keys.push(key.replace(this.CACHE_PREFIX, ""));
    }

    return keys;
  }

  /**
   * 获取缓存数量
   * @returns number 缓存数量
   */
  size(): number {
    return this.stats.size;
  }

  /**
   * 批量获取缓存
   * @param keyList 缓存键列表
   * @returns Record<string, T | null> 缓存数据映射
   */
  mget<T>(keyList: string[]): Record<string, T | null> {
    const result: Record<string, T | null> = {};

    for (const key of keyList) {
      result[key] = this.get<T>(key);
    }

    return result;
  }

  /**
   * 批量设置缓存
   * @param dataMap 缓存数据映射
   * @param options 缓存选项
   */
  mset<T>(dataMap: Record<string, T>, options?: CacheOptions): void {
    for (const key in dataMap) {
      this.set(key, dataMap[key], options);
    }
  }

  /**
   * 批量删除缓存
   * @param keyList 缓存键列表
   */
  mdelete(keyList: string[]): void {
    for (const key of keyList) {
      this.delete(key);
    }
  }

  /**
   * 带缓存的请求
   * @param url 请求URL
   * @param options 请求选项
   * @returns Promise<T> 请求结果
   */
  async requestWithCache<T>(
    url: string,
    options?: CacheOptions & { forceRefresh?: boolean },
  ): Promise<T> {
    const cacheKey = `request_${url}`;

    if (!options?.forceRefresh && this.has(cacheKey)) {
      const cached = this.get<T>(cacheKey);
      if (cached !== null) {
        console.debug(`[CacheUtil] 缓存命中: ${url}`);
        return cached;
      }
    }

    const wx = this.getWx();
    if (!wx || !wx.request) {
      throw new Error("wx.request未定义");
    }

    return new Promise((resolve, reject) => {
      wx.request({
        url,
        success: (res) => {
          if (res.statusCode === 200 && res.data) {
            this.set(cacheKey, res.data as T, options);
            resolve(res.data as T);
          } else {
            reject(new Error(`请求失败: ${res.statusCode}`));
          }
        },
        fail: (error) => {
          reject(error);
        },
      });
    });
  }
}

const cacheUtil = new CacheUtil();

export default cacheUtil;
