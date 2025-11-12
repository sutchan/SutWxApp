/**
 * SUT微信小程序管理后台脚本
 * 重新构建的管理界面交互脚本
 */

jQuery(document).ready(function($) {
    
    /**
     * 初始化设置页面
     */
    function initSettingsPage() {
        // 标签页切换功能
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
            
            // 保存当前活动的标签页到本地存储
            localStorage.setItem('sut-wechat-mini-active-section', sectionId);
            
            // 触发标签页切换事件
            $(document).trigger('sut-wechat-mini-settings-tab-changed', [sectionId]);
        });
        
        // 表单提交处理
        $(document).on('submit', '.sut-wechat-mini-settings-form', function(e) {
            var form = $(this);
            var submitButton = form.find('input[type="submit"]');
            var saveStatus = form.find('.sut-wechat-mini-save-status');
            
            // 禁用提交按钮并显示加载状态
            submitButton.prop('disabled', true);
            submitButton.addClass('loading');
            
            // 设置超时处理
            setTimeout(function() {
                submitButton.prop('disabled', false);
                submitButton.removeClass('loading');
                saveStatus.fadeOut();
            }, 30000);
        });
        
        // 颜色选择器处理
        $(document).on('input change', '.sut-wechat-mini-color-picker', function() {
            var colorInput = $(this);
            var colorValue = colorInput.val();
            var swatch = colorInput.siblings('.sut-wechat-mini-color-swatch');
            
            if (swatch.length && colorValue) {
                swatch.css('background-color', colorValue);
            }
        });
        
        // 检查URL参数，如果有设置更新成功标记则显示成功消息
        if (window.location.search.indexOf('settings-updated=true') !== -1) {
            var saveStatus = $('.sut-wechat-mini-save-status');
            if (saveStatus.length) {
                saveStatus.text('设置已成功保存！').css('color', '#28a745').show();
                
                // 3秒后隐藏消息
                setTimeout(function() {
                    saveStatus.fadeOut();
                }, 3000);
            }
        }
        
        // 从本地存储恢复上次活动的标签页
        var activeSection = localStorage.getItem('sut-wechat-mini-active-section');
        if (activeSection && $('.sut-wechat-mini-settings-tab[data-section="' + activeSection + '"]').length) {
            $('.sut-wechat-mini-settings-tab[data-section="' + activeSection + '"]').click();
        } else {
            // 默认激活第一个标签页
            $('.sut-wechat-mini-settings-tab:first').click();
        }
    }
    
    /**
     * 初始化图片上传功能
     */
    function initImageUpload() {
        var mediaFrame;
        
        $(document).on('click', '.sut-wechat-mini-upload-image', function(e) {
            e.preventDefault();
            
            var button = $(this);
            var input = button.siblings('input[type="hidden"]');
            var preview = button.siblings('.image-preview');
            var removeButton = button.siblings('.sut-wechat-mini-remove-image');
            
            // 如果mediaFrame已存在则销毁
            if (mediaFrame) {
                mediaFrame.remove();
            }
            
            // 创建新的mediaFrame
            mediaFrame = wp.media.frames.media_frame = wp.media({
                title: '选择或上传图片',
                button: {
                    text: '使用此图片'
                },
                multiple: false
            });
            
            // 选择图片后的回调
            mediaFrame.on('select', function() {
                var attachment = mediaFrame.state().get('selection').first().toJSON();
                input.val(attachment.id);
                preview.html('<img src="' + attachment.url + '" style="max-width: 200px; max-height: 200px;" />');
                removeButton.show();
            });
            
            // 打开mediaFrame
            mediaFrame.open();
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
    }
    
    /**
     * 初始化用户管理功能
     */
    function initUserManagement() {
        // 删除用户确认
        $(document).on('click', '.sut-wechat-mini-delete-user', function(e) {
            e.preventDefault();
            
            var button = $(this);
            var userId = button.data('id');
            
            if (confirm('确定要删除这个用户吗？此操作无法撤销。')) {
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'sut_wechat_mini_delete_user',
                        user_id: userId,
                        _ajax_nonce: sut_wechat_mini_admin.nonce
                    },
                    beforeSend: function() {
                        button.addClass('loading');
                    },
                    success: function(response) {
                        if (response.success) {
                            // 移除用户行
                            button.closest('tr').fadeOut(300, function() {
                                $(this).remove();
                            });
                            // 显示成功消息
                            showNotice('用户已成功删除。', 'success');
                        } else {
                            showNotice(response.data.message || '删除用户失败。', 'error');
                        }
                    },
                    complete: function() {
                        button.removeClass('loading');
                    },
                    error: function() {
                        showNotice('网络错误，请稍后重试。', 'error');
                    }
                });
            }
        });
    }
    
    /**
     * 初始化手风琴组件
     */
    function initAccordion() {
        $(document).on('click', '.sut-wechat-mini-accordion-header', function() {
            var header = $(this);
            var accordionItem = header.closest('.sut-wechat-mini-accordion-item');
            var content = accordionItem.find('.sut-wechat-mini-accordion-content');
            
            // 切换内容显示/隐藏
            content.slideToggle(300);
            // 切换活动状态类
            accordionItem.toggleClass('active');
        });
    }
    
    /**
     * 初始化开关组件
     */
    function initToggles() {
        $(document).on('change', '.sut-wechat-mini-toggle', function() {
            var toggle = $(this);
            var checked = toggle.is(':checked');
            var relatedInput = toggle.data('related-input');
            
            if (relatedInput && $('#' + relatedInput).length) {
                $('#' + relatedInput).val(checked ? 1 : 0);
            }
        });
    }
    
    /**
     * 初始化图表
     */
    function initCharts() {
        if (typeof Chart !== 'undefined') {
            // 用户统计图表
            var usersChartElement = document.getElementById('sut-wechat-mini-users-chart');
            if (usersChartElement) {
                var userLabels = [];
                var userData = [];
                var today = new Date();
                
                // 生成最近30天的数据
                for (var i = 29; i >= 0; i--) {
                    var date = new Date(today);
                    date.setDate(date.getDate() - i);
                    userLabels.push(date.getMonth() + 1 + '/' + date.getDate());
                    userData.push(Math.floor(Math.random() * 50) + 10); // 模拟数据
                }
                
                new Chart(usersChartElement, {
                    type: 'line',
                    data: {
                        labels: userLabels,
                        datasets: [{
                            label: '新增用户',
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
            
            // 销售统计图表
            var salesChartElement = document.getElementById('sut-wechat-mini-sales-chart');
            if (salesChartElement) {
                var salesLabels = [];
                var salesData = [];
                var today = new Date();
                
                // 生成最近30天的数据
                for (var i = 29; i >= 0; i--) {
                    var date = new Date(today);
                    date.setDate(date.getDate() - i);
                    salesLabels.push(date.getMonth() + 1 + '/' + date.getDate());
                    salesData.push(Math.floor(Math.random() * 5000) + 1000); // 模拟数据
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
                                        return '销售额: ¥' + context.parsed.y.toLocaleString();
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
    
    /**
     * 初始化表单验证
     */
    function initFormValidation() {
        // 表单提交验证
        $(document).on('submit', '.sut-wechat-mini-form', function(e) {
            var form = $(this);
            var isValid = true;
            
            // 验证必填字段
            form.find('.required-field').each(function() {
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
            
            // 验证邮箱字段
            form.find('.email-field').each(function() {
                var field = $(this);
                var value = field.val().trim();
                var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (value !== '' && !emailRegex.test(value)) {
                    isValid = false;
                    field.addClass('error');
                    field.siblings('.error-message').text('请输入有效的邮箱地址').show();
                }
            });
            
            // 验证URL字段
            form.find('.url-field').each(function() {
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
                scrollToFirstError(form);
            }
        });
        
        // 实时字段验证
        $(document).on('input', '.sut-wechat-mini-form input, .sut-wechat-mini-form textarea', function() {
            var field = $(this);
            var value = field.val().trim();
            
            // 清除错误状态
            field.siblings('.error-message').hide();
            
            // 验证必填字段
            if (field.hasClass('required-field') && value === '') {
                field.addClass('error');
                field.siblings('.error-message').text('此字段为必填项').show();
            } else if (field.hasClass('required-field')) {
                field.removeClass('error');
            }
            
            // 验证邮箱字段
            if (field.hasClass('email-field')) {
                var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    field.addClass('error');
                    field.siblings('.error-message').text('请输入有效的邮箱地址').show();
                } else {
                    field.removeClass('error');
                }
            }
            
            // 验证URL字段
            if (field.hasClass('url-field')) {
                var urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
                if (!urlRegex.test(value)) {
                    field.addClass('error');
                    field.siblings('.error-message').text('请输入有效的URL地址').show();
                } else {
                    field.removeClass('error');
                }
            }
        });
    }
    
    /**
     * 滚动到第一个错误字段
     */
    function scrollToFirstError(form) {
        var firstError = form.find('.error-field').first();
        if (firstError.length) {
            $('html, body').animate({
                scrollTop: firstError.offset().top - 100
            }, 500);
        }
    }
    
    /**
     * 初始化加载更多功能
     */
    function initLoadMore() {
        $(document).on('click', '.sut-wechat-mini-load-more', function(e) {
            e.preventDefault();
            
            var button = $(this);
            var container = button.closest('.sut-wechat-mini-load-more-container');
            var loading = container.find('.sut-wechat-mini-loading');
            var page = button.data('page') || 1;
            var action = button.data('action') || '';
            var nonce = button.data('nonce') || '';
            
            // 显示加载状态
            loading.show();
            
            // 发送AJAX请求加载更多数据
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
                        // 插入新数据
                        container.before(response.data.html);
                        
                        // 更新页码
                        button.data('page', page + 1);
                        
                        // 如果没有更多数据，隐藏加载更多按钮
                        if (!response.data.has_more) {
                            button.hide();
                        }
                    } else {
                        // 显示错误消息
                        showNotice(response.data.message || '加载失败', 'error');
                    }
                },
                complete: function() {
                    // 隐藏加载状态
                    loading.hide();
                },
                error: function() {
                    // 显示错误消息
                    showNotice('网络错误，请稍后重试', 'error');
                    loading.hide();
                }
            });
        });
    }
    
    /**
     * 初始化搜索功能
     */
    function initSearch() {
        // 回车键搜索
        $(document).on('keypress', '.sut-wechat-mini-search input[type="search"]', function(e) {
            if (e.which === 13) {
                e.preventDefault();
                $(this).closest('.sut-wechat-mini-search').find('.search-button').click();
            }
        });
        
        // 搜索按钮点击
        $(document).on('click', '.sut-wechat-mini-search .search-button', function() {
            var button = $(this);
            var searchInput = button.closest('.sut-wechat-mini-search').find('input[type="search"]');
            var searchQuery = searchInput.val().trim();
            var action = button.data('action') || '';
            var nonce = button.data('nonce') || '';
            var resultsContainer = $(button.data('results-container'));
            var loading = button.closest('.sut-wechat-mini-search').find('.sut-wechat-mini-loading');
            
            // 显示加载状态
            loading.show();
            
            // 发送搜索请求
            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: action,
                    search: searchQuery,
                    _ajax_nonce: nonce
                },
                success: function(response) {
                    if (response.success) {
                        resultsContainer.html(response.data.html);
                    } else {
                        showNotice(response.data.message || '搜索失败', 'error');
                    }
                },
                complete: function() {
                    loading.hide();
                },
                error: function() {
                    showNotice('网络错误，请稍后重试', 'error');
                    loading.hide();
                }
            });
        });
    }
    
    /**
     * 初始化复制到剪贴板功能
     */
    function initCopyToClipboard() {
        $(document).on('click', '.sut-wechat-mini-copy-button', function() {
            var button = $(this);
            var text = button.data('text') || '';
            var originalText = button.text();
            
            // 创建临时输入元素
            var tempInput = $('<input type="text" style="position: absolute; left: -9999px;" />');
            $('body').append(tempInput);
            tempInput.val(text).select();
            
            try {
                // 执行复制命令
                document.execCommand('copy');
                button.text('已复制！');
                
                // 3秒后恢复原文本
                setTimeout(function() {
                    button.text(originalText);
                }, 3000);
            } catch (err) {
                console.error('复制失败:', err);
                button.text('复制失败');
                
                // 3秒后恢复原文本
                setTimeout(function() {
                    button.text(originalText);
                }, 3000);
            } finally {
                // 清理临时元素
                tempInput.remove();
            }
        });
    }
    
    /**
     * 初始化响应式表格
     */
    function initResponsiveTables() {
        if ($(window).width() < 768) {
            $('.sut-wechat-mini-responsive-table').each(function() {
                var table = $(this);
                var headers = table.find('thead th');
                var rows = table.find('tbody tr');
                
                rows.each(function() {
                    var row = $(this);
                    var cells = row.find('td');
                    
                    cells.each(function(index) {
                        var cell = $(this);
                        var headerText = headers.eq(index).text();
                        cell.attr('data-label', headerText);
                    });
                });
            });
        } else {
            // 移除移动设备上添加的数据标签
            $('.sut-wechat-mini-responsive-table td[data-label]').removeAttr('data-label');
        }
    }
    
    /**
     * 显示通知消息
     */
    function showNotice(message, type) {
        type = type || 'info';
        duration = duration || 5000;
        
        // 创建通知元素
        var notice = $('<div class="sut-wechat-mini-notice sut-wechat-mini-notice-' + type + '">' + message + '</div>');
        
        // 添加到页面
        $('body').append(notice);
        
        // 设置自动隐藏
        setTimeout(function() {
            notice.fadeOut(300, function() {
                notice.remove();
            });
        }, duration);

        return notice;
    }
    
    /**
     * 显示加载遮罩
     */
    function showLoadingOverlay() {
        if ($('.sut-wechat-mini-loading-overlay').length === 0) {
            var overlay = $('<div class="sut-wechat-mini-loading-overlay"><div class="sut-wechat-mini-loading"></div></div>');
            $('body').append(overlay);
        }

        return $('.sut-wechat-mini-loading-overlay');
    }
    
    /**
     * 隐藏加载遮罩
     */
    function hideLoadingOverlay() {
        $('.sut-wechat-mini-loading-overlay').fadeOut(300, function() {
            $(this).remove();
        });
    }
    
    /**
     * 平滑滚动函数
     */
    function animateScroll(element, target, duration) {
        var start = 0;
        var increment = target / (duration / 16);
        var current = start;
        
        var timer = setInterval(function() {
            current += increment;
            if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
                clearInterval(timer);
                current = target;
            }
            
            element.scrollTop = current;
        }, 16);
    }
    
    /**
     * 初始化页面滚动导航
     */
    $(document).on('click', '.sut-wechat-mini-scroll-link', function(e) {
        e.preventDefault();
        
        var target = $(this).attr('href');
        var offset = $(this).data('offset') || 0;
        
        $('html, body').animate({
            scrollTop: $(target).offset().top + offset
        }, 500);
    });
    
    /**
     * 初始化表格行悬停效果
     */
    $(document).on('mouseenter', 'table.sut-wechat-mini-table tbody tr', function() {
        $(this).addClass('hover');
    }).on('mouseleave', 'table.sut-wechat-mini-table tbody tr', function() {
        $(this).removeClass('hover');
    });
    
    /**
     * 防止表单重复提交
     */
    $(document).on('submit', 'form.sut-wechat-mini-form', function() {
        var form = $(this);
        var submitButton = form.find('input[type="submit"], button[type="submit"]');
        
        // 检查是否已经在提交中
        if (submitButton.hasClass('sut-wechat-mini-loading')) {
            return false;
        }
        
        // 添加加载状态
        submitButton.addClass('sut-wechat-mini-loading');
        submitButton.val('保存中...');
        
        // 设置超时，确保按钮最终会恢复
        setTimeout(function() {
            submitButton.prop('disabled', false);
            submitButton.removeClass('sut-wechat-mini-loading');
            submitButton.val('保存设置');
        }, 30000);
    });
    
    // 页面加载完成后初始化各功能模块
    $(window).on('load', function() {
        // 初始化设置页面
        if ($('.sut-wechat-mini-settings').length) {
            initSettingsPage();
        }
        
        // 初始化图片上传
        if ($('.sut-wechat-mini-upload-image').length) {
            initImageUpload();
        }
        
        // 初始化用户管理
        if ($('.sut-wechat-mini-users').length) {
            initUserManagement();
        }
        
        // 初始化手风琴
        if ($('.sut-wechat-mini-accordion').length) {
            initAccordion();
        }
        
        // 初始化开关
        if ($('.sut-wechat-mini-toggle').length) {
            initToggles();
        }
        
        // 初始化表单验证
        if ($('.sut-wechat-mini-form').length) {
            initFormValidation();
        }
        
        // 初始化加载更多
        if ($('.sut-wechat-mini-load-more').length) {
            initLoadMore();
        }
        
        // 初始化搜索
        if ($('.sut-wechat-mini-search').length) {
            initSearch();
        }
        
        // 初始化复制功能
        if ($('.sut-wechat-mini-copy-button').length) {
            initCopyToClipboard();
        }
        
        // 初始化响应式表格
        initResponsiveTables();
        
        // 窗口大小改变时重新初始化响应式表格
        $(window).on('resize', function() {
            initResponsiveTables();
        });
        
        // 初始化图表
        if (typeof Chart !== 'undefined') {
            initCharts();
        } else if ($('#sut-wechat-mini-users-chart, #sut-wechat-mini-sales-chart').length) {
            // 如果Chart.js未加载，动态加载它
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = initCharts;
            document.head.appendChild(script);
        }
    });
});