/* SUT寰俊灏忕▼搴忕鐞嗙晫闈avaScript */

jQuery(document).ready(function($) {
    
    // 璁剧疆椤甸潰鐩稿叧鍔熻兘
    function initSettingsPage() {
        // 璁剧疆鍒嗙粍鐨勬爣绛鹃〉鍒囨崲閫昏緫
        $(document).on('click', '.sut-wechat-mini-settings-tab', function() {
            var tab = $(this);
            var sectionId = tab.data('section');
            var navContainer = tab.closest('.sut-wechat-mini-settings-nav');
            var contentContainer = navContainer.siblings('.sut-wechat-mini-settings-content');
            
            // 绉婚櫎鎵€鏈夋椿鍔ㄧ姸鎬?            navContainer.find('.sut-wechat-mini-settings-tab').removeClass('active');
            contentContainer.find('.sut-wechat-mini-settings-section').removeClass('active');
            
            // 娣诲姞褰撳墠娲诲姩鐘舵€?            tab.addClass('active');
            contentContainer.find('#sut-wechat-mini-section-' + sectionId).addClass('active');
            
            // 瀛樺偍褰撳墠娲诲姩鏍囩鍒版湰鍦板瓨鍌?            localStorage.setItem('sut-wechat-mini-active-section', sectionId);
            
            // 瑙﹀彂鑷畾涔変簨浠?            $(document).trigger('sut-wechat-mini-settings-tab-changed', [sectionId]);
        });
        
        // 琛ㄥ崟鎻愪氦澶勭悊
        $('#sut-wechat-mini-settings-form').on('submit', function(e) {
            // e.preventDefault(); // 涓嶉樆姝㈤粯璁ゆ彁浜わ紝璁￤ordPress澶勭悊琛ㄥ崟鎻愪氦
            
            var form = $(this);
            var submitButton = form.find('input[type="submit"]');
            var saveStatus = form.find('.sut-wechat-mini-save-status');
            
            // 鏄剧ず淇濆瓨鐘舵€?            saveStatus.text('淇濆瓨涓?..').show();
            
            // 绂佺敤鎻愪氦鎸夐挳
            submitButton.prop('disabled', true);
            
            // 30绉掑悗鑷姩鍚敤鎻愪氦鎸夐挳锛堜互闃茶姹傝秴鏃讹級
            setTimeout(function() {
                submitButton.prop('disabled', false);
                saveStatus.fadeOut();
            }, 30000);
        });
        
        // 棰滆壊閫夋嫨鍣ㄥ嵆鏃堕瑙?        $(document).on('change', '.sut-wechat-mini-color-input', function() {
            var colorInput = $(this);
            var colorValue = colorInput.val();
            var swatch = colorInput.siblings('.sut-wechat-mini-color-swatch');
            
            // 鏇存柊棰滆壊棰勮
            if (swatch.length) {
                swatch.css('background-color', colorValue);
            }
        });
        
        // 娣诲姞璁剧疆瀛楁鎮仠鏁堟灉
        $('.sut-wechat-mini-setting-card').hover(
            function() {
                $(this).find('.sut-wechat-mini-setting-description').stop(true, true).fadeIn(200);
            },
            function() {
                $(this).find('.sut-wechat-mini-setting-description').stop(true, true).fadeOut(200);
            }
        );
        
        // 琛ㄥ崟鎻愪氦鍚庣殑鎴愬姛鎻愮ず
        $(document).ready(function() {
            // 妫€鏌RL涓槸鍚︽湁鎴愬姛鍙傛暟
            if (window.location.search.indexOf('settings-updated=true') !== -1) {
                // 鏄剧ず鎴愬姛娑堟伅
                var saveStatus = $('#sut-wechat-mini-settings-form .sut-wechat-mini-save-status');
                if (saveStatus.length) {
                    saveStatus.text('淇濆瓨鎴愬姛锛?).css('color', '#28a745').show();
                    
                    // 3绉掑悗闅愯棌鎴愬姛娑堟伅
                    setTimeout(function() {
                        saveStatus.fadeOut();
                    }, 3000);
                }
            }
        });
        
        // 鍔犺浇涓婃娲诲姩鐨勬爣绛鹃〉
        var activeSection = localStorage.getItem('sut-wechat-mini-active-section');
        if (activeSection && $('.sut-wechat-mini-settings-tab[data-section="' + activeSection + '"]').length) {
            $('.sut-wechat-mini-settings-tab[data-section="' + activeSection + '"]').click();
        } else {
            // 榛樿婵€娲荤涓€涓爣绛?            $('.sut-wechat-mini-settings-tab:first').click();
        }
    }
    
    // 鍒濆鍖栬缃〉闈㈠姛鑳?    if ($('.sut-wechat-mini-settings-container').length) {
        initSettingsPage();
    }
    
    // 棰滆壊閫夋嫨鍣ㄥ垵濮嬪寲
    $('.sut-wechat-mini-color-picker').wpColorPicker({
        change: function(event, ui) {
            // 棰滆壊鍙樺寲鏃剁殑鍥炶皟
            var color = ui.color.toString();
            var input = $(event.target).closest('.wp-picker-container').find('.sut-wechat-mini-color-picker');
            input.trigger('change');
        },
        clear: function() {
            // 娓呴櫎棰滆壊鏃剁殑鍥炶皟
            var input = $(this).closest('.wp-picker-container').find('.sut-wechat-mini-color-picker');
            input.trigger('change');
        }
    });
    
    // 鍥剧墖涓婁紶鍔熻兘
    $(document).on('click', '.sut-wechat-mini-upload-image', function(e) {
        e.preventDefault();
        
        var button = $(this);
        var input = button.siblings('input[type="hidden"]');
        var preview = button.siblings('.image-preview');
        var removeButton = button.siblings('.sut-wechat-mini-remove-image');
        
        // 鍒涘缓濯掍綋涓婁紶鍣?        var frame = wp.media({
            title: '閫夋嫨鍥剧墖',
            button: {
                text: '浣跨敤鍥剧墖'
            },
            multiple: false
        });
        
        // 閫夋嫨鍥剧墖鍚庣殑鍥炶皟
        frame.on('select', function() {
            var attachment = frame.state().get('selection').first().toJSON();
            input.val(attachment.id);
            preview.html('<img src="' + attachment.url + '" style="max-width: 200px; max-height: 200px;" />');
            removeButton.show();
        });
        
        // 鎵撳紑濯掍綋涓婁紶鍣?        frame.open();
    });
    
    // 绉婚櫎鍥剧墖鍔熻兘
    $(document).on('click', '.sut-wechat-mini-remove-image', function(e) {
        e.preventDefault();
        
        var button = $(this);
        var input = button.siblings('input[type="hidden"]');
        var preview = button.siblings('.image-preview');
        
        input.val('');
        preview.html('');
        button.hide();
    });
    
    // 鍒犻櫎鐢ㄦ埛纭
    $(document).on('click', '.sut-wechat-mini-delete-user', function(e) {
        e.preventDefault();
        
        var button = $(this);
        var userId = button.data('id');
        
        if (confirm('纭畾瑕佸垹闄よ繖涓敤鎴峰悧锛熸鎿嶄綔涓嶅彲鎾ら攢銆?)) {
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
                    button.text('鍒犻櫎涓?..');
                },
                success: function(response) {
                    if (response.success) {
                        button.closest('tr').fadeOut(300, function() {
                            $(this).remove();
                            
                            // 妫€鏌ユ槸鍚﹁繕鏈夌敤鎴?                            if ($('.sut-wechat-mini-users-wrapper tbody tr').length === 0) {
                                $('.sut-wechat-mini-users-wrapper').html('<div class="notice notice-info"><p>鏆傛棤寰俊灏忕▼搴忕敤鎴?/p></div>');
                            }
                        });
                    } else {
                        alert('鍒犻櫎澶辫触锛? + response.data.message);
                    }
                },
                error: function() {
                    alert('鍒犻櫎澶辫触锛岃閲嶈瘯銆?);
                },
                complete: function() {
                    button.removeClass('sut-wechat-mini-loading');
                    button.text('鍒犻櫎');
                }
            });
        }
    });
    
    // 鏍囩椤靛垏鎹㈠姛鑳?    $(document).on('click', '.sut-wechat-mini-tab-nav', function() {
        var tabNav = $(this);
        var tabId = tabNav.data('tab');
        var tabsContainer = tabNav.closest('.sut-wechat-mini-tabs');
        
        // 绉婚櫎鎵€鏈夋椿鍔ㄧ姸鎬?        tabsContainer.find('.sut-wechat-mini-tab-nav').removeClass('active');
        tabsContainer.find('.sut-wechat-mini-tab-content').removeClass('active');
        
        // 娣诲姞褰撳墠娲诲姩鐘舵€?        tabNav.addClass('active');
        tabsContainer.find('.sut-wechat-mini-tab-content[data-tab="' + tabId + '"]').addClass('active');
        
        // 瑙﹀彂鑷畾涔変簨浠?        $(document).trigger('sut-wechat-mini-tab-changed', [tabId]);
    });
    
    // 鎶樺彔闈㈡澘鍔熻兘
    $(document).on('click', '.sut-wechat-mini-accordion-header', function() {
        var header = $(this);
        var accordionItem = header.closest('.sut-wechat-mini-accordion-item');
        
        // 鍒囨崲娲诲姩鐘舵€?        accordionItem.toggleClass('active');
    });
    
    // 鍒囨崲寮€鍏充簨浠?    $(document).on('change', '.sut-wechat-mini-toggle input, .sut-wechat-mini-toggle-btn input', function() {
        var toggle = $(this);
        var checked = toggle.is(':checked');
        var relatedInput = toggle.data('related-input');
        
        // 濡傛灉鏈夊叧鑱旇緭鍏ワ紝鍒欐洿鏂板€?        if (relatedInput) {
            $('#' + relatedInput).val(checked ? 1 : 0);
        }
        
        // 瑙﹀彂鑷畾涔変簨浠?        $(document).trigger('sut-wechat-mini-toggle-changed', [toggle, checked]);
    });
    
    // 涓嬫媺鑿滃崟鎮仠鏁堟灉
    $('.sut-wechat-mini-dropdown').hover(
        function() {
            $(this).find('.sut-wechat-mini-dropdown-content').stop(true, true).fadeIn(200);
        },
        function() {
            $(this).find('.sut-wechat-mini-dropdown-content').stop(true, true).fadeOut(200);
        }
    );
    
    // 骞虫粦婊氬姩
    $(document).on('click', '.sut-wechat-mini-smooth-scroll', function(e) {
        e.preventDefault();
        
        var target = $(this).attr('href');
        var offset = $(this).data('offset') || 0;
        
        $('html, body').animate({
            scrollTop: $(target).offset().top + offset
        }, 500);
    });
    
    // 鏁板瓧鍔ㄧ敾鏁堟灉
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
    
    // 鏁版嵁缁熻鍥捐〃鍒濆鍖?    function initCharts() {
        if (typeof Chart !== 'undefined') {
            // 鐢ㄦ埛澧為暱瓒嬪娍鍥捐〃
            var usersChartElement = document.getElementById('users-chart');
            if (usersChartElement) {
                // 妯℃嫙鐢ㄦ埛鏁版嵁
                var userLabels = [];
                var userData = [];
                var today = new Date();
                
                // 鐢熸垚鏈€杩?0澶╃殑鏁版嵁
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
                            label: '鏂扮敤鎴?,
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
            
            // 閿€鍞瓒嬪娍鍥捐〃
            var salesChartElement = document.getElementById('sales-chart');
            if (salesChartElement) {
                // 妯℃嫙閿€鍞暟鎹?                var salesLabels = [];
                var salesData = [];
                var today = new Date();
                
                // 鐢熸垚鏈€杩?0澶╃殑鏁版嵁
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
                            label: '閿€鍞',
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
                                        label += '楼' + context.raw.toLocaleString();
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
                                        return '楼' + value.toLocaleString();
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
    
    // 鍒濆鍖栧浘琛紙濡傛灉Chart.js鍙敤锛?    if (typeof Chart !== 'undefined') {
        initCharts();
    } else {
        // 灏濊瘯鍔ㄦ€佸姞杞紺hart.js
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = initCharts;
        document.head.appendChild(script);
    }
    
    // 琛ㄦ牸琛屾偓鍋滄晥鏋?    $('.sut-wechat-mini-users-wrapper table, .sut-wechat-mini-orders-wrapper table').on('mouseenter', 'tbody tr', function() {
        $(this).addClass('hover');
    }).on('mouseleave', 'tbody tr', function() {
        $(this).removeClass('hover');
    });
    
    // 琛ㄥ崟楠岃瘉
    $('.sut-wechat-mini-form').on('submit', function(e) {
        var form = $(this);
        var isValid = true;
        
        // 妫€鏌ュ繀濉瓧娈?        form.find('[required]').each(function() {
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
        
        // 妫€鏌ラ偖绠辨牸寮?        form.find('input[type="email"]').each(function() {
            var field = $(this);
            var value = field.val().trim();
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (value !== '' && !emailRegex.test(value)) {
                isValid = false;
                field.addClass('error');
                field.siblings('.error-message').text('璇疯緭鍏ユ湁鏁堢殑閭鍦板潃').show();
            }
        });
        
        // 妫€鏌RL鏍煎紡
        form.find('input[type="url"]').each(function() {
            var field = $(this);
            var value = field.val().trim();
            var urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
            
            if (value !== '' && !urlRegex.test(value)) {
                isValid = false;
                field.addClass('error');
                field.siblings('.error-message').text('璇疯緭鍏ユ湁鏁堢殑URL鍦板潃').show();
            }
        });
        
        if (!isValid) {
            e.preventDefault();
            // 婊氬姩鍒扮涓€涓敊璇瓧娈?            form.find('.error:first').focus();
        }
    });
    
    // 杈撳叆妗嗗疄鏃堕獙璇?    $('.sut-wechat-mini-form input, .sut-wechat-mini-form textarea, .sut-wechat-mini-form select').on('input change', function() {
        var field = $(this);
        var value = field.val().trim();
        
        // 娓呴櫎閿欒鐘舵€?        field.removeClass('error');
        field.siblings('.error-message').hide();
        
        // 楠岃瘉蹇呭～瀛楁
        if (field.attr('required') && value === '') {
            field.addClass('error');
            field.siblings('.error-message').text('姝ゅ瓧娈典负蹇呭～椤?).show();
        }
        
        // 楠岃瘉閭
        if (field.attr('type') === 'email' && value !== '') {
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                field.addClass('error');
                field.siblings('.error-message').text('璇疯緭鍏ユ湁鏁堢殑閭鍦板潃').show();
            }
        }
        
        // 楠岃瘉URL
        if (field.attr('type') === 'url' && value !== '') {
            var urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
            if (!urlRegex.test(value)) {
                field.addClass('error');
                field.siblings('.error-message').text('璇疯緭鍏ユ湁鏁堢殑URL鍦板潃').show();
            }
        }
    });
    
    // AJAX鍔犺浇鏇村鍐呭
    $(document).on('click', '.sut-wechat-mini-load-more', function(e) {
        e.preventDefault();
        
        var button = $(this);
        var container = button.closest('.sut-wechat-mini-load-more-container');
        var loading = container.find('.sut-wechat-mini-loading');
        var page = button.data('page') || 1;
        var action = button.data('action') || '';
        var nonce = button.data('nonce') || '';
        
        // 鏄剧ず鍔犺浇鐘舵€?        button.hide();
        loading.show();
        
        // 鍙戦€丄JAX璇锋眰
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
                    // 娣诲姞鏂板唴瀹?                    container.before(response.data.html);
                    
                    // 鏇存柊椤电爜
                    button.data('page', page + 1);
                    
                    // 濡傛灉娌℃湁鏇村鍐呭锛屽垯闅愯棌鍔犺浇鏇村鎸夐挳
                    if (!response.data.has_more) {
                        button.remove();
                    } else {
                        button.show();
                    }
                } else {
                    // 濡傛灉娌℃湁鏇村鍐呭锛屽垯闅愯棌鍔犺浇鏇村鎸夐挳
                    button.remove();
                }
            },
            error: function() {
                // 鏄剧ず閿欒娑堟伅
                container.after('<div class="notice notice-error"><p>鍔犺浇澶辫触锛岃閲嶈瘯銆?/p></div>');
                button.show();
            },
            complete: function() {
                // 闅愯棌鍔犺浇鐘舵€?                loading.hide();
            }
        });
    });
    
    // 鎼滅储鍔熻兘
    $(document).on('keyup', '.sut-wechat-mini-search input', function(e) {
        // 鎸変笅Enter閿椂鎵ц鎼滅储
        if (e.key === 'Enter') {
            $(this).closest('.sut-wechat-mini-search').find('.search-button').click();
        }
    });
    
    $(document).on('click', '.sut-wechat-mini-search .search-button', function() {
        var searchInput = $(this).closest('.sut-wechat-mini-search').find('input');
        var searchValue = searchInput.val().trim();
        
        if (searchValue) {
            // 鎵ц鎼滅储
            $(document).trigger('sut-wechat-mini-search', [searchValue]);
        }
    });
    
    // 澶嶅埗鍒板壀璐存澘鍔熻兘
    $(document).on('click', '.sut-wechat-mini-copy-to-clipboard', function() {
        var button = $(this);
        var text = button.data('text') || '';
        var originalText = button.text();
        
        // 鍒涘缓涓存椂鏂囨湰鍖哄煙
        var tempInput = $('<input>');
        $('body').append(tempInput);
        tempInput.val(text).select();
        
        // 澶嶅埗鏂囨湰
        try {
            document.execCommand('copy');
            button.text('宸插鍒讹紒');
            
            // 3绉掑悗鎭㈠鎸夐挳鏂囨湰
            setTimeout(function() {
                button.text(originalText);
            }, 3000);
        } catch (err) {
            console.error('澶嶅埗澶辫触:', err);
            button.text('澶嶅埗澶辫触');
            
            // 3绉掑悗鎭㈠鎸夐挳鏂囨湰
            setTimeout(function() {
                button.text(originalText);
            }, 3000);
        }
        
        // 绉婚櫎涓存椂鏂囨湰鍖哄煙
        tempInput.remove();
    });
    
    // 鍝嶅簲寮忚〃鏍煎鐞?    function handleResponsiveTables() {
        if ($(window).width() < 768) {
            $('.sut-wechat-mini-responsive-table').each(function() {
                var table = $(this).find('table');
                var headerCells = table.find('thead th');
                var dataCells = table.find('tbody td');
                
                // 灏嗚〃澶村唴瀹规坊鍔犲埌鏁版嵁鍗曞厓鏍间綔涓烘爣绛?                dataCells.each(function(index) {
                    var cell = $(this);
                    var headerIndex = index % headerCells.length;
                    var headerText = headerCells.eq(headerIndex).text().trim();
                    
                    cell.attr('data-label', headerText);
                });
            });
        } else {
            // 绉婚櫎鍝嶅簲寮忔爣绛?            $('.sut-wechat-mini-responsive-table td[data-label]').removeAttr('data-label');
        }
    }
    
    // 鍒濆鍖栧搷搴斿紡琛ㄦ牸
    handleResponsiveTables();
    
    // 绐楀彛璋冩暣澶у皬鏃堕噸鏂板鐞嗗搷搴斿紡琛ㄦ牸
    $(window).on('resize', handleResponsiveTables);
    
    // 鏄剧ず閫氱煡娑堟伅
    window.sutWechatMiniShowNotice = function(type, message, duration) {
        type = type || 'info';
        duration = duration || 5000;
        
        // 鍒涘缓閫氱煡鍏冪礌
        var notice = $('<div class="sut-wechat-mini-notice sut-wechat-mini-fade-in ' + type + '"><p>' + message + '</p></div>');
        
        // 娣诲姞鍒伴〉闈?        $('body').append(notice);
        
        // 鑷姩鍏抽棴閫氱煡
        setTimeout(function() {
            notice.fadeOut(300, function() {
                $(this).remove();
            });
        }, duration);
        
        return notice;
    };
    
    // 鏄剧ず鍔犺浇瑕嗙洊灞?    window.sutWechatMiniShowLoading = function() {
        // 妫€鏌ユ槸鍚﹀凡瀛樺湪鍔犺浇瑕嗙洊灞?        if ($('.sut-wechat-mini-loading-overlay').length === 0) {
            var overlay = $('<div class="sut-wechat-mini-loading-overlay"><div class="sut-wechat-mini-loading"></div></div>');
            $('body').append(overlay);
        }
        
        return $('.sut-wechat-mini-loading-overlay');
    };
    
    // 闅愯棌鍔犺浇瑕嗙洊灞?    window.sutWechatMiniHideLoading = function() {
        $('.sut-wechat-mini-loading-overlay').fadeOut(300, function() {
            $(this).remove();
        });
    };
    
    // 鐩戝惉鏍囩椤靛垏鎹簨浠?    $(document).on('sut-wechat-mini-tab-changed', function(event, tabId) {
        // 杩欓噷鍙互娣诲姞鏍囩椤靛垏鎹㈠悗鐨勮嚜瀹氫箟澶勭悊閫昏緫
        console.log('鏍囩椤靛垏鎹㈠埌:', tabId);
    });
    
    // 鐩戝惉鍒囨崲寮€鍏冲彉鍖栦簨浠?    $(document).on('sut-wechat-mini-toggle-changed', function(event, toggle, checked) {
        // 杩欓噷鍙互娣诲姞鍒囨崲寮€鍏冲彉鍖栧悗鐨勮嚜瀹氫箟澶勭悊閫昏緫
        console.log('鍒囨崲寮€鍏崇姸鎬佸彉涓?', checked);
    });
    
    // 鐩戝惉鎼滅储浜嬩欢
    $(document).on('sut-wechat-mini-search', function(event, searchValue) {
        // 杩欓噷鍙互娣诲姞鎼滅储閫昏緫
        console.log('鎼滅储鍏抽敭璇?', searchValue);
    });
    
    // 鏁板瓧杈撳叆妗嗛檺鍒?    $(document).on('keypress', 'input[type="number"]', function(e) {
        // 鍙厑璁歌緭鍏ユ暟瀛楀拰鎺у埗閿?        if (e.which !== 8 && e.which !== 0 && (e.which < 48 || e.which > 57)) {
            return false;
        }
    });
    
    // 闃叉琛ㄥ崟閲嶅鎻愪氦
    $('.sut-wechat-mini-form').on('submit', function() {
        var form = $(this);
        var submitButton = form.find('input[type="submit"], button[type="submit"]');
        
        // 绂佺敤鎻愪氦鎸夐挳
        submitButton.prop('disabled', true);
        submitButton.addClass('sut-wechat-mini-loading');
        submitButton.val('鎻愪氦涓?..');
        
        // 30绉掑悗鑷姩鍚敤鎻愪氦鎸夐挳锛堜互闃茶姹傝秴鏃讹級
        setTimeout(function() {
            submitButton.prop('disabled', false);
            submitButton.removeClass('sut-wechat-mini-loading');
            submitButton.val('鎻愪氦');
        }, 30000);
    });
    
});