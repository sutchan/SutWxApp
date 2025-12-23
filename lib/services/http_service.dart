/**
 * 文件名: http_service.dart
 * 版本号: 1.0.0
 * 更新日期: 2025-12-23
 * 作者: Sut
 * 描述: HTTP请求服务，封装Dio库，处理网络请求、拦截器、错误处理等
 */

import 'package:dio/dio.dart';
import 'package:get/get.dart' as getx;

class HttpService {
  /// Dio实例
  late Dio _dio;
  
  /// 基础URL
  static const String baseUrl = 'https://api.example.com';
  
  /// 单例实例
  static final HttpService _instance = HttpService._internal();
  
  /// 工厂构造函数
  factory HttpService() => _instance;
  
  /// 私有构造函数
  HttpService._internal() {
    _initDio();
  }
  
  /// 初始化Dio
  void _initDio() {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      sendTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));
    
    // 添加请求拦截器
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        // 从本地存储获取token
        final token = getToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onResponse: (response, handler) {
        return handler.next(response);
      },
      onError: (DioException error, handler) {
        // 处理错误
        return handler.next(error);
      },
    ));
  }
  
  /// 从本地存储获取token
  String? getToken() {
    // 使用GetX的存储服务获取token
    return getx.GetStorage().read('authToken');
  }
  
  /// 设置token到本地存储
  void setToken(String token) {
    getx.GetStorage().write('authToken', token);
  }
  
  /// 从本地存储移除token
  void removeToken() {
    getx.GetStorage().remove('authToken');
  }
  
  /// GET请求
  Future<dynamic> get(String path, {Map<String, dynamic>? queryParameters, bool needAuth = true}) async {
    try {
      final response = await _dio.get(path, queryParameters: queryParameters);
      return response.data;
    } catch (error) {
      throw _handleError(error);
    }
  }
  
  /// POST请求
  Future<dynamic> post(String path, dynamic data, {bool needAuth = true}) async {
    try {
      final response = await _dio.post(path, data: data);
      return response.data;
    } catch (error) {
      throw _handleError(error);
    }
  }
  
  /// PUT请求
  Future<dynamic> put(String path, dynamic data, {bool needAuth = true}) async {
    try {
      final response = await _dio.put(path, data: data);
      return response.data;
    } catch (error) {
      throw _handleError(error);
    }
  }
  
  /// DELETE请求
  Future<dynamic> delete(String path, {bool needAuth = true}) async {
    try {
      final response = await _dio.delete(path);
      return response.data;
    } catch (error) {
      throw _handleError(error);
    }
  }
  
  /// 处理错误
  String _handleError(dynamic error) {
    if (error is DioException) {
      if (error.response != null) {
       