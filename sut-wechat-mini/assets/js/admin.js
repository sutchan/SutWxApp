/* SUT微信小程序管理界面JavaScript */

jQuery(document).ready(function($) {
    
    // 设置页面相关功能
    function initSettingsPage() {
        // 设置分组的标签页切换逻辑
        $(document).on('click', '.sut-wechat-mini-settings-tab', function() {
            var tab = $(this);
            var sectionId = tab.data('section');
            var navContainer = tab.closest('.sut-wechat-mini-settings-nav');
            var contentContainer = navContainer.siblings('.sut-wechat-mini-settings-content');
            
            // 移除所有活动状态
            navContainer.find('.sut-wechat-mini-settings-tab').removeClass('active');
            contentContainer.find('.sut-wechat-mini-settings-section').removeClass('active');
            
            // 添加当前活动状态
            tab.addClass('active');
            contentContainer.find('#sut-wechat-mini-section-' + sectionId).addClass('active');
            
            // 存储当前活动标签到本地存储
            localStorage.setItem('sut-wechat-mini-active-section', sectionId);
            
            // 触发自定义事件
            $(document).trigger('sut-wechat-mini-settings-tab-changed', [sectionId]);
        });
        
        // 表单提交处理
        $('#sut-wechat-mini-settings-form').on('submit', function(e) {
            // e.preventDefault(); // 不阻止默认提交，让WordPress处理表单提交
            
            var form = $(this);
            var submitButton = form.find('input[type="submit"]');
            var saveStatus = form.find('.sut-wechat-mini-save-status');
            
            // 显示保存状态
            saveStatus.text('保存中...').show();
            
            // 禁用提交按钮
            submitButton.prop('disabled', true);
            
            // 30秒后自动启用提交按钮（以防请求超时）
            setTimeout(function() {
                submitButton.prop('disabled', false);
                saveStatus.fadeOut();
            }, 30000);
        });
        
        // 颜色选择器即时预览
        $(document).on('change', '.sut-wechat-mini-color-input', function() {
            var colorInput = $(this);
            var colorValue = colorInput.val();
            var swatch = colorInput.siblings('.sut-wechat-mini-color-swatch');
            
            // 更新颜色预览
            if (swatch.length) {
                swatch.css('background-color', colorValue);
            }
        });
        
        // 添加设置字段悬停效果
        $('.sut-wechat-mini-setting-card').hover(
            function() {
                $(this).find('.sut-wechat-mini-setting-description').stop(true, true).fadeIn(200);
            },
            function() {
                $(this).find('.sut-wechat-mini-setting-description').stop(true, true).fadeOut(200);
            }
        );
        
        // 表单提交后的成功提示
        $(document).ready(function() {
            // 检查URL中是否有成功参数
            if (window.location.search.indexOf('settings-updated=true') !== -1) {
                // 显示成功消息
                var saveStatus = $('#sut-wechat-mini-settings-form .sut-wechat-mini-save-status');
                if (saveStatus.length) {
                    saveStatus.text('保存成功！').css('color', '#28a745').show();
                    
                    // 3秒后隐藏成功消息
                    setTimeout(function() {
                        saveStatus.fadeOut();
                    }, 3000);
                }
            }
        });
        
        // 加载上次活动的标签页
        var activeSection = localStorage.getItem('sut-wechat-mini-active-section');
        if (activeSection && $('.sut-wechat-mini-settings-tab[data-section="' + activeSection + '"]').length) {
            $('.sut-wechat-mini-settings-tab[data-section="' + activeSection + '"]').click();
        } else {
            // 默认激活第一个标签
            $('.sut-wechat-mini-settings-tab:first').click();
        }
    }
    
    // 初始化设置页面功能
    if ($('.sut-wechat-mini-settings-container').length) {
        initSettingsPage();
    }
    
    // 颜色选择器初始化
    $('.sut-wechat-mini-color-picker').wpColorPicker({
        change: function(event, ui) {
            // 颜色变化时的回调
            var color = ui.color.toString();
            var input = $(event.target).closest('.wp-picker-container').find('.sut-wechat-mini-color-picker');
            input.trigger('change');
        },
        clear: function() {
            // 清除颜色时的回调
            var input = $(this).closest('.wp-picker-container').find('.sut-wechat-mini-color-picker');
            input.trigger('change');
        }
    });
    
    // 图片上传功能
    $(document).on('click', '.sut-wechat-mini-upload-image', function(e) {
        e.preventDefault();
        
        var button = $(this);
        var input = button.siblings('input[type="hidden"]');
        var preview = button.siblings('.image-preview');
        var removeButton = button.siblings('.sut-wechat-mini-remove-image');
        
        // 创建媒体上传器
        var frame = wp.media({
            title: '选择图片',
            button: {
                text: '使用图片'
            },
            multiple: false
        });
        
        // 选择图片后的回调
        frame.on('select', function() {
            var attachment = frame.state().get('selection').first().toJSON();
            input.val(attachment.id);
            preview.html('<img src="' + attachment.url + '" style="max-width: 200px; max-height: 200px;" />');
            removeButton.show();
        });
        
        // 打开媒体上传器
        frame.open();
    });
    
    // 移除图片功能
    $(document).on('click', '.sut-wechat-mini-remove-image', function(e) {
        e.preventDefault();
        
        var button = $(this);
        var input = button.siblings('input[type="hidden"]');
        var preview = button.siblings('.image-preview');
        
        input.val('');
        preview.html('');
        button.hide();
    });
    
    // 删除用户确认
    $(document).on('click', '.sut-wechat-mini-delete-user', function(e) {
        e.preventDefault();
        
        var button = $(this);
        var userId = button.data('id');
        
        if (confirm('确定要删除这个用户吗？此操作不可撤销。')) {
            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: 'sut_wechat_mini_delete_user',
                    user_id: userId,
                    _ajax_nonce: sut_wechat_mini_admin.nonce
                },
                beforeSend: function() {
                    button.addClass('sut-wechat-mini-loading');
                    button.text('删除中...');
                },
                success: function(response) {
                    if (response.success) {
                        button.closest('tr').fadeOut(300, function() {
                            $(this).remove();
                            
                            // 检查是否还有用户
                            if ($('.sut-wechat-mini-users-wrapper tbody tr').length === 0) {
                                $('.sut-wechat-mini-users-wrapper').html('<div class="notice notice-info"><p>暂无微信小程序用户</p></div>');
                            }
                        });
                    } else {
                        alert('删除失败：' + response.data.message);
                    }
                },
                error: function() {
                    alert('删除失败，请重试。');
                },
                complete: function() {
                    button.removeClass('sut-wechat-mini-loading');
                    button.text('删除');
                }
            });
        }
    });
    
    // 标签页切换功能
    $(document).on('click', '.sut-wechat-mini-tab-nav', function() {
        var tabNav = $(this);
        var tabId = tabNav.data('tab');
        var tabsContainer = tabNav.closest('.sut-wechat-mini-tabs');
        
        // 移除所有活动状态
        tabsContainer.find('.sut-wechat-mini-tab-nav').removeClass('active');
        tabsContainer.find('.sut-wechat-mini-tab-content').removeClass('active');
        
        // 添加当前活动状态
        tabNav.addClass('active');
        tabsContainer.find('.sut-wechat-mini-tab-content[data-tab="' + tabId + '"]').addClass('active');
        
        // 触发自定义事件
        $(document).trigger('sut-wechat-mini-tab-changed', [tabId]);
    });
    
    // 折叠面板功能
    $(document).on('click', '.sut-wechat-mini-accordion-header', function() {
        var header = $(this);
        var accordionItem = header.closest('.sut-wechat-mini-accordion-item');
        
        // 切换活动状态
        accordionItem.toggleClass('active');
    });
    
    // 切换开关事件
    $(document).on('change', '.sut-wechat-mini-toggle input, .sut-wechat-mini-toggle-btn input', function() {
        var toggle = $(this);
        var checked = toggle.is(':checked');
        var relatedInput = toggle.data('related-input');
        
        // 如果有关联输入，则更新值
        if (relatedInput) {
            $('#' + relatedInput).val(checked ? 1 : 0);
        }
        
        // 触发自定义事件
        $(document).trigger('sut-wechat-mini-toggle-changed', [toggle, checked]);
    });
    
    // 下拉菜单悬停效果
    $('.sut-wechat-mini-dropdown').hover(
        function() {
            $(this).find('.sut-wechat-mini-dropdown-content').stop(true, true).fadeIn(200);
        },
        function() {
            $(this).find('.sut-wechat-mini-dropdown-content').stop(true, true).fadeOut(200);
        }
    );
    
    // 平滑滚动
    $(document).on('click', '.sut-wechat-mini-smooth-scroll', function(e) {
        e.preventDefault();
        
        var target = $(this).attr('href');
        var offset = $(this).data('offset') || 0;
        
        $('html, body').animate({
            scrollTop: $(target).offset().top + offset
        }, 500);
    });
    
    // 数字动画效果
    function animateNumber(element, target, duration) {
        var start = 0;
        var increment = target / (duration / 16);
        var current = start;
        
        var timer = setInterval(function() {
            current += increment;
            if (current >= target) {
                clearInterval(timer);
                current = target;
            }
            
            element.text(Math.floor(current).toLocaleString());
        }, 16);
    }
    
    // 数据统计图表初始化
    function initCharts() {
        if (typeof Chart !== 'undefined') {
            // 用户增长趋势图表
            var usersChartElement = document.getElementById('users-chart');
            if (usersChartElement) {
                // 模拟用户数据
                var userLabels = [];
                var userData = [];
                var today = new Date();
                
                // 生成最近30天的数据
                for (var i = 29; i >= 0; i--) {
                    var date = new Date(today);
                    date.setDate(date.getDate() - i);
                    userLabels.push(date.getMonth() + 1 + '/' + date.getDate());
                    userData.push(Math.floor(Math.random() * 50) + 10);
                }
                
                new Chart(usersChartElement, {
                    type: 'line',
                    data: {
                        labels: userLabels,
                        datasets: [{
                            label: '新用户',
                            data: userData,
                            borderColor: '#0073aa',
                            backgroundColor: 'rgba(0, 115, 170, 0.1)',
                            borderWidth: 2,
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top'
                            },
                            tooltip: {
                                mode: 'index',
                                intersect: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: {
                                    color: 'rgba(0, 0, 0, 0.05)'
                                }
                            },
                            x: {
                                grid: {
                                    display: false
                                }
                            }
                        },
                        interaction: {
                            mode: 'nearest',
                            axis: 'x',
                            intersect: false
                        }
                    }
                });
            }
            
            // 销售额趋势图表
            var salesChartElement = document.getElementById('sales-chart');
            if (salesChartElement) {
                // 模拟销售数据
                var salesLabels = [];
                var salesData = [];
                var today = new Date();
                
                // 生成最近30天的数据
                for (var i = 29; i >= 0; i--) {
                    var date = new Date(today);
                    date.setDate(date.getDate() - i);
                    salesLabels.push(date.getMonth() + 1 + '/' + date.getDate());
                    salesData.push(Math.floor(Math.random() * 5000) + 1000);
                }
                
                new Chart(salesChartElement, {
                    type: 'bar',
                    data: {
                        labels: salesLabels,
                        datasets: [{
                            label: '销售额',
                            data: salesData,
                            backgroundColor: 'rgba(76, 175, 80, 0.6)',
                            borderColor: '#4caf50',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top'
                            },
                            tooltip: {
                                mode: 'index',
                                intersect: false,
                                callbacks: {
                                    label: function(context) {
                                        var label = context.dataset.label || '';
                                        if (label) {
                                            label += ': ';
                                        }
                                        label += '¥' + context.raw.toLocaleString();
                                        return label;
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: {
                                    color: 'rgba(0, 0, 0, 0.05)'
                                },
                                ticks: {
                                    callback: function(value) {
                                        return '¥' + value.toLocaleString();
                                    }
                                }
                            },
                            x: {
                                grid: {
                                    display: false
                                }
                            }
                        }
                    }
                });
            }
        }
    }
    
    // 初始化图表（如果Chart.js可用）
    if (typeof Chart !== 'undefined') {
        initCharts();
    } else {
        // 尝试动态加载Chart.js
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = initCharts;
        document.head.appendChild(script);
    }
    
    // 表格行悬停效果
    $('.sut-wechat-mini-users-wrapper table, .sut-wechat-mini-orders-wrapper table').on('mouseenter', 'tbody tr', function() {
        $(this).addClass('hover');
    }).on('mouseleave', 'tbody tr', function() {
        $(this).removeClass('hover');
    });
    
    // 表单验证
    $('.sut-wechat-mini-form').on('submit', function(e) {
        var form = $(this);
        var isValid = true;
        
        // 检查必填字段
        form.find('[required]').each(function() {
            var field = $(this);
            var value = field.val().trim();
            
            if (value === '') {
                isValid = false;
                field.addClass('error');
                field.siblings('.error-message').show();
            } else {
                field.removeClass('error');
                field.siblings('.error-message').hide();
            }
        });
        
        // 检查邮箱格式
        form.find('input[type="email"]').each(function() {
            var field = $(this);
            var value = field.val().trim();
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (value !== '' && !emailRegex.test(value)) {
                isValid = false;
                field.addClass('error');
                field.siblings('.error-message').text('请输入有效的邮箱地址').show();
            }
        });
        
        // 检查URL格式
        form.find('input[type="url"]').each(function() {
            var field = $(this);
            var value = field.val().trim();
            var urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
            
            if (value !== '' && !urlRegex.test(value)) {
                isValid = false;
                field.addClass('error');
                field.siblings('.error-message').text('请输入有效的URL地址').show();
            }
        });
        
        if (!isValid) {
            e.preventDefault();
            // 滚动到第一个错误字段
            form.find('.error:first').focus();
        }
    });
    
    // 输入框实时验证
    $('.sut-wechat-mini-form input, .sut-wechat-mini-form textarea, .sut-wechat-mini-form select').on('input change', function() {
        var field = $(this);
        var value = field.val().trim();
        
        // 清除错误状态
        field.removeClass('error');
        field.siblings('.error-message').hide();
        
        // 验证必填字段
        if (field.attr('required') && value === '') {
            field.addClass('error');
            field.siblings('.error-message').text('此字段为必填项').show();
        }
        
        // 验证邮箱
        if (field.attr('type') === 'email' && value !== '') {
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                field.addClass('error');
                field.siblings('.error-message').text('请输入有效的邮箱地址').show();
            }
        }
        
        // 验证URL
        if (field.attr('type') === 'url' && value !== '') {
            var urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
            if (!urlRegex.test(value)) {
                field.addClass('error');
                field.siblings('.error-message').text('请输入有效的URL地址').show();
            }
        }
    });
    
    // AJAX加载更多内容
    $(document).on('click', '.sut-wechat-mini-load-more', function(e) {
        e.preventDefault();
        
        var button = $(this);
        var container = button.closest('.sut-wechat-mini-load-more-container');
        var loading = container.find('.sut-wechat-mini-loading');
        var page = button.data('page') || 1;
        var action = button.data('action') || '';
        var nonce = button.data('nonce') || '';
        
        // 显示加载状态
        button.hide();
        loading.show();
        
        // 发送AJAX请求
        $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: {
                action: action,
                page: page,
                _ajax_nonce: nonce
            },
            success: function(response) {
                if (response.success && response.data.html) {
                    // 添加新内容
                    container.before(response.data.html);
                    
                    // 更新页码
                    button.data('page', page + 1);
                    
                    // 如果没有更多内容，则隐藏加载更多按钮
                    if (!response.data.has_more) {
                        button.remove();
                    } else {
                        button.show();
                    }
                } else {
                    // 如果没有更多内容，则隐藏加载更多按钮
                    button.remove();
                }
            },
            error: function() {
                // 显示错误消息
                container.after('<div class="notice notice-error"><p>加载失败，请重试。</p></div>');
                button.show();
            },
            complete: function() {
                // 隐藏加载状态
                loading.hide();
            }
        });
    });
    
    // 搜索功能
    $(document).on('keyup', '.sut-wechat-mini-search input', function(e) {
        // 按下Enter键时执行搜索
        if (e.key === 'Enter') {
            $(this).closest('.sut-wechat-mini-search').find('.search-button').click();
        }
    });
    
    $(document).on('click', '.sut-wechat-mini-search .search-button', function() {
        var searchInput = $(this).closest('.sut-wechat-mini-search').find('input');
        var searchValue = searchInput.val().trim();
        
        if (searchValue) {
            // 执行搜索
            $(document).trigger('sut-wechat-mini-search', [searchValue]);
        }
    });
    
    // 复制到剪贴板功能
    $(document).on('click', '.sut-wechat-mini-copy-to-clipboard', function() {
        var button = $(this);
        var text = button.data('text') || '';
        var originalText = button.text();
        
        // 创建临时文本区域
        var tempInput = $('<input>');
        $('body').append(tempInput);
        tempInput.val(text).select();
        
        // 复制文本
        try {
            document.execCommand('copy');
            button.text('已复制！');
            
            // 3秒后恢复按钮文本
            setTimeout(function() {
                button.text(originalText);
            }, 3000);
        } catch (err) {
            console.error('复制失败:', err);
            button.text('复制失败');
            
            // 3秒后恢复按钮文本
            setTimeout(function() {
                button.text(originalText);
            }, 3000);
        }
        
        // 移除临时文本区域
        tempInput.remove();
    });
    
    // 响应式表格处理
    function handleResponsiveTables() {
        if ($(window).width() < 768) {
            $('.sut-wechat-mini-responsive-table').each(function() {
                var table = $(this).find('table');
                var headerCells = table.find('thead th');
                var dataCells = table.find('tbody td');
                
                // 将表头内容添加到数据单元格作为标签
                dataCells.each(function(index) {
                    var cell = $(this);
                    var headerIndex = index % headerCells.length;
                    var headerText = headerCells.eq(headerIndex).text().trim();
                    
                    cell.attr('data-label', headerText);
                });
            });
        } else {
            // 移除响应式标签
            $('.sut-wechat-mini-responsive-table td[data-label]').removeAttr('data-label');
        }
    }
    
    // 初始化响应式表格
    handleResponsiveTables();
    
    // 窗口调整大小时重新处理响应式表格
    $(window).on('resize', handleResponsiveTables);
    
    // 显示通知消息
    window.sutWechatMiniShowNotice = function(type, message, duration) {
        type = type || 'info';
        duration = duration || 5000;
        
        // 创建通知元素
        var notice = $('<div class="sut-wechat-mini-notice sut-wechat-mini-fade-in ' + type + '"><p>' + message + '</p></div>');
        
        // 添加到页面
        $('body').append(notice);
        
        // 自动关闭通知
        setTimeout(function() {
            notice.fadeOut(300, function() {
                $(this).remove();
            });
        }, duration);
        
        return notice;
    };
    
    // 显示加载覆盖层
    window.sutWechatMiniShowLoading = function() {
        // 检查是否已存在加载覆盖层
        if ($('.sut-wechat-mini-loading-overlay').length === 0) {
            var overlay = $('<div class="sut-wechat-mini-loading-overlay"><div class="sut-wechat-mini-loading"></div></div>');
            $('body').append(overlay);
        }
        
        return $('.sut-wechat-mini-loading-overlay');
    };
    
    // 隐藏加载覆盖层
    window.sutWechatMiniHideLoading = function() {
        $('.sut-wechat-mini-loading-overlay').fadeOut(300, function() {
            $(this).remove();
        });
    };
    
    // 监听标签页切换事件
    $(document).on('sut-wechat-mini-tab-changed', function(event, tabId) {
        // 这里可以添加标签页切换后的自定义处理逻辑
        console.log('标签页切换到:', tabId);
    });
    
    // 监听切换开关变化事件
    $(document).on('sut-wechat-mini-toggle-changed', function(event, toggle, checked) {
        // 这里可以添加切换开关变化后的自定义处理逻辑
        console.log('切换开关状态变为:', checked);
    });
    
    // 监听搜索事件
    $(document).on('sut-wechat-mini-search', function(event, searchValue) {
        // 这里可以添加搜索逻辑
        console.log('搜索关键词:', searchValue);
    });
    
    // 数字输入框限制
    $(document).on('keypress', 'input[type="number"]', function(e) {
        // 只允许输入数字和控制键
        if (e.which !== 8 && e.which !== 0 && (e.which < 48 || e.which > 57)) {
            return false;
        }
    });
    
    // 防止表单重复提交
    $('.sut-wechat-mini-form').on('submit', function() {
        var form = $(this);
        var submitButton = form.find('input[type="submit"], button[type="submit"]');
        
        // 禁用提交按钮
        submitButton.prop('disabled', true);
        submitButton.addClass('sut-wechat-mini-loading');
        submitButton.val('提交中...');
        
        // 30秒后自动启用提交按钮（以防请求超时）
        setTimeout(function() {
            submitButton.prop('disabled', false);
            submitButton.removeClass('sut-wechat-mini-loading');
            submitButton.val('提交');
        }, 30000);
    });
    
});