<?php
/**
 * 文件名: class-sut-wechat-mini-loader.php
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 插件加载器类，负责注册所有的钩子和过滤器
 */

// 防止直接访问
if (!defined('ABSPATH')) {
    exit;
}

/**
 * 插件加载器类
 * 负责注册所有的动作和过滤器钩子
 */
class Sut_WeChat_Mini_Loader {
    
    /**
     * 存储要注册的动作和过滤器
     * @var array
     */
    protected $actions;
    
    /**
     * 存储要注册的过滤器
     * @var array
     */
    protected $filters;
    
    /**
     * 构造函数
     */
    public function __construct() {
        $this->actions = array();
        $this->filters = array();
    }
    
    /**
     * 添加新的动作到集合中
     *
     * @param string $hook_name 动作钩子名称
     * @param object $component 包含回调方法的对象或类
     * @param string $callback 回调方法名称
     * @param int $priority 优先级，默认为10
     * @param int $accepted_args 接受的参数数量，默认为1
     */
    public function add_action($hook_name, $component, $callback, $priority = 10, $accepted_args = 1) {
        $this->actions = $this->add($this->actions, $hook_name, $component, $callback, $priority, $accepted_args);
    }
    
    /**
     * 添加新的过滤器到集合中
     *
     * @param string $hook_name 过滤器钩子名称
     * @param object $component 包含回调方法的对象或类
     * @param string $callback 回调方法名称
     * @param int $priority 优先级，默认为10
     * @param int $accepted_args 接受的参数数量，默认为1
     */
    public function add_filter($hook_name, $component, $callback, $priority = 10, $accepted_args = 1) {
        $this->filters = $this->add($this->filters, $hook_name, $component, $callback, $priority, $accepted_args);
    }
    
    /**
     * 通用的添加方法，用于添加动作和过滤器
     *
     * @param array $hooks 钩子集合
     * @param string $hook_name 钩子名称
     * @param object $component 包含回调方法的对象或类
     * @param string $callback 回调方法名称
     * @param int $priority 优先级
     * @param int $accepted_args 接受的参数数量
     * @return array 更新后的钩子集合
     */
    private function add($hooks, $hook_name, $component, $callback, $priority, $accepted_args) {
        $hooks[] = array(
            'hook'          => $hook_name,
            'component'     => $component,
            'callback'      => $callback,
            'priority'      => $priority,
            'accepted_args' => $accepted_args
        );
        
        return $hooks;
    }
    
    /**
     * 注册存储的动作和过滤器
     */
    public function run() {
        // 注册过滤器
        foreach ($this->filters as $hook) {
            add_filter(
                $hook['hook'],
                array($hook['component'], $hook['callback']),
                $hook['priority'],
                $hook['accepted_args']
            );
        }
        
        // 注册动作
        foreach ($this->actions as $hook) {
            add_action(
                $hook['hook'],
                array($hook['component'], $hook['callback']),
                $hook['priority'],
                $hook['accepted_args']
            );
        }
    }
    
    /**
     * 移除指定的动作
     *
     * @param string $hook_name 动作钩子名称
     * @param object $component 包含回调方法的对象或类
     * @param string $callback 回调方法名称
     * @param int $priority 优先级
     * @return bool 是否成功移除
     */
    public function remove_action($hook_name, $component, $callback, $priority = 10) {
        return remove_action(
            $hook_name,
            array($component, $callback),
            $priority
        );
    }
    
    /**
     * 移除指定的过滤器
     *
     * @param string $hook_name 过滤器钩子名称
     * @param object $component 包含回调方法的对象或类
     * @param string $callback 回调方法名称
     * @param int $priority 优先级
     * @return bool 是否成功移除
     */
    public function remove_filter($hook_name, $component, $callback, $priority = 10) {
        return remove_filter(
            $hook_name,
            array($component, $callback),
            $priority
        );
    }
    
    /**
     * 检查指定的动作是否已注册
     *
     * @param string $hook_name 动作钩子名称
     * @param object $component 包含回调方法的对象或类
     * @param string $callback 回调方法名称
     * @param int $priority 优先级
     * @return bool 是否已注册
     */
    public function has_action($hook_name, $component, $callback, $priority = 10) {
        return has_action(
            $hook_name,
            array($component, $callback),
            $priority
        );
    }
    
    /**
     * 检查指定的过滤器是否已注册
     *
     * @param string $hook_name 过滤器钩子名称
     * @param object $component 包含回调方法的对象或类
     * @param string $callback 回调方法名称
     * @param int $priority 优先级
     * @return bool 是否已注册
     */
    public function has_filter($hook_name, $component, $callback, $priority = 10) {
        return has_filter(
            $hook_name,
            array($component, $callback),
            $priority
        );
    }
    
    /**
     * 获取当前注册的所有动作
     * @return array 动作列表
     */
    public function get_actions() {
        return $this->actions;
    }
    
    /**
     * 获取当前注册的所有过滤器
     * @return array 过滤器列表
     */
    public function get_filters() {
        return $this->filters;
    }
    
    /**
     * 清空所有已注册的动作和过滤器
     */
    public function clear_all() {
        $this->actions = array();
        $this->filters = array();
    }
}