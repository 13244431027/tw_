(function (Scratch) {
    'use strict';
    
    if (!Scratch.extensions.unsandboxed) {
        return;
    }

    class DanmuExtension {
        constructor() {
            // 核心配置
            this.config = {
                speed: 5,
                fontSize: 16,
                opacity: 0.9,
                filterEnabled: true,
                maxHistory: 100,
                version: '1.0.5',
                likeEffect: true,
                autoLike: false,
                likeThreshold: 10,
                timeFormat: 'local'
            };
            
            // 状态管理
            this.isInitialized = false;
            this.danmuContainer = null;
            this.currentColor = '#FFFFFF';
            this.danmuHistory = [];
            this.currentDanmuText = '';
            
            // 时间管理
            this.timeManager = {
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                locale: navigator.language || 'zh-CN',
                serverTimeOffset: 0,
                lastSyncTime: Date.now()
            };
            
            // 点赞系统
            this.likeSystem = {
                totalLikes: 0,
                todayLikes: 0,
                likeHistory: [],
                userLikes: new Map(),
                popularDanmus: [],
                lastLikeDate: null
            };
            
            // 更新预告相关
            this.updateNotice = {
                enabled: false,
                version: '',
                title: '',
                content: [],
                showCount: 0,
                maxShowCount: 3
            };
            
            // 敏感词库
            this.sensitiveWords = [
                '妈的', '操', '草', 'fuck', 'shit', '傻逼', '神经病', '去死',
                '混蛋', '畜生', '垃圾', '废物', '变态', '色狼', '婊子', '嫖客'
            ];
            
            // 颜色配置
            this.colors = [
                { name: '白色', value: '#FFFFFF' },
                { name: '红色', value: '#EF4444' },
                { name: '蓝色', value: '#3B82F6' },
                { name: '绿色', value: '#10B981' },
                { name: '黄色', value: '#F59E0B' },
                { name: '紫色', value: '#A855F7' }
            ];
            
            this.init();
        }

        init() {
            this.loadSettings();
            this.loadTimeData();
            this.loadHistory();
            this.loadUpdateNotice();
            this.loadLikeData();
            this.checkDateReset();
            this.syncTime();
            console.log('弹幕扩展初始化完成 - v' + this.config.version);
        }

        getInfo() {
            return {
                id: 'DanmuExtension',
                name: '弹幕系统 v' + this.config.version,
                color1: '#3B82F6',
                color2: '#1E40AF',
                blocks: [
                    {
                        opcode: 'initDanmuSystem',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '初始化弹幕系统'
                    },
                    {
                        opcode: 'showDanmuPopup',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '显示弹幕输入弹窗'
                    },
                    {
                        opcode: 'sendDanmu',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '发送弹幕 [TEXT] 颜色 [COLOR]',
                        arguments: {
                            TEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '你好，世界！'
                            },
                            COLOR: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1,
                                menu: 'colorMenu'
                            }
                        }
                    },
                    {
                        opcode: 'clearAllDanmus',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '清除当前显示弹幕'
                    },
                    {
                        opcode: 'permanentClear',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '永久清空所有弹幕和历史记录'
                    },
                    {
                        opcode: 'showHistory',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '显示历史弹幕'
                    },
                    {
                        opcode: 'setDanmuSpeed',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '设置弹幕速度 [SPEED]',
                        arguments: {
                            SPEED: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 5,
                                menu: 'speedMenu'
                            }
                        }
                    },
                    {
                        opcode: 'setFontSize',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '设置字体大小 [SIZE]',
                        arguments: {
                            SIZE: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 16,
                                menu: 'fontSizeMenu'
                            }
                        }
                    },
                    {
                        opcode: 'toggleFilter',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '设置脏话过滤 [ENABLED]',
                        arguments: {
                            ENABLED: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1,
                                menu: 'filterMenu'
                            }
                        }
                    },
                    {
                        opcode: 'syncTimeNow',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '立即同步时间'
                    },
                    {
                        opcode: 'setTimeFormat',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '设置时间格式 [FORMAT]',
                        arguments: {
                            FORMAT: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1,
                                menu: 'timeFormatMenu'
                            }
                        }
                    },
                    {
                        opcode: 'showTimeInfo',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '显示时间信息'
                    },
                    {
                        opcode: 'likeCurrentDanmu',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '为当前弹幕点赞'
                    },
                    {
                        opcode: 'likeRandomDanmu',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '为随机弹幕点赞'
                    },
                    {
                        opcode: 'showLikeAnimation',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '显示点赞动画'
                    },
                    {
                        opcode: 'toggleLikeEffect',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '设置点赞特效 [ENABLED]',
                        arguments: {
                            ENABLED: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1,
                                menu: 'toggleMenu'
                            }
                        }
                    },
                    {
                        opcode: 'showLikeStats',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '显示点赞统计'
                    },
                    {
                        opcode: 'resetLikeCount',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '重置点赞计数'
                    },
                    {
                        opcode: 'exportDanmuData',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '导出弹幕数据'
                    },
                    {
                        opcode: 'importDanmuData',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '导入弹幕数据 [DATA]',
                        arguments: {
                            DATA: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '{}'
                            }
                        }
                    },
                    {
                        opcode: 'showImportExportPopup',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '显示导入导出管理面板'
                    },
                    {
                        opcode: 'getExportData',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '获取导出数据'
                    },
                    {
                        opcode: 'setUpdateNotice',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '设置更新预告 版本 [VERSION] 标题 [TITLE] 内容 [CONTENT]',
                        arguments: {
                            VERSION: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'v4.0'
                            },
                            TITLE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '即将更新！'
                            },
                            CONTENT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '新功能即将上线，敬请期待！'
                            }
                        }
                    },
                    {
                        opcode: 'showUpdateNotice',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '显示更新预告弹窗'
                    },
                    {
                        opcode: 'clearUpdateNotice',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '清除更新预告'
                    },
                    {
                        opcode: 'getDanmuCount',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '历史弹幕数量'
                    },
                    {
                        opcode: 'getCurrentDanmu',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '当前弹幕内容'
                    },
                    {
                        opcode: 'getCurrentColor',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '当前选择颜色'
                    },
                    {
                        opcode: 'isFilterEnabled',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: '脏话过滤是否开启'
                    },
                    {
                        opcode: 'hasUpdateNotice',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: '是否有更新预告'
                    },
                    {
                        opcode: 'isSystemReady',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: '弹幕系统是否就绪'
                    },
                    {
                        opcode: 'getSystemVersion',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '系统版本'
                    },
                    {
                        opcode: 'getCurrentTime',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '当前时间'
                    },
                    {
                        opcode: 'getTimeSince',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '距离 [TIMESTAMP] 的时间差',
                        arguments: {
                            TIMESTAMP: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: Date.now()
                            }
                        }
                    },
                    {
                        opcode: 'formatTime',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '格式化时间 [TIMESTAMP]',
                        arguments: {
                            TIMESTAMP: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: Date.now()
                            }
                        }
                    },
                    {
                        opcode: 'getTotalLikes',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '总点赞数'
                    },
                    {
                        opcode: 'getTodayLikes',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '今日点赞数'
                    },
                    {
                        opcode: 'getPopularDanmu',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '最受欢迎弹幕'
                    },
                    {
                        opcode: 'isLikeEffectEnabled',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: '点赞特效是否开启'
                    },
                    {
                        opcode: 'getLikeRank',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '点赞排行榜 [RANK]',
                        arguments: {
                            RANK: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1
                            }
                        }
                    }
                ],
                menus: {
                    colorMenu: this.createColorMenu(),
                    speedMenu: this.createSpeedMenu(),
                    fontSizeMenu: this.createFontSizeMenu(),
                    filterMenu: this.createFilterMenu(),
                    toggleMenu: this.createToggleMenu(),
                    timeFormatMenu: this.createTimeFormatMenu()
                }
            };
        }

        createColorMenu() {
            return this.colors.map((color, index) => ({
                text: color.name,
                value: index + 1
            }));
        }

        createSpeedMenu() {
            return Array.from({length: 10}, (_, i) => ({
                text: `${i + 1} (${i + 1 <= 3 ? '慢' : i + 1 <= 7 ? '中' : '快'})`,
                value: i + 1
            }));
        }

        createFontSizeMenu() {
            return [12, 14, 16, 18, 20, 22, 24].map(size => ({
                text: `${size}px`,
                value: size
            }));
        }

        createFilterMenu() {
            return [
                { text: '开启', value: 1 },
                { text: '关闭', value: 0 }
            ];
        }

        createToggleMenu() {
            return [
                { text: '开启', value: 1 },
                { text: '关闭', value: 0 }
            ];
        }

        createTimeFormatMenu() {
            return [
                { text: '本地时间', value: 1 },
                { text: '相对时间', value: 2 },
                { text: '时间戳', value: 3 }
            ];
        }

        initDanmuSystem() {
            if (this.isInitialized) {
                this.showMessage('弹幕系统已初始化');
                return;
            }
            
            this.createContainer();
            this.isInitialized = true;
            this.showMessage('弹幕系统初始化成功 - v' + this.config.version);
            
            const currentTime = this.getCurrentTime();
            this.createDanmuElement(`🕐 系统时间: ${currentTime}`, '#3B82F6');
            
            setTimeout(() => this.showHistory(), 1000);
            setTimeout(() => this.checkAndShowUpdateNotice(), 2000);
            setTimeout(() => this.showWelcomeMessage(), 3000);
        }

        createContainer() {
            const existing = document.getElementById('scratchDanmuContainer');
            if (existing && existing.parentNode) {
                existing.parentNode.removeChild(existing);
            }
            
            this.danmuContainer = document.createElement('div');
            this.danmuContainer.id = 'scratchDanmuContainer';
            this.danmuContainer.style.cssText = `
                position: fixed;
                inset: 0;
                z-index: 9999;
                pointer-events: none;
                overflow: hidden;
            `;
            
            document.body.appendChild(this.danmuContainer);
            this.addKeyframes();
        }

        addKeyframes() {
            if (!document.querySelector('#scratchDanmuKeyframes')) {
                const style = document.createElement('style');
                style.id = 'scratchDanmuKeyframes';
                style.textContent = `
                    @keyframes scratchDanmuMove {
                        from { transform: translateX(100vw); }
                        to { transform: translateX(-100%); }
                    }
                    @keyframes likeHeartBeat {
                        0% { transform: scale(1); opacity: 1; }
                        50% { transform: scale(1.3); opacity: 0.8; }
                        100% { transform: scale(1); opacity: 0; }
                    }
                    @keyframes likeFloat {
                        0% { transform: translateY(0) scale(1); opacity: 1; }
                        100% { transform: translateY(-100px) scale(1.5); opacity: 0; }
                    }
                    @keyframes likeExplosion {
                        0% { transform: scale(0) rotate(0deg); opacity: 1; }
                        50% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
                        100% { transform: scale(1) rotate(360deg); opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
            }
        }

        showDanmuPopup() {
            if (!this.isInitialized) {
                this.showMessage('请先初始化弹幕系统');
                return;
            }
            
            const popup = document.createElement('div');
            popup.id = 'scratchDanmuPopup';
            popup.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(5px);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: Arial, sans-serif;
            `;
            
            popup.innerHTML = `
                <div style="background: white; border-radius: 15px; padding: 30px; width: 90%; max-width: 500px; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
                    <h2 style="color: #3B82F6; margin-top: 0; text-align: center;">发送弹幕</h2>
                    
                    <div style="margin: 20px 0;">
                        <input 
                            type="text" 
                            id="popupDanmuInput" 
                            placeholder="请输入弹幕内容..." 
                            style="width: 100%; padding: 12px 15px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; box-sizing: border-box;"
                        >
                    </div>
                    
                    <div style="margin: 20px 0;">
                        <label style="display: block; color: #666; margin-bottom: 10px; font-weight: bold;">选择颜色：</label>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            ${this.colors.map((color, index) => `
                                <button 
                                    class="popup-color-btn" 
                                    data-color="${color.value}" 
                                    style="width: 35px; height: 35px; border: 3px solid transparent; border-radius: 50%; background: ${color.value}; cursor: pointer; transition: all 0.3s ease;"
                                ></button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 15px; margin-top: 30px;">
                        <button 
                            id="popupSendBtn" 
                            style="flex: 1; padding: 12px; background: linear-gradient(45deg, #3B82F6, #1E40AF); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; transition: transform 0.3s ease;"
                        >
                            发送弹幕
                        </button>
                        <button 
                            id="popupCancelBtn" 
                            style="flex: 1; padding: 12px; background: #f0f0f0; color: #666; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; transition: transform 0.3s ease;"
                        >
                            取消
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(popup);
            
            const defaultColorBtn = popup.querySelector(`[data-color="${this.currentColor}"]`);
            if (defaultColorBtn) {
                defaultColorBtn.style.borderColor = '#3B82F6';
                defaultColorBtn.style.transform = 'scale(1.1)';
            }
            
            popup.querySelectorAll('.popup-color-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    popup.querySelectorAll('.popup-color-btn').forEach(b => {
                        b.style.borderColor = 'transparent';
                        b.style.transform = 'scale(1)';
                    });
                    
                    btn.style.borderColor = '#3B82F6';
                    btn.style.transform = 'scale(1.1)';
                    this.currentColor = btn.dataset.color;
                });
            });
            
            document.getElementById('popupSendBtn').addEventListener('click', () => {
                const input = document.getElementById('popupDanmuInput');
                const text = input.value.trim();
                
                if (!text) {
                    alert('请输入弹幕内容！');
                    return;
                }
                
                if (this.config.filterEnabled && this.containsSensitiveWords(text)) {
                    alert('检测到不当内容，请文明发言！');
                    return;
                }
                
                this.currentDanmuText = text;
                this.createDanmuElement(text, this.currentColor);
                this.saveToHistory(text, this.currentColor);
                this.closePopup();
                this.showMessage(`弹幕发送成功: ${text}`);
            });
            
            document.getElementById('popupCancelBtn').addEventListener('click', () => {
                this.closePopup();
            });
            
            document.getElementById('popupDanmuInput').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    document.getElementById('popupSendBtn').click();
                }
            });
            
            popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                    this.closePopup();
                }
            });
            
            setTimeout(() => {
                document.getElementById('popupDanmuInput').focus();
            }, 100);
        }

        sendDanmu(args) {
            if (!this.isInitialized) {
                this.showMessage('请先初始化弹幕系统');
                return;
            }
            
            const text = args.TEXT.trim();
            const colorIndex = args.COLOR - 1;
            const color = this.colors[Math.max(0, Math.min(colorIndex, this.colors.length - 1))].value;
            
            if (!text) {
                this.showMessage('弹幕内容不能为空');
                return;
            }
            
            if (this.config.filterEnabled && this.containsSensitiveWords(text)) {
                this.showMessage('检测到不当内容，请文明发言');
                return;
            }
            
            this.currentDanmuText = text;
            this.createDanmuElement(text, color);
            this.saveToHistory(text, color);
            this.showMessage(`弹幕发送成功: ${text}`);
        }

        createDanmuElement(text, color) {
            const danmu = document.createElement('div');
            const duration = (10 - this.config.speed + 1) * 2;
            
            danmu.style.cssText = `
                position: absolute;
                white-space: nowrap;
                color: ${color};
                font-size: ${this.config.fontSize}px;
                opacity: ${this.config.opacity};
                font-weight: 600;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
                animation: scratchDanmuMove ${duration}s linear forwards;
                top: ${Math.random() * (window.innerHeight - 100)}px;
                pointer-events: none;
                font-family: Arial, sans-serif;
            `;
            
            danmu.textContent = text;
            this.danmuContainer.appendChild(danmu);
            
            setTimeout(() => {
                if (danmu.parentNode) {
                    danmu.parentNode.removeChild(danmu);
                }
            }, duration * 1000);
        }

        containsSensitiveWords(text) {
            const lowerText = text.toLowerCase();
            return this.sensitiveWords.some(word => lowerText.includes(word.toLowerCase()));
        }

        clearAllDanmus() {
            if (this.danmuContainer) {
                this.danmuContainer.innerHTML = '';
                this.showMessage('当前显示的弹幕已清除');
            }
        }

        permanentClear() {
            if (!this.isInitialized) {
                this.showMessage('请先初始化弹幕系统');
                return;
            }
            
            this.showPermanentClearConfirm();
        }

        showPermanentClearConfirm() {
            const confirmPopup = document.createElement('div');
            confirmPopup.id = 'scratchDanmuConfirmPopup';
            confirmPopup.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(5px);
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: Arial, sans-serif;
            `;
            
            confirmPopup.innerHTML = `
                <div style="background: white; border-radius: 15px; padding: 30px; width: 90%; max-width: 500px; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(45deg, #EF4444, #DC2626); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                            <i class="fa fa-exclamation-triangle" style="color: white; font-size: 24px;"></i>
                        </div>
                        <h2 style="color: #EF4444; margin-top: 0;">确认永久清空</h2>
                    </div>
                    
                    <div style="margin: 20px 0; color: #666; line-height: 1.6;">
                        <p style="font-weight: bold; color: #DC2626; margin-bottom: 10px;">此操作将：</p>
                        <ul style="text-align: left; padding-left: 20px; margin: 10px 0;">
                            <li>清除当前显示的所有弹幕</li>
                            <li>删除所有历史弹幕记录</li>
                            <li>清空本地存储的数据</li>
                            <li><strong style="color: #DC2626;">数据将无法恢复！</strong></li>
                        </ul>
                        <p style="margin-top: 15px; padding: 10px; background: #fef2f2; border-radius: 6px; border-left: 4px solid #EF4444;">
                            <strong>💡 提示：</strong>建议先使用"导出弹幕数据"功能备份数据
                        </p>
                    </div>
                    
                    <div style="display: flex; gap: 15px; margin-top: 30px;">
                        <button 
                            id="confirmClearBtn" 
                            style="flex: 1; padding: 12px; background: linear-gradient(45deg, #EF4444, #DC2626); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; transition: transform 0.3s ease;"
                        >
                            确认清空
                        </button>
                        <button 
                            id="cancelClearBtn" 
                            style="flex: 1; padding: 12px; background: #f0f0f0; color: #666; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; transition: transform 0.3s ease;"
                        >
                            取消
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(confirmPopup);
            
            document.getElementById('confirmClearBtn').addEventListener('click', () => {
                this.performPermanentClear();
                this.closePopup('scratchDanmuConfirmPopup');
            });
            
            document.getElementById('cancelClearBtn').addEventListener('click', () => {
                this.closePopup('scratchDanmuConfirmPopup');
                this.showMessage('已取消永久清空操作');
            });
            
            confirmPopup.addEventListener('click', (e) => {
                if (e.target === confirmPopup) {
                    this.closePopup('scratchDanmuConfirmPopup');
                    this.showMessage('已取消永久清空操作');
                }
            });
        }

        performPermanentClear() {
            if (this.danmuContainer) {
                this.danmuContainer.innerHTML = '';
            }
            
            this.danmuHistory = [];
            this.currentDanmuText = '';
            this.likeSystem.totalLikes = 0;
            this.likeSystem.todayLikes = 0;
            this.likeSystem.popularDanmus = [];
            
            localStorage.removeItem('scratchDanmuHistory');
            localStorage.removeItem('scratchDanmuSettings');
            localStorage.removeItem('scratchDanmuUpdateNotice');
            localStorage.removeItem('scratchDanmuLikeData');
            localStorage.removeItem('scratchDanmuTimeData');
            
            this.showMessage('所有弹幕和历史记录已永久清空！');
        }

        showHistory() {
            if (!this.isInitialized) {
                this.showMessage('请先初始化弹幕系统');
                return;
            }
            
            if (this.danmuHistory.length === 0) {
                this.showMessage('暂无历史弹幕');
                return;
            }
            
            this.clearAllDanmus();
            setTimeout(() => {
                this.danmuHistory.forEach((danmu, index) => {
                    setTimeout(() => {
                        const timeText = this.formatTime({ TIMESTAMP: danmu.timestamp });
                        const fullText = `[${timeText}] ${danmu.text}`;
                        this.createDanmuElement(fullText, danmu.color);
                    }, index * 200);
                });
                this.showMessage(`已显示 ${this.danmuHistory.length} 条历史弹幕`);
            }, 300);
        }

        setDanmuSpeed(args) {
            const speed = Math.max(1, Math.min(10, args.SPEED));
            this.config.speed = speed;
            this.saveSettings();
            this.showMessage(`弹幕速度已设置为: ${speed}`);
        }

        setFontSize(args) {
            const size = Math.max(12, Math.min(24, args.SIZE));
            this.config.fontSize = size;
            this.saveSettings();
            this.showMessage(`字体大小已设置为: ${size}px`);
        }

        toggleFilter(args) {
            this.config.filterEnabled = args.ENABLED === 1;
            this.saveSettings();
            this.showMessage(`脏话过滤已${this.config.filterEnabled ? '开启' : '关闭'}`);
        }

        syncTime() {
            this.timeManager.lastSyncTime = Date.now();
            console.log('时间同步完成 - 使用本地时间');
        }

        syncTimeNow() {
            this.syncTime();
            this.showMessage('时间同步完成');
        }

        setTimeFormat(args) {
            switch (args.FORMAT) {
                case 1: this.config.timeFormat = 'local'; break;
                case 2: this.config.timeFormat = 'relative'; break;
                case 3: this.config.timeFormat = 'timestamp'; break;
            }
            this.saveSettings();
            this.showMessage(`时间格式已设置为: ${this.config.timeFormat}`);
        }

        showTimeInfo() {
            const popup = document.createElement('div');
            popup.id = 'scratchTimeInfoPopup';
            popup.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(5px);
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: Arial, sans-serif;
            `;
            
            const currentTime = this.getCurrentTime();
            const timezone = this.timeManager.timezone;
            const locale = this.timeManager.locale;
            const lastSync = new Date(this.timeManager.lastSyncTime).toLocaleString();
            
            popup.innerHTML = `
                <div style="background: white; border-radius: 15px; padding: 30px; width: 90%; max-width: 500px; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
                    <h2 style="color: #3B82F6; margin-top: 0; text-align: center; display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <span>🕐 时间信息</span>
                        <span style="background: #3B82F6; color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px;">v${this.config.version}</span>
                    </h2>
                    
                    <div style="margin: 20px 0;">
                        <div style="background: #f8f9fa; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 15px;">
                            <div style="font-size: 24px; font-weight: bold; color: #3B82F6;">${currentTime}</div>
                            <div style="font-size: 14px; color: #666;">当前时间</div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px;">
                                <div style="font-size: 12px; color: #666;">时区</div>
                                <div style="font-weight: bold; color: #333;">${timezone}</div>
                            </div>
                            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px;">
                                <div style="font-size: 12px; color: #666;">语言</div>
                                <div style="font-weight: bold; color: #333;">${locale}</div>
                            </div>
                        </div>
                        
                        <div style="background: #fef7ed; padding: 15px; border-radius: 8px; margin-top: 15px;">
                            <div style="font-size: 12px; color: #666;">最后同步</div>
                            <div style="font-weight: bold; color: #333;">${lastSync}</div>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 15px; margin-top: 30px;">
                        <button 
                            id="syncTimeBtn" 
                            style="flex: 1; padding: 12px; background: linear-gradient(45deg, #10B981, #059669); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; transition: transform 0.3s ease;"
                        >
                            同步时间
                        </button>
                        <button 
                            id="closeTimeInfoBtn" 
                            style="flex: 1; padding: 12px; background: #f0f0f0; color: #666; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; transition: transform 0.3s ease;"
                        >
                            关闭
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(popup);
            
            document.getElementById('syncTimeBtn').addEventListener('click', () => {
                this.syncTimeNow();
                this.closePopup('scratchTimeInfoPopup');
            });
            
            document.getElementById('closeTimeInfoBtn').addEventListener('click', () => {
                this.closePopup('scratchTimeInfoPopup');
            });
            
            popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                    this.closePopup('scratchTimeInfoPopup');
                }
            });
        }

        likeCurrentDanmu() {
            if (!this.isInitialized) {
                this.showMessage('请先初始化弹幕系统');
                return;
            }
            
            if (!this.currentDanmuText) {
                this.showMessage('没有当前弹幕可以点赞');
                return;
            }
            
            this.addLike(this.currentDanmuText);
            this.showLikeAnimation();
            this.showMessage(`为弹幕点赞: ${this.currentDanmuText}`);
        }

        likeRandomDanmu() {
            if (!this.isInitialized) {
                this.showMessage('请先初始化弹幕系统');
                return;
            }
            
            if (this.danmuHistory.length === 0) {
                this.showMessage('没有历史弹幕可以点赞');
                return;
            }
            
            const randomIndex = Math.floor(Math.random() * this.danmuHistory.length);
            const randomDanmu = this.danmuHistory[randomIndex];
            
            this.addLike(randomDanmu.text);
            this.showLikeAnimation();
            this.showMessage(`为随机弹幕点赞: ${randomDanmu.text}`);
        }

        addLike(danmuText) {
            this.likeSystem.totalLikes++;
            this.likeSystem.todayLikes++;
            
            const likeRecord = {
                text: danmuText,
                timestamp: Date.now(),
                type: 'manual'
            };
            this.likeSystem.likeHistory.unshift(likeRecord);
            
            if (this.likeSystem.likeHistory.length > 50) {
                this.likeSystem.likeHistory = this.likeSystem.likeHistory.slice(0, 50);
            }
            
            this.updatePopularDanmus(danmuText);
            this.saveLikeData();
            
            if (this.likeSystem.totalLikes % this.config.likeThreshold === 0) {
                this.showSpecialLikeEffect();
            }
        }

        updatePopularDanmus(danmuText) {
            const existing = this.likeSystem.popularDanmus.find(item => item.text === danmuText);
            
            if (existing) {
                existing.likes++;
                existing.lastLiked = Date.now();
            } else {
                this.likeSystem.popularDanmus.push({
                    text: danmuText,
                    likes: 1,
                    firstLiked: Date.now(),
                    lastLiked: Date.now()
                });
            }
            
            this.likeSystem.popularDanmus.sort((a, b) => b.likes - a.likes);
            
            if (this.likeSystem.popularDanmus.length > 10) {
                this.likeSystem.popularDanmus = this.likeSystem.popularDanmus.slice(0, 10);
            }
        }

        showLikeAnimation() {
            if (!this.config.likeEffect) return;
            
            const likeContainer = document.createElement('div');
            likeContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                pointer-events: none;
                z-index: 10000;
            `;
            
            document.body.appendChild(likeContainer);
            
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    this.createHeartEffect(likeContainer);
                }, i * 200);
            }
            
            setTimeout(() => {
                if (likeContainer.parentNode) {
                    likeContainer.parentNode.removeChild(likeContainer);
                }
            }, 3000);
        }

        createHeartEffect(container) {
            const heart = document.createElement('div');
            const startX = Math.random() * window.innerWidth;
            const startY = window.innerHeight;
            
            heart.style.cssText = `
                position: absolute;
                left: ${startX}px;
                top: ${startY}px;
                font-size: 24px;
                color: #EF4444;
                pointer-events: none;
                z-index: 10001;
                animation: likeFloat 2s ease-in forwards;
                text-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
            `;
            heart.textContent = '❤️';
            
            container.appendChild(heart);
            
            setTimeout(() => {
                if (heart.parentNode) {
                    heart.parentNode.removeChild(heart);
                }
            }, 2000);
        }

        showSpecialLikeEffect() {
            const effectContainer = document.createElement('div');
            effectContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                pointer-events: none;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            document.body.appendChild(effectContainer);
            
            const explosion = document.createElement('div');
            explosion.style.cssText = `
                font-size: 60px;
                color: #F59E0B;
                animation: likeExplosion 1.5s ease-out forwards;
                text-shadow: 0 0 20px rgba(245, 158, 11, 0.8);
            `;
            explosion.textContent = '🎉';
            
            effectContainer.appendChild(explosion);
            
            setTimeout(() => {
                this.createDanmuElement(`🎊 总点赞数达到 ${this.likeSystem.totalLikes}！感谢支持！`, '#F59E0B');
            }, 500);
            
            setTimeout(() => {
                if (effectContainer.parentNode) {
                    effectContainer.parentNode.removeChild(effectContainer);
                }
            }, 2000);
        }

        showLikeStats() {
            if (!this.isInitialized) {
                this.showMessage('请先初始化弹幕系统');
                return;
            }
            
            const popup = document.createElement('div');
            popup.id = 'scratchLikeStatsPopup';
            popup.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(5px);
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: Arial, sans-serif;
            `;
            
            const topDanmus = this.likeSystem.popularDanmus.slice(0, 5);
            const danmusHtml = topDanmus.map((danmu, index) => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: ${index % 2 === 0 ? '#f8f9fa' : 'white'}; border-radius: 6px; margin: 5px 0;">
                    <div style="flex: 1;">
                        <div style="font-weight: bold; color: #333;">${danmu.text}</div>
                        <div style="font-size: 12px; color: #666;">${new Date(danmu.lastLiked).toLocaleDateString()}</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <span style="color: #EF4444;">❤️</span>
                        <span style="font-weight: bold; color: #EF4444;">${danmu.likes}</span>
                    </div>
                </div>
            `).join('');
            
            popup.innerHTML = `
                <div style="background: white; border-radius: 15px; padding: 30px; width: 90%; max-width: 500px; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
                    <h2 style="color: #EF4444; margin-top: 0; text-align: center; display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <span>❤️ 点赞统计</span>
                        <span style="background: #EF4444; color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px;">v${this.config.version}</span>
                    </h2>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
                        <div style="background: linear-gradient(45deg, #EF4444, #DC2626); color: white; padding: 20px; border-radius: 10px; text-align: center;">
                            <div style="font-size: 24px; font-weight: bold;">${this.likeSystem.totalLikes}</div>
                            <div style="font-size: 12px;">总点赞数</div>
                        </div>
                        <div style="background: linear-gradient(45deg, #3B82F6, #1E40AF); color: white; padding: 20px; border-radius: 10px; text-align: center;">
                            <div style="font-size: 24px; font-weight: bold;">${this.likeSystem.todayLikes}</div>
                            <div style="font-size: 12px;">今日点赞</div>
                        </div>
                    </div>
                    
                    <div style="margin: 25px 0;">
                        <h3 style="color: #333; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                            <span>🔥 热门弹幕</span>
                        </h3>
                        <div style="max-height: 200px; overflow-y: auto;">
                            ${danmusHtml || '<div style="text-align: center; color: #666; padding: 20px;">暂无热门弹幕</div>'}
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 15px; margin-top: 30px;">
                        <button 
                            id="closeLikeStatsBtn" 
                            style="flex: 1; padding: 12px; background: #f0f0f0; color: #666; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; transition: transform 0.3s ease;"
                        >
                            关闭
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(popup);
            
            document.getElementById('closeLikeStatsBtn').addEventListener('click', () => {
                this.closePopup('scratchLikeStatsPopup');
            });
            
            popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                    this.closePopup('scratchLikeStatsPopup');
                }
            });
        }

        toggleLikeEffect(args) {
            this.config.likeEffect = args.ENABLED === 1;
            this.saveSettings();
            this.showMessage(`点赞特效已${this.config.likeEffect ? '开启' : '关闭'}`);
        }

        resetLikeCount() {
            this.likeSystem.totalLikes = 0;
            this.likeSystem.todayLikes = 0;
            this.likeSystem.popularDanmus = [];
            this.saveLikeData();
            this.showMessage('点赞计数已重置');
        }

        exportDanmuData() {
            const exportData = this.generateExportData();
            const jsonString = JSON.stringify(exportData, null, 2);
            this.downloadExportFile();
            this.showMessage(`弹幕数据导出成功！共 ${this.danmuHistory.length} 条记录`);
        }

        downloadExportFile() {
            const exportData = this.generateExportData();
            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            a.download = `scratch_danmu_data_${timestamp}.json`;
            a.href = url;
            a.click();
            
            URL.revokeObjectURL(url);
        }

        generateExportData() {
            return {
                metadata: {
                    version: this.config.version,
                    exportTime: new Date().toISOString(),
                    dataType: 'ScratchDanmuData',
                    recordCount: this.danmuHistory.length,
                    totalLikes: this.likeSystem.totalLikes,
                    timezone: this.timeManager.timezone,
                    locale: this.timeManager.locale
                },
                systemConfig: {
                    speed: this.config.speed,
                    fontSize: this.config.fontSize,
                    opacity: this.config.opacity,
                    filterEnabled: this.config.filterEnabled,
                    maxHistory: this.config.maxHistory,
                    likeEffect: this.config.likeEffect,
                    likeThreshold: this.config.likeThreshold,
                    timeFormat: this.config.timeFormat
                },
                timeData: {
                    timezone: this.timeManager.timezone,
                    locale: this.timeManager.locale,
                    serverTimeOffset: this.timeManager.serverTimeOffset,
                    lastSyncTime: this.timeManager.lastSyncTime
                },
                likeData: {
                    totalLikes: this.likeSystem.totalLikes,
                    popularDanmus: this.likeSystem.popularDanmus
                },
                danmuHistory: this.danmuHistory,
                updateNotice: this.updateNotice
            };
        }

        getExportData() {
            const exportData = this.generateExportData();
            return JSON.stringify(exportData);
        }

        importDanmuData(args) {
            const dataString = args.DATA.trim();
            if (!dataString) {
                this.showMessage('导入数据为空');
                return;
            }
            
            try {
                const importedData = JSON.parse(dataString);
                
                if (!importedData.metadata || importedData.metadata.dataType !== 'ScratchDanmuData') {
                    this.showMessage('数据格式错误：不是有效的弹幕数据文件');
                    return;
                }
                
                let importedCount = 0;
                let configImported = false;
                let likeImported = false;
                let noticeImported = false;
                let timeImported = false;
                
                if (Array.isArray(importedData.danmuHistory)) {
                    const now = Date.now();
                    
                    importedData.danmuHistory.forEach(danmu => {
                        if (danmu.timestamp > now) {
                            danmu.timestamp = now - Math.random() * 86400000;
                        }
                        
                        const key = `${danmu.text}-${danmu.timestamp}`;
                        const exists = this.danmuHistory.some(existing => 
                            `${existing.text}-${existing.timestamp}` === key
                        );
                        
                        if (!exists) {
                            this.danmuHistory.unshift(danmu);
                            importedCount++;
                        }
                    });
                    
                    if (this.danmuHistory.length > this.config.maxHistory) {
                        this.danmuHistory = this.danmuHistory.slice(0, this.config.maxHistory);
                    }
                }
                
                if (importedData.systemConfig) {
                    this.config = { ...this.config, ...importedData.systemConfig };
                    configImported = true;
                }
                
                if (importedData.timeData) {
                    this.timeManager = { ...this.timeManager, ...importedData.timeData };
                    timeImported = true;
                }
                
                if (importedData.likeData) {
                    this.likeSystem.totalLikes = importedData.likeData.totalLikes || this.likeSystem.totalLikes;
                    if (Array.isArray(importedData.likeData.popularDanmus)) {
                        importedData.likeData.popularDanmus.forEach(danmu => {
                            if (danmu.firstLiked > Date.now()) {
                                danmu.firstLiked = Date.now() - Math.random() * 2592000000;
                            }
                            if (danmu.lastLiked > Date.now()) {
                                danmu.lastLiked = Date.now() - Math.random() * 86400000;
                            }
                        });
                        this.likeSystem.popularDanmus = importedData.likeData.popularDanmus;
                    }
                    likeImported = true;
                }
                
                if (importedData.updateNotice) {
                    this.updateNotice = { ...this.updateNotice, ...importedData.updateNotice };
                    noticeImported = true;
                }
                
                this.saveSettings();
                this.saveTimeData();
                this.saveLikeData();
                this.saveHistory();
                this.saveUpdateNotice();
                
                let message = `数据导入成功！`;
                const parts = [];
                if (importedCount > 0) parts.push(`新增 ${importedCount} 条弹幕`);
                if (configImported) parts.push('系统配置已更新');
                if (timeImported) parts.push('时间设置已导入');
                if (likeImported) parts.push('点赞数据已导入');
                if (noticeImported) parts.push('更新预告已导入');
                
                if (parts.length > 0) {
                    message += ` (${parts.join('，')})`;
                }
                
                this.showMessage(message);
                this.closePopup('scratchImportExportPopup');
                
            } catch (error) {
                console.error('导入弹幕数据失败:', error);
                this.showMessage('导入失败：数据格式错误或已损坏');
            }
        }

        showImportExportPopup() {
            if (!this.isInitialized) {
                this.showMessage('请先初始化弹幕系统');
                return;
            }
            
            const popup = document.createElement('div');
            popup.id = 'scratchImportExportPopup';
            popup.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(5px);
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: Arial, sans-serif;
            `;
            
            const exportData = this.generateExportData();
            const exportJson = JSON.stringify(exportData, null, 2);
            
            popup.innerHTML = `
                <div style="background: white; border-radius: 15px; padding: 30px; width: 90%; max-width: 600px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); max-height: 80vh; overflow-y: auto;">
                    <h2 style="color: #3B82F6; margin-top: 0; text-align: center; display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <span>📊 数据管理面板</span>
                        <span style="background: #3B82F6; color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px;">v${this.config.version}</span>
                    </h2>
                    
                    <div style="background: #f8f9fa; border-radius: 10px; padding: 15px; margin: 20px 0; border-left: 4px solid #3B82F6;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div style="text-align: center;">
                                <div style="font-size: 24px; font-weight: bold; color: #3B82F6;">${this.danmuHistory.length}</div>
                                <div style="font-size: 12px; color: #666;">历史弹幕</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 24px; font-weight: bold; color: #10B981;">${this.config.maxHistory}</div>
                                <div style="font-size: 12px; color: #666;">最大容量</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin: 25px 0;">
                        <h3 style="color: #10B981; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                            <span>📤 导出数据</span>
                        </h3>
                        <div style="background: #f0f9ff; border: 2px dashed #3B82F6; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                            <div style="font-size: 14px; color: #666; margin-bottom: 10px;">
                                导出格式：JSON（包含弹幕历史、系统设置、更新预告）
                            </div>
                            <textarea 
                                id="exportDataArea" 
                                readonly 
                                style="width: 100%; height: 120px; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: monospace; font-size: 12px; resize: vertical; background: #fafafa;"
                            >${exportJson}</textarea>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button 
                                id="copyExportBtn" 
                                style="flex: 1; padding: 10px; background: linear-gradient(45deg, #10B981, #059669); color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; transition: transform 0.3s ease;"
                            >
                                📋 复制到剪贴板
                            </button>
                            <button 
                                id="downloadExportBtn" 
                                style="flex: 1; padding: 10px; background: linear-gradient(45deg, #3B82F6, #1E40AF); color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; transition: transform 0.3s ease;"
                            >
                                💾 下载文件
                            </button>
                        </div>
                    </div>
                    
                    <div style="margin: 25px 0;">
                        <h3 style="color: #F59E0B; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                            <span>📥 导入数据</span>
                        </h3>
                        <div style="background: #fff7ed; border: 2px dashed #F59E0B; border-radius: 8px; padding: 15px;">
                            <div style="font-size: 14px; color: #666; margin-bottom: 10px;">
                                粘贴JSON数据或选择文件导入
                            </div>
                            <textarea 
                                id="importDataArea" 
                                placeholder="请粘贴JSON格式的数据..."
                                style="width: 100%; height: 100px; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: monospace; font-size: 12px; resize: vertical; margin-bottom: 10px;"
                            ></textarea>
                            <input 
                                type="file" 
                                id="importFileInput" 
                                accept=".json,.txt" 
                                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 10px;"
                            >
                            <div style="display: flex; gap: 10px;">
                                <button 
                                    id="importDataBtn" 
                                    style="flex: 1; padding: 10px; background: linear-gradient(45deg, #F59E0B, #D97706); color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; transition: transform 0.3s ease;"
                                >
                                    🔄 导入数据
                                </button>
                                <button 
                                    id="clearImportBtn" 
                                    style="flex: 1; padding: 10px; background: #f0f0f0; color: #666; border: 2px solid #ddd; border-radius: 6px; font-size: 14px; cursor: pointer; transition: transform 0.3s ease;"
                                >
                                    🗑️ 清空输入
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 15px; margin-top: 30px;">
                        <button 
                            id="closeImportExportBtn" 
                            style="flex: 1; padding: 12px; background: #f0f0f0; color: #666; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; transition: transform 0.3s ease;"
                        >
                            关闭面板
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(popup);
            
            document.getElementById('copyExportBtn').addEventListener('click', () => {
                const textarea = document.getElementById('exportDataArea');
                textarea.select();
                document.execCommand('copy');
                this.showMessage('数据已复制到剪贴板！');
                
                const btn = document.getElementById('copyExportBtn');
                btn.textContent = '✅ 复制成功';
                btn.style.background = 'linear-gradient(45deg, #10B981, #059669)';
                setTimeout(() => {
                    btn.textContent = '📋 复制到剪贴板';
                }, 2000);
            });
            
            document.getElementById('downloadExportBtn').addEventListener('click', () => {
                this.downloadExportFile();
            });
            
            document.getElementById('importDataBtn').addEventListener('click', () => {
                const importText = document.getElementById('importDataArea').value.trim();
                if (importText) {
                    this.importDanmuData({ DATA: importText });
                } else {
                    this.showMessage('请输入要导入的数据');
                }
            });
            
            document.getElementById('clearImportBtn').addEventListener('click', () => {
                document.getElementById('importDataArea').value = '';
                document.getElementById('importFileInput').value = '';
            });
            
            document.getElementById('importFileInput').addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        document.getElementById('importDataArea').value = event.target.result;
                        this.showMessage('文件读取成功，点击导入数据按钮完成导入');
                    };
                    reader.readAsText(file);
                }
            });
            
            document.getElementById('closeImportExportBtn').addEventListener('click', () => {
                this.closePopup('scratchImportExportPopup');
            });
            
            popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                    this.closePopup('scratchImportExportPopup');
                }
            });
        }

        setUpdateNotice(args) {
            const version = args.VERSION.trim();
            const title = args.TITLE.trim();
            const content = args.CONTENT.trim();
            
            if (!version || !title) {
                this.showMessage('版本号和标题不能为空');
                return;
            }
            
            const contentArray = content.split(/[\n\r]+/).filter(item => item.trim() !== '');
            
            this.updateNotice = {
                enabled: true,
                version: version,
                title: title,
                content: contentArray.length > 0 ? contentArray : [content],
                showCount: this.updateNotice.showCount,
                maxShowCount: 3
            };
            
            this.saveUpdateNotice();
            this.showMessage(`更新预告设置成功：${version} - ${title}`);
        }

        showUpdateNotice() {
            this.showUpdateNoticePopup();
        }

        showUpdateNoticePopup() {
            if (!this.updateNotice.enabled || !this.updateNotice.version || !this.updateNotice.title) {
                this.showMessage('没有设置更新预告内容');
                return;
            }
            
            const noticePopup = document.createElement('div');
            noticePopup.id = 'scratchUpdateNoticePopup';
            noticePopup.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(5px);
                z-index: 10002;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: Arial, sans-serif;
            `;
            
            const contentHtml = this.updateNotice.content.map(item => 
                `<li style="margin: 8px 0; padding: 8px; background: rgba(59, 130, 246, 0.1); border-radius: 6px; border-left: 3px solid #3B82F6;">${item}</li>`
            ).join('');
            
            noticePopup.innerHTML = `
                <div style="background: white; border-radius: 15px; padding: 30px; width: 90%; max-width: 600px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); border-top: 5px solid #3B82F6;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div style="display: inline-block; width: 50px; height: 50px; background: linear-gradient(45deg, #3B82F6, #1E40AF); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                            <i class="fa fa-star" style="color: white; font-size: 20px;"></i>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <h2 style="color: #1E40AF; margin: 0; font-size: 24px;">${this.updateNotice.title}</h2>
                            <span style="background: #3B82F6; color: white; padding: 3px 12px; border-radius: 15px; font-size: 14px; font-weight: bold;">${this.updateNotice.version}</span>
                        </div>
                        <p style="color: #666; margin: 0; font-size: 14px;">作者最新动态</p>
                    </div>
                    
                    <div style="margin: 20px 0; color: #333; line-height: 1.6;">
                        ${this.updateNotice.content.length > 0 ? `
                            <ul style="padding-left: 0; margin: 0; list-style: none;">
                                ${contentHtml}
                            </ul>
                        ` : `
                            <p style="text-align: center; color: #666; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                                ${this.updateNotice.content[0] || '敬请期待更多精彩内容！'}
                            </p>
                        `}
                    </div>
                    
                    <div style="margin-top: 30px; text-align: center;">
                        <button 
                            id="closeNoticeBtn" 
                            style="padding: 12px 30px; background: linear-gradient(45deg, #3B82F6, #1E40AF); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; transition: transform 0.3s ease; margin-right: 10px;"
                        >
                            知道了
                        </button>
                        <button 
                            id="remindLaterBtn" 
                            style="padding: 12px 20px; background: #f0f0f0; color: #666; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; cursor: pointer; transition: transform 0.3s ease;"
                        >
                            稍后提醒
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(noticePopup);
            
            this.updateNotice.showCount++;
            this.saveUpdateNotice();
            
            document.getElementById('closeNoticeBtn').addEventListener('click', () => {
                this.closePopup('scratchUpdateNoticePopup');
                this.showMessage('更新预告已关闭');
            });
            
            document.getElementById('remindLaterBtn').addEventListener('click', () => {
                this.closePopup('scratchUpdateNoticePopup');
                this.showMessage('将在下次启动时再次显示更新预告');
            });
            
            noticePopup.addEventListener('click', (e) => {
                if (e.target === noticePopup) {
                    this.closePopup('scratchUpdateNoticePopup');
                }
            });
            
            this.showMessage('显示更新预告弹窗');
        }

        checkAndShowUpdateNotice() {
            if (this.updateNotice.enabled && 
                this.updateNotice.version && 
                this.updateNotice.title && 
                this.updateNotice.showCount < this.updateNotice.maxShowCount) {
                
                const delay = Math.random() * 3000 + 2000;
                setTimeout(() => {
                    this.showUpdateNoticePopup();
                }, delay);
            }
        }

        clearUpdateNotice() {
            this.updateNotice = {
                enabled: false,
                version: '',
                title: '',
                content: [],
                showCount: 0,
                maxShowCount: 3
            };
            
            this.saveUpdateNotice();
            this.closePopup('scratchUpdateNoticePopup');
            this.showMessage('更新预告已清除');
        }

        getDanmuCount() {
            return this.danmuHistory.length;
        }

        getCurrentDanmu() {
            return this.currentDanmuText || '';
        }

        getCurrentColor() {
            const colorInfo = this.colors.find(color => color.value === this.currentColor);
            return colorInfo ? colorInfo.name : '白色';
        }

        isFilterEnabled() {
            return this.config.filterEnabled;
        }

        hasUpdateNotice() {
            return this.updateNotice.enabled && !!this.updateNotice.version && !!this.updateNotice.title;
        }

        isSystemReady() {
            return this.isInitialized;
        }

        getSystemVersion() {
            return this.config.version;
        }

        getCurrentTime() {
            const now = new Date();
            return now.toLocaleString(this.timeManager.locale, {
                timeZone: this.timeManager.timezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }

        getTimeSince(args) {
            const timestamp = args.TIMESTAMP;
            const now = Date.now();
            const diff = now - timestamp;
            
            if (diff < 60000) {
                return '刚刚';
            } else if (diff < 3600000) {
                return Math.floor(diff / 60000) + '分钟前';
            } else if (diff < 86400000) {
                return Math.floor(diff / 3600000) + '小时前';
            } else if (diff < 604800000) {
                return Math.floor(diff / 86400000) + '天前';
            } else {
                return new Date(timestamp).toLocaleDateString(this.timeManager.locale);
            }
        }

        formatTime(args) {
            const timestamp = args.TIMESTAMP;
            const date = new Date(timestamp);
            
            switch (this.config.timeFormat) {
                case 'local':
                    return date.toLocaleString(this.timeManager.locale, {
                        timeZone: this.timeManager.timezone
                    });
                case 'relative':
                    return this.getTimeSince({ TIMESTAMP: timestamp });
                case 'timestamp':
                    return timestamp.toString();
                default:
                    return date.toLocaleString();
            }
        }

        getTotalLikes() {
            return this.likeSystem.totalLikes;
        }

        getTodayLikes() {
            return this.likeSystem.todayLikes;
        }

        getPopularDanmu() {
            if (this.likeSystem.popularDanmus.length === 0) {
                return '暂无热门弹幕';
            }
            return this.likeSystem.popularDanmus[0].text;
        }

        isLikeEffectEnabled() {
            return this.config.likeEffect;
        }

        getLikeRank(args) {
            const rank = Math.max(1, Math.min(args.RANK, this.likeSystem.popularDanmus.length)) - 1;
            if (this.likeSystem.popularDanmus[rank]) {
                return this.likeSystem.popularDanmus[rank].text;
            }
            return '无';
        }

        saveToHistory(text, color) {
            const timestamp = Date.now() + this.timeManager.serverTimeOffset;
            const danmu = { text, color, timestamp };
            this.danmuHistory.unshift(danmu);
            
            if (this.danmuHistory.length > this.config.maxHistory) {
                this.danmuHistory = this.danmuHistory.slice(0, this.config.maxHistory);
            }
            
            this.saveHistory();
        }

        saveHistory() {
            localStorage.setItem('scratchDanmuHistory', JSON.stringify(this.danmuHistory));
        }

        loadHistory() {
            try {
                const saved = localStorage.getItem('scratchDanmuHistory');
                if (saved) {
                    this.danmuHistory = JSON.parse(saved);
                }
            } catch (e) {
                console.error('加载弹幕历史失败:', e);
                this.danmuHistory = [];
            }
        }

        saveSettings() {
            localStorage.setItem('scratchDanmuSettings', JSON.stringify(this.config));
        }

        loadSettings() {
            try {
                const saved = localStorage.getItem('scratchDanmuSettings');
                if (saved) {
                    this.config = { ...this.config, ...JSON.parse(saved) };
                }
            } catch (e) {
                console.error('加载弹幕设置失败:', e);
            }
        }

        saveTimeData() {
            localStorage.setItem('scratchDanmuTimeData', JSON.stringify(this.timeManager));
        }

        loadTimeData() {
            try {
                const saved = localStorage.getItem('scratchDanmuTimeData');
                if (saved) {
                    this.timeManager = { ...this.timeManager, ...JSON.parse(saved) };
                }
            } catch (e) {
                console.error('加载时间数据失败:', e);
            }
        }

        saveLikeData() {
            localStorage.setItem('scratchDanmuLikeData', JSON.stringify(this.likeSystem));
        }

        loadLikeData() {
            try {
                const saved = localStorage.getItem('scratchDanmuLikeData');
                if (saved) {
                    this.likeSystem = { ...this.likeSystem, ...JSON.parse(saved) };
                }
            } catch (e) {
                console.error('加载点赞数据失败:', e);
            }
        }

        saveUpdateNotice() {
            localStorage.setItem('scratchDanmuUpdateNotice', JSON.stringify(this.updateNotice));
        }

        loadUpdateNotice() {
            try {
                const saved = localStorage.getItem('scratchDanmuUpdateNotice');
                if (saved) {
                    this.updateNotice = { ...this.updateNotice, ...JSON.parse(saved) };
                }
            } catch (e) {
                console.error('加载更新预告失败:', e);
            }
        }

        checkDateReset() {
            const today = new Date().toDateString();
            if (this.likeSystem.lastLikeDate !== today) {
                this.likeSystem.todayLikes = 0;
                this.likeSystem.lastLikeDate = today;
                this.saveLikeData();
            }
        }

        showWelcomeMessage() {
            const currentTime = this.getCurrentTime();
            const welcomeMessages = [
                '🎉 欢迎使用弹幕系统 v1.0.5！',
                `🕐 当前时间: ${currentTime}`,
                '❤️ 新功能：点赞系统已上线！',
                '✨ 修复了本地出场时间bug',
                '🚀 体验更丰富的互动功能'
            ];
            
            welcomeMessages.forEach((msg, index) => {
                setTimeout(() => {
                    this.createDanmuElement(msg, '#3B82F6');
                }, index * 2000);
            });
        }

        showMessage(text) {
            console.log(`[弹幕系统 v${this.config.version}] ${text}`);
        }

        closePopup(popupId = 'scratchDanmuPopup') {
            const popup = document.getElementById(popupId);
            if (popup && popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }

        destroy() {
            this.isInitialized = false;
            const container = document.getElementById('scratchDanmuContainer');
            if (container && container.parentNode) {
                container.parentNode.removeChild(container);
            }
            this.closePopup();
            this.closePopup('scratchDanmuConfirmPopup');
            this.closePopup('scratchUpdateNoticePopup');
            this.closePopup('scratchImportExportPopup');
            this.closePopup('scratchLikeStatsPopup');
            this.closePopup('scratchTimeInfoPopup');
            console.log('弹幕系统已销毁');
        }
    }

    Scratch.extensions.register(new DanmuExtension());
    
    console.log('Scratch弹幕扩展 v1.0.5 已加载完成 - 完整功能版本');
})(Scratch);
