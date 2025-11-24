/**
 * 文件名: lazyImage.test.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: lazyImage 组件的单元测试
 */

// 模拟微信小程序的 Component 函数
let capturedComponentOptions = null;

global.Component = (options) => {
  capturedComponentOptions = options;
  const instance = {
    properties: options.properties || {},
    data: { ...options.data },
    methods: options.methods || {},
    setData(newData) {
      Object.assign(instance.data, newData);
    }
  };

  // 将 properties 的默认值合并到 data 中
  for (const key in instance.properties) {
    if (instance.properties[key] && instance.properties[key].value !== undefined) {
      instance.data[key] = instance.properties[key].value;
    }
  }

  // 模拟组件的生命周期方法，例如 attached
  if (options.attached) {
    options.attached.call(instance);
  }

  return instance;
};

require('../components/lazyImage/lazyImage');
const lazyImageOptions = capturedComponentOptions;

describe('lazyImage', () => {
  let lazyImageInstance;

  // 验证导入的组件配置是否有效
  it('should import valid component options', () => {
    expect(lazyImageOptions).toBeDefined();
    expect(lazyImageOptions.properties).toBeDefined();
    expect(lazyImageOptions.data).toBeDefined();
    expect(lazyImageOptions.methods).toBeDefined();
  });

  beforeEach(() => {
    // 在每个测试用例之前重新创建组件实例
    lazyImageInstance = global.Component(lazyImageOptions);
  });

  it('should be a valid component object', () => {
    expect(lazyImageInstance).toBeDefined();
    expect(typeof lazyImageInstance).toBe('object');
  });

  it('should have correct default data', () => {
    // 确保 lazyImageInstance.data 包含了 properties 的默认值
    expect(lazyImageInstance.data.src).toBe('');
    expect(lazyImageInstance.data.mode).toBe('aspectFill');
    expect(lazyImageInstance.data.lazyLoad).toBe(true);
    expect(lazyImageInstance.data.show).toBe(false);
  });

  it('should set show to true when onLoad is called', () => {
    lazyImageInstance.methods.onLoad.call(lazyImageInstance);
    expect(lazyImageInstance.data.show).toBe(true);
  });

  it('should trigger image load logic correctly', () => {
    // 模拟 lazyLoad 为 true 的情况
    lazyImageInstance.data.lazyLoad = true;
    lazyImageInstance.methods.onLoad.call(lazyImageInstance);
    expect(lazyImageInstance.data.show).toBe(true);
  });
});
