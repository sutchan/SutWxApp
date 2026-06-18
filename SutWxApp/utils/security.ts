/**
 * 文件名: security.ts
 * 版本号: 2.2.0
 * 更新日期: 2026-06-09
 * 描述: 安全工具类，提供真正的 AES 加密、SHA-256 签名、敏感信息处理等功能
 * 
 * 安全修复记录:
 * - v2.2.0: 修复 C-001/C-002，实现真正的 AES-128-CBC 加密和 SHA-256 签名
 * - v2.1.0: 修复代码审查问题
 */

/**
 * 加密配置接口
 */
interface EncryptionConfig {
  secretKey: string;
  iv: string;
  algorithm: "AES-128-CBC" | "AES-256-CBC";
}

/**
 * 签名配置接口
 */
interface SignConfig {
  appSecret: string;
  timestampEnabled: boolean;
  nonceEnabled: boolean;
}

/**
 * 请求参数接口
 */
interface RequestParams {
  url: string;
  method: string;
  data: Record<string, unknown>;
  timestamp: string;
  nonce: string;
  sign: string;
}

/**
 * 安全工具类
 * 
 * 安全最佳实践:
 * - 使用 AES-128-CBC 进行真正的加密（而非 Base64 编码）
 * - 使用 SHA-256 进行安全签名（而非弱哈希）
 * - 使用 crypto.getRandomValues() 生成安全随机数
 */
class SecurityUtil {
  private config: EncryptionConfig;
  private signConfig: SignConfig;
  private readonly KEY_CACHE_PREFIX = "security_";
  private readonly SIGN_CACHE_KEY = "request_sign";

  constructor() {
    this.config = {
      secretKey: this.getSecretKey(),
      iv: this.getIV(),
      algorithm: "AES-128-CBC",
    };

    this.signConfig = {
      appSecret: this.getAppSecret(),
      timestampEnabled: true,
      nonceEnabled: true,
    };
  }

  /**
   * 获取密钥
   * @returns string 密钥（16字节用于 AES-128）
   */
  private getSecretKey(): string {
    try {
      if (typeof wx !== "undefined") {
        const key = wx.getStorageSync("encrypt_key");
        if (key && typeof key === "string" && key.length === 16) {
          return key;
        }
        // 生成新的安全密钥
        const defaultKey = this.generateSecureKey(16);
        wx.setStorageSync("encrypt_key", defaultKey);
        return defaultKey;
      }
      return this.generateSecureKey(16);
    } catch {
      return this.generateSecureKey(16);
    }
  }

  /**
   * 获取初始化向量
   * @returns string IV（16字节）
   */
  private getIV(): string {
    try {
      if (typeof wx !== "undefined") {
        const iv = wx.getStorageSync("encrypt_iv");
        if (iv && typeof iv === "string" && iv.length === 16) {
          return iv;
        }
        const defaultIV = this.generateSecureKey(16);
        wx.setStorageSync("encrypt_iv", defaultIV);
        return defaultIV;
      }
      return this.generateSecureKey(16);
    } catch {
      return this.generateSecureKey(16);
    }
  }

  /**
   * 获取应用密钥
   * @returns string 应用密钥
   */
  private getAppSecret(): string {
    try {
      if (typeof wx !== "undefined") {
        const secret = wx.getStorageSync("app_secret");
        return typeof secret === "string" ? secret : "";
      }
      return "";
    } catch {
      return "";
    }
  }

  /**
   * 生成安全随机密钥
   * 使用 crypto.getRandomValues() 确保安全性
   * @param length 密钥长度
   * @returns string 密钥
   */
  private generateSecureKey(length: number): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const randomValues = new Uint32Array(length);
    // 使用 crypto.getRandomValues() 生成安全随机数
    crypto.getRandomValues(randomValues);

    for (let i = 0; i < length; i++) {
      result += chars[randomValues[i] % chars.length];
    }

    return result;
  }

  /**
   * 生成时间戳
   * @returns string 时间戳
   */
  private generateTimestamp(): string {
    return Date.now().toString();
  }

  /**
   * 生成安全随机 nonce
   * @param length 随机数长度
   * @returns string 随机数
   */
  private generateNonce(length = 16): string {
    // 使用安全随机数生成 nonce
    return this.generateSecureKey(length);
  }

  /**
   * SHA-256 哈希实现
   * 安全修复: 使用 SHA-256 替代弱哈希算法
   * @param data 要哈希的数据
   * @returns string SHA-256 哈希值（十六进制）
   */
  private sha256(data: string): string {
    // SHA-256 常量
    const K = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];

    // 初始哈希值
    let H = [
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ];

    // 预处理：添加填充
    const msg = this.stringToUint8Array(data);
    const msgLen = msg.length;
    const bitLen = msgLen * 8;
    
    // 计算填充后的长度
    const paddedLen = Math.ceil((msgLen + 9) / 64) * 64;
    const paddedMsg = new Uint8Array(paddedLen);
    
    // 复制原始消息
    paddedMsg.set(msg);
    
    // 添加 0x80 填充
    paddedMsg[msgLen] = 0x80;
    
    // 添加长度（大端序）
    const lenView = new DataView(paddedMsg.buffer);
    lenView.setUint32(paddedLen - 4, bitLen, false);

    // 处理每个 512 位块
    for (let i = 0; i < paddedLen; i += 64) {
      const W = new Uint32Array(64);
      
      // 复制前 16 个字
      for (let j = 0; j < 16; j++) {
        W[j] = lenView.getUint32(i + j * 4, false);
      }
      
      // 扩展到 64 个字
      for (let j = 16; j < 64; j++) {
        const s0 = this.sha256RightRotate(W[j-15], 7) ^ this.sha256RightRotate(W[j-15], 18) ^ (W[j-15] >>> 3);
        const s1 = this.sha256RightRotate(W[j-2], 17) ^ this.sha256RightRotate(W[j-2], 19) ^ (W[j-2] >>> 10);
        W[j] = (W[j-16] + s0 + W[j-7] + s1) >>> 0;
      }

      // 初始化工作变量
      let [a, b, c, d, e, f, g, h] = H;

      // 64 轮压缩
      for (let j = 0; j < 64; j++) {
        const S1 = this.sha256RightRotate(e, 6) ^ this.sha256RightRotate(e, 11) ^ this.sha256RightRotate(e, 25);
        const ch = (e & f) ^ (~e & g);
        const temp1 = (h + S1 + ch + K[j] + W[j]) >>> 0;
        const S0 = this.sha256RightRotate(a, 2) ^ this.sha256RightRotate(a, 13) ^ this.sha256RightRotate(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (S0 + maj) >>> 0;

        h = g;
        g = f;
        f = e;
        e = (d + temp1) >>> 0;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) >>> 0;
      }

      // 更新哈希值
      H[0] = (H[0] + a) >>> 0;
      H[1] = (H[1] + b) >>> 0;
      H[2] = (H[2] + c) >>> 0;
      H[3] = (H[3] + d) >>> 0;
      H[4] = (H[4] + e) >>> 0;
      H[5] = (H[5] + f) >>> 0;
      H[6] = (H[6] + g) >>> 0;
      H[7] = (H[7] + h) >>> 0;
    }

    // 输出十六进制结果
    return H.map(h => h.toString(16).padStart(8, '0')).join('');
  }

  /**
   * SHA-256 右旋转
   */
  private sha256RightRotate(value: number, bits: number): number {
    return (value >>> bits) | (value << (32 - bits));
  }

  /**
   * 字符串转 Uint8Array
   */
  private stringToUint8Array(str: string): Uint8Array {
    const encoder = new TextEncoder();
    return encoder.encode(str);
  }

  /**
   * 生成签名
   * 安全修复: 使用 SHA-256 替代弱哈希算法
   * @param params 签名参数
   * @returns string 签名（SHA-256 十六进制）
   */
  generateSign(params: Record<string, unknown>): string {
    const keys = Object.keys(params).sort();
    const paramString = keys
      .filter((key) => {
        const value = params[key];
        return value !== undefined && value !== null && value !== "";
      })
      .map((key) => `${key}=${String(params[key])}`)
      .join("&");

    const signString = `${paramString}&key=${this.signConfig.appSecret}`;
    
    // 使用 SHA-256 进行安全签名
    return this.sha256(signString);
  }

  /**
   * 生成请求签名
   * @param url 请求URL
   * @param method 请求方法
   * @param data 请求数据
   * @returns RequestParams 带签名的请求参数
   */
  generateRequestSign(
    url: string,
    method: string,
    data: Record<string, unknown>,
  ): RequestParams {
    const timestamp = this.signConfig.timestampEnabled
      ? this.generateTimestamp()
      : "";
    const nonce = this.signConfig.nonceEnabled ? this.generateNonce() : "";

    const signParams: Record<string, unknown> = {
      url,
      method: method.toUpperCase(),
      timestamp,
      nonce,
      ...data,
    };

    const sign = this.generateSign(signParams);

    return {
      url,
      method: method.toUpperCase(),
      data,
      timestamp,
      nonce,
      sign,
    };
  }

  /**
   * 验证请求签名
   * @param params 请求参数
   * @param sign 签名
   * @returns boolean 筕名是否有效
   */
  verifySign(params: Record<string, unknown>, sign: string): boolean {
    const expectedSign = this.generateSign(params);
    return expectedSign === sign;
  }

  /**
   * AES-128-CBC 加密实现
   * 安全修复: 实现真正的 AES 加密（而非 Base64 编码）
   * 
   * 注意: 这是纯 JavaScript 实现的 AES，适用于微信小程序环境
   * 在生产环境中建议使用经过安全审计的加密库
   * 
   * @param data 明文数据
   * @returns string 加密后的数据（Base64 编码）
   */
  encrypt(data: Record<string, unknown>): string {
    try {
      const jsonString = JSON.stringify(data);
      
      // 使用 AES-128-CBC 进行真正的加密
      const encrypted = this.aesEncrypt(jsonString, this.config.secretKey, this.config.iv);
      
      return encrypted;
    } catch (error) {
      // 安全修复: 不在日志中泄露敏感数据
      console.error("[SecurityUtil] 加密失败");
      throw new Error("数据加密失败");
    }
  }

  /**
   * AES-128-CBC 解密实现
   * 安全修复: 实现真正的 AES 解密
   * @param encryptedData 加密数据（Base64 编码）
   * @returns Record<string, unknown> 解密后的数据
   */
  decrypt(encryptedData: string): Record<string, unknown> {
    try {
      // 使用 AES-128-CBC 进行真正的解密
      const decrypted = this.aesDecrypt(encryptedData, this.config.secretKey, this.config.iv);
      
      return JSON.parse(decrypted);
    } catch (error) {
      // 安全修复: 不在日志中泄露敏感数据
      console.error("[SecurityUtil] 解密失败");
      throw new Error("数据解密失败");
    }
  }

  /**
   * AES-128-CBC 加密核心实现
   * 使用纯 JavaScript 实现，适用于微信小程序环境
   */
  private aesEncrypt(plaintext: string, key: string, iv: string): string {
    // 将密钥和 IV 转换为字节数组
    const keyBytes = this.stringToBytes(key);
    const ivBytes = this.stringToBytes(iv);
    
    // 将明文转换为字节数组并填充
    const plaintextBytes = this.stringToBytes(plaintext);
    const paddedBytes = this.pkcs7Pad(plaintextBytes, 16);
    
    // 执行 AES-CBC 加密
    const encryptedBlocks: number[] = [];
    let previousBlock = ivBytes;
    
    for (let i = 0; i < paddedBytes.length; i += 16) {
      const block = paddedBytes.slice(i, i + 16);
      
      // CBC 模式：先 XOR 前一个块，再加密
      const xorBlock = this.xorBlocks(block, previousBlock);
      const encryptedBlock = this.aesEncryptBlock(xorBlock, keyBytes);
      
      encryptedBlocks.push(...encryptedBlock);
      previousBlock = encryptedBlock;
    }
    
    // 返回 Base64 编码的加密数据
    return this.bytesToBase64(encryptedBlocks);
  }

  /**
   * AES-128-CBC 解密核心实现
   */
  private aesDecrypt(ciphertext: string, key: string, iv: string): string {
    // 将密钥和 IV 转换为字节数组
    const keyBytes = this.stringToBytes(key);
    const ivBytes = this.stringToBytes(iv);
    
    // 将 Base64 编码的密文转换为字节数组
    const ciphertextBytes = this.base64ToBytes(ciphertext);
    
    // 执行 AES-CBC 解密
    const decryptedBlocks: number[] = [];
    let previousBlock = ivBytes;
    
    for (let i = 0; i < ciphertextBytes.length; i += 16) {
      const block = ciphertextBytes.slice(i, i + 16);
      
      // CBC 模式：先解密，再 XOR 前一个块
      const decryptedBlock = this.aesDecryptBlock(block, keyBytes);
      const xorBlock = this.xorBlocks(decryptedBlock, previousBlock);
      
      decryptedBlocks.push(...xorBlock);
      previousBlock = block;
    }
    
    // 移除 PKCS7 填充
    const unpaddedBytes = this.pkcs7Unpad(decryptedBlocks);
    
    // 返回解密后的字符串
    return this.bytesToString(unpaddedBytes);
  }

  /**
   * AES 单块加密（128位）
   * 使用 AES-NI 指令集的软件实现
   */
  private aesEncryptBlock(block: number[], key: number[]): number[] {
    // AES S-box
    const SBOX = [
      0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
      0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
      0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
      0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
      0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
      0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
      0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
      0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
      0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
      0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
      0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
      0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
      0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
      0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
      0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
      0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
    ];

    // 密钥扩展（生成 10 轮密钥）
    const roundKeys = this.aesKeyExpansion(key);
    
    // 初始轮密钥加
    let state = this.xorBlocks(block, roundKeys[0]);
    
    // 9 轮主循环
    for (let round = 1; round <= 9; round++) {
      // SubBytes
      state = state.map(b => SBOX[b]);
      // ShiftRows
      state = this.aesShiftRows(state);
      // MixColumns（最后一轮不执行）
      if (round < 10) {
        state = this.aesMixColumns(state);
      }
      // AddRoundKey
      state = this.xorBlocks(state, roundKeys[round]);
    }
    
    // 最终轮（无 MixColumns）
    state = state.map(b => SBOX[b]);
    state = this.aesShiftRows(state);
    state = this.xorBlocks(state, roundKeys[10]);
    
    return state;
  }

  /**
   * AES 单块解密（128位）
   */
  private aesDecryptBlock(block: number[], key: number[]): number[] {
    // AES 逆 S-box
    const INV_SBOX = [
      0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38, 0xbf, 0x40, 0xa3, 0x9e, 0x81, 0xf3, 0xd7, 0xfb,
      0x7c, 0xe3, 0x39, 0x82, 0x9b, 0x2f, 0xff, 0x87, 0x34, 0x8e, 0x43, 0x44, 0xc4, 0xde, 0xe9, 0xcb,
      0x54, 0x7b, 0x94, 0x32, 0xa6, 0xc2, 0x23, 0x3d, 0xee, 0x4c, 0x95, 0x0b, 0x42, 0xfa, 0xc3, 0x4e,
      0x08, 0x2e, 0xa1, 0x66, 0x28, 0xd9, 0x24, 0xb2, 0x76, 0x5b, 0xa2, 0x49, 0x6d, 0x8b, 0xd1, 0x25,
      0x72, 0xf8, 0xf6, 0x64, 0x86, 0x68, 0x98, 0x16, 0xd4, 0xa4, 0x5c, 0xcc, 0x5d, 0x65, 0xb6, 0x92,
      0x6c, 0x70, 0x48, 0x50, 0xfd, 0xed, 0xb9, 0xda, 0x5e, 0x15, 0x46, 0x57, 0xa7, 0x8d, 0x9d, 0x84,
      0x90, 0xd8, 0xab, 0x00, 0x8c, 0xbc, 0xd3, 0x0a, 0xf7, 0xe4, 0x58, 0x05, 0xb8, 0xb3, 0x45, 0x06,
      0xd0, 0x2c, 0x1e, 0x8f, 0xca, 0x3f, 0x0f, 0x02, 0xc1, 0xaf, 0xbd, 0x03, 0x01, 0x13, 0x8a, 0x6b,
      0x3a, 0x91, 0x11, 0x41, 0x4f, 0x67, 0xdc, 0xea, 0x97, 0xf2, 0xcf, 0xce, 0xf0, 0xb4, 0xe6, 0x73,
      0x96, 0xac, 0x74, 0x22, 0xe7, 0xad, 0x35, 0x85, 0xe2, 0xf9, 0x37, 0xe8, 0x1c, 0x75, 0xdf, 0x6e,
      0x47, 0xf1, 0x1a, 0x71, 0x1d, 0x29, 0xc5, 0x89, 0x6f, 0xb7, 0x62, 0x0e, 0xaa, 0x18, 0xbe, 0x1b,
      0xfc, 0x56, 0x3e, 0x4b, 0xc6, 0xd2, 0x79, 0x20, 0x9a, 0xdb, 0xc0, 0xfe, 0x78, 0xcd, 0x5a, 0xf4,
      0x1f, 0xdd, 0xa8, 0x33, 0x88, 0x07, 0xc7, 0x31, 0xb1, 0x12, 0x10, 0x59, 0x27, 0x80, 0xec, 0x5f,
      0x60, 0x51, 0x7f, 0xa9, 0x19, 0xb5, 0x4a, 0x0d, 0x2d, 0xe5, 0x7a, 0x9f, 0x93, 0xc9, 0x9c, 0xef,
      0xa0, 0xe0, 0x3b, 0x4d, 0xae, 0x2a, 0xf5, 0xb0, 0xc8, 0xeb, 0xbb, 0x3c, 0x83, 0x53, 0x99, 0x61,
      0x17, 0x2b, 0x04, 0x7e, 0xba, 0x77, 0xd6, 0x26, 0xe1, 0x69, 0x14, 0x63, 0x55, 0x21, 0x0c, 0x7d
    ];

    // 密钥扩展
    const roundKeys = this.aesKeyExpansion(key);
    
    // 初始轮密钥加（使用最后一轮密钥）
    let state = this.xorBlocks(block, roundKeys[10]);
    
    // 9 轮逆向主循环
    for (let round = 9; round >= 1; round--) {
      // InvShiftRows
      state = this.aesInvShiftRows(state);
      // InvSubBytes
      state = state.map(b => INV_SBOX[b]);
      // AddRoundKey
      state = this.xorBlocks(state, roundKeys[round]);
      // InvMixColumns（第一轮不执行）
      if (round > 1) {
        state = this.aesInvMixColumns(state);
      }
    }
    
    // 最终逆向轮
    state = this.aesInvShiftRows(state);
    state = state.map(b => INV_SBOX[b]);
    state = this.xorBlocks(state, roundKeys[0]);
    
    return state;
  }

  /**
   * AES 密钥扩展
   */
  private aesKeyExpansion(key: number[]): number[][] {
    const RCON = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];
    const SBOX = [
      0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
      0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
      0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
      0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
      0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
      0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
      0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
      0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
      0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
      0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
      0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
      0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
      0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
      0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
      0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
      0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
    ];

    const roundKeys: number[][] = [];
    
    // 前 4 个字直接来自密钥
    for (let i = 0; i < 4; i++) {
      roundKeys[i] = key.slice(i * 4, (i + 1) * 4);
    }
    
    // 扩展剩余的轮密钥
    for (let i = 4; i < 44; i++) {
      let temp = roundKeys[i - 1].slice();
      
      if (i % 4 === 0) {
        // RotWord
        temp = [temp[1], temp[2], temp[3], temp[0]];
        // SubWord
        temp = temp.map(b => SBOX[b]);
        // XOR with Rcon
        temp[0] ^= RCON[i / 4 - 1];
      }
      
      roundKeys[i] = roundKeys[i - 4].map((b, j) => b ^ temp[j]);
    }
    
    // 将 44 个字转换为 11 个 16 字节的轮密钥
    const result: number[][] = [];
    for (let round = 0; round <= 10; round++) {
      const roundKey: number[] = [];
      for (let word = 0; word < 4; word++) {
        roundKey.push(...roundKeys[round * 4 + word]);
      }
      result.push(roundKey);
    }
    
    return result;
  }

  /**
   * AES ShiftRows
   */
  private aesShiftRows(state: number[]): number[] {
    // 状态矩阵（4x4，按列排列）
    // [0, 4, 8, 12]
    // [1, 5, 9, 13]
    // [2, 6, 10, 14]
    // [3, 7, 11, 15]
    return [
      state[0], state[5], state[10], state[15],
      state[4], state[9], state[14], state[3],
      state[8], state[13], state[2], state[7],
      state[12], state[1], state[6], state[11]
    ];
  }

  /**
   * AES InvShiftRows
   */
  private aesInvShiftRows(state: number[]): number[] {
    return [
      state[0], state[13], state[10], state[7],
      state[4], state[1], state[14], state[11],
      state[8], state[5], state[2], state[15],
      state[12], state[9], state[6], state[3]
    ];
  }

  /**
   * AES MixColumns
   */
  private aesMixColumns(state: number[]): number[] {
    const result: number[] = [];
    for (let col = 0; col < 4; col++) {
      const c = [state[col * 4], state[col * 4 + 1], state[col * 4 + 2], state[col * 4 + 3]];
      result[col * 4] = this.gmul(2, c[0]) ^ this.gmul(3, c[1]) ^ c[2] ^ c[3];
      result[col * 4 + 1] = c[0] ^ this.gmul(2, c[1]) ^ this.gmul(3, c[2]) ^ c[3];
      result[col * 4 + 2] = c[0] ^ c[1] ^ this.gmul(2, c[2]) ^ this.gmul(3, c[3]);
      result[col * 4 + 3] = this.gmul(3, c[0]) ^ c[1] ^ c[2] ^ this.gmul(2, c[3]);
    }
    return result;
  }

  /**
   * AES InvMixColumns
   */
  private aesInvMixColumns(state: number[]): number[] {
    const result: number[] = [];
    for (let col = 0; col < 4; col++) {
      const c = [state[col * 4], state[col * 4 + 1], state[col * 4 + 2], state[col * 4 + 3]];
      result[col * 4] = this.gmul(14, c[0]) ^ this.gmul(11, c[1]) ^ this.gmul(13, c[2]) ^ this.gmul(9, c[3]);
      result[col * 4 + 1] = this.gmul(9, c[0]) ^ this.gmul(14, c[1]) ^ this.gmul(11, c[2]) ^ this.gmul(13, c[3]);
      result[col * 4 + 2] = this.gmul(13, c[0]) ^ this.gmul(9, c[1]) ^ this.gmul(14, c[2]) ^ this.gmul(11, c[3]);
      result[col * 4 + 3] = this.gmul(11, c[0]) ^ this.gmul(13, c[1]) ^ this.gmul(9, c[2]) ^ this.gmul(14, c[3]);
    }
    return result;
  }

  /**
   * AES Galois Field 乘法
   */
  private gmul(a: number, b: number): number {
    let p = 0;
    for (let i = 0; i < 8; i++) {
      if ((b & 1) !== 0) {
        p ^= a;
      }
      const hiBitSet = (a & 0x80) !== 0;
      a = (a << 1) & 0xff;
      if (hiBitSet) {
        a ^= 0x1b;
      }
      b >>= 1;
    }
    return p;
  }

  /**
   * XOR 两个块
   */
  private xorBlocks(a: number[], b: number[]): number[] {
    return a.map((v, i) => v ^ b[i]);
  }

  /**
   * PKCS7 填充
   */
  private pkcs7Pad(data: number[], blockSize: number): number[] {
    const padLen = blockSize - (data.length % blockSize);
    const padded = [...data];
    for (let i = 0; i < padLen; i++) {
      padded.push(padLen);
    }
    return padded;
  }

  /**
   * PKCS7 填充移除
   */
  private pkcs7Unpad(data: number[]): number[] {
    const padLen = data[data.length - 1];
    if (padLen > 16 || padLen === 0) {
      throw new Error("Invalid padding");
    }
    return data.slice(0, data.length - padLen);
  }

  /**
   * 字符串转字节数组
   */
  private stringToBytes(str: string): number[] {
    const bytes: number[] = [];
    for (let i = 0; i < str.length; i++) {
      bytes.push(str.charCodeAt(i));
    }
    return bytes;
  }

  /**
   * 字节数组转字符串
   */
  private bytesToString(bytes: number[]): string {
    return bytes.map(b => String.fromCharCode(b)).join('');
  }

  /**
   * 字节数组转 Base64
   */
  private bytesToBase64(bytes: number[]): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    for (let i = 0; i < bytes.length; i += 3) {
      const b1 = bytes[i];
      const b2 = i + 1 < bytes.length ? bytes[i + 1] : 0;
      const b3 = i + 2 < bytes.length ? bytes[i + 2] : 0;
      result += chars[b1 >> 2];
      result += chars[((b1 & 3) << 4) | (b2 >> 4)];
      result += i + 1 < bytes.length ? chars[((b2 & 15) << 2) | (b3 >> 6)] : '=';
      result += i + 2 < bytes.length ? chars[b3 & 63] : '=';
    }
    return result;
  }

  /**
   * Base64 转字节数组
   */
  private base64ToBytes(base64: string): number[] {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const bytes: number[] = [];
    for (let i = 0; i < base64.length; i += 4) {
      const c1 = chars.indexOf(base64[i]);
      const c2 = chars.indexOf(base64[i + 1]);
      const c3 = base64[i + 2] === '=' ? 0 : chars.indexOf(base64[i + 2]);
      const c4 = base64[i + 3] === '=' ? 0 : chars.indexOf(base64[i + 3]);
      bytes.push((c1 << 2) | (c2 >> 4));
      if (base64[i + 2] !== '=') {
        bytes.push(((c2 & 15) << 4) | (c3 >> 2));
      }
      if (base64[i + 3] !== '=') {
        bytes.push(((c3 & 3) << 6) | c4);
      }
    }
    return bytes;
  }

  /**
   * 数据脱敏 - 手机号
   * @param phone 手机号
   * @returns string 脱敏后的手机号
   */
  maskPhone(phone: string): string {
    if (!phone || phone.length < 11) {
      return phone;
    }
    return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
  }

  /**
   * 数据脱敏 - 身份证号
   * @param idCard 身份证号
   * @returns string 脱敏后的身份证号
   */
  maskIdCard(idCard: string): string {
    if (!idCard || idCard.length < 15) {
      return idCard;
    }
    return `${idCard.slice(0, 3)}************${idCard.slice(-3)}`;
  }

  /**
   * 数据脱敏 - 银行卡号
   * @param bankCard 银行卡号
   * @returns string 脱敏后的银行卡号
   */
  maskBankCard(bankCard: string): string {
    if (!bankCard || bankCard.length < 10) {
      return bankCard;
    }
    return bankCard.replace(/(\d{4})\d+(\d{4})/, "$1****$2");
  }

  /**
   * 数据脱敏 - 邮箱
   * @param email 邮箱
   * @returns string 脱敏后的邮箱
   */
  maskEmail(email: string): string {
    if (!email || !email.includes("@")) {
      return email;
    }
    const [localPart, domain] = email.split("@");
    const maskedLocal =
      localPart.length > 2
        ? localPart[0] +
          "*".repeat(Math.max(6, localPart.length - 2)) +
          localPart[localPart.length - 1]
        : localPart;
    return `${maskedLocal}@${domain}`;
  }

  /**
   * 数据脱敏 - 姓名
   * @param name 姓名
   * @returns string 脱敏后的姓名
   */
  maskName(name: string): string {
    if (!name || name.length < 2) {
      return name;
    }
    return name[0] + "*".repeat(Math.min(name.length - 1, 2));
  }

  /**
   * 脱敏对象中的敏感字段
   * @param data 原始数据
   * @param fields 要脱敏的字段
   * @returns Record<string, unknown> 脱敏后的数据
   */
  maskSensitiveData<T extends Record<string, unknown>>(
    data: T,
    fields: (keyof T)[],
  ): T {
    const masked = { ...data } as T;

    for (const field of fields) {
      if (masked[field] && typeof masked[field] === "string") {
        const value = masked[field] as string;
        let maskedValue = value;

        if (field === "phone" || String(field).includes("phone")) {
          maskedValue = this.maskPhone(value);
        } else if (
          field === "idCard" ||
          field === "id_number" ||
          String(field).includes("idCard")
        ) {
          maskedValue = this.maskIdCard(value);
        } else if (
          field === "bankCard" ||
          field === "card_number" ||
          String(field).includes("bank")
        ) {
          maskedValue = this.maskBankCard(value);
        } else if (field === "email") {
          maskedValue = this.maskEmail(value);
        } else if (
          field === "name" ||
          field === "realName" ||
          String(field).includes("name")
        ) {
          maskedValue = this.maskName(value);
        }

        Object.assign(masked, { [field]: maskedValue });
      }
    }

    return masked;
  }

  /**
   * 安全存储敏感数据
   * 安全修复: 使用真正的 AES 加密
   * @param key 存储键
   * @param data 敏感数据
   */
  secureStore(key: string, data: Record<string, unknown>): void {
    try {
      const encrypted = this.encrypt(data);
      if (typeof wx !== "undefined") {
        wx.setStorageSync(`${this.KEY_CACHE_PREFIX}${key}`, encrypted);
      }
    } catch (error) {
      // 安全修复: 不在日志中泄露敏感数据
      console.error("[SecurityUtil] 安全存储失败");
    }
  }

  /**
   * 安全读取敏感数据
   * 安全修复: 使用真正的 AES 解密
   * @param key 存储键
   * @returns Record<string, unknown> | null 敏感数据
   */
  secureRead<T = Record<string, unknown>>(key: string): T | null {
    try {
      if (typeof wx !== "undefined") {
        const encrypted = wx.getStorageSync(`${this.KEY_CACHE_PREFIX}${key}`);
        if (!encrypted || typeof encrypted !== "string") {
          return null;
        }
        return this.decrypt(encrypted) as T;
      }
      return null;
    } catch (error) {
      // 安全修复: 不在日志中泄露敏感数据
      console.error("[SecurityUtil] 安全读取失败");
      return null;
    }
  }

  /**
   * 清除安全存储
   * @param key 存储键
   */
  secureRemove(key: string): void {
    try {
      if (typeof wx !== "undefined") {
        wx.removeStorageSync(`${this.KEY_CACHE_PREFIX}${key}`);
      }
    } catch (error) {
      console.error("[SecurityUtil] 安全清除失败");
    }
  }

  /**
   * 清除所有安全存储
   */
  secureClear(): void {
    try {
      if (typeof wx !== "undefined") {
        const info = wx.getStorageInfoSync();
        for (const key of info.keys) {
          if (key.startsWith(this.KEY_CACHE_PREFIX)) {
            wx.removeStorageSync(key);
          }
        }
      }
    } catch (error) {
      console.error("[SecurityUtil] 安全清除全部失败");
    }
  }
}

const securityUtil = new SecurityUtil();

export default securityUtil;