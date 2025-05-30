document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('camera');
    const mainBg = document.getElementById('mainBg');
    const cameraContainer = document.querySelector('.camera-container');
    const ratioBtns = document.querySelectorAll('.ratio-btn');
    const colorBlocks = document.querySelectorAll('.color-block');
    const hueSlider = document.getElementById('hueSlider');
    const saturationSlider = document.getElementById('saturationSlider');
    const brightnessSlider = document.getElementById('brightnessSlider');
    const saturationValue = document.getElementById('saturationValue');
    const brightnessValue = document.getElementById('brightnessValue');

    // 摄像头初始化
    let cameraStream = null;
    async function initCamera() {
        try {
            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 1280 },
                    facingMode: 'user'
                }
            });
            video.srcObject = cameraStream;
            seasonCamera.srcObject = cameraStream;
        } catch (err) {
            alert('无法访问摄像头，请检查权限');
        }
    }

    // 默认背景色
    let baseColor = document.querySelector('.color-block')?.getAttribute('data-bg') || '#a259e6';
    let hue = 0;
    let saturation = 100;
    let brightness = 100;

    // 设置背景色和滤镜
    function updateBg() {
        // 计算hsl
        let rgb = hexToRgb(baseColor);
        let hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        // 叠加色相
        let h = (hsl.h * 360 + parseInt(hue)) % 360;
        let s = (hsl.s * 100 * (saturation / 100));
        let l = (hsl.l * 100 * (brightness / 100));
        const bgColor = `hsl(${h}, ${s}%, ${l}%)`;
        mainBg.style.background = bgColor;
        document.documentElement.style.setProperty('--main-bg', bgColor);
        // 色卡颜色同步
        colorBlocks.forEach(b => {
            if (b.classList.contains('selected')) {
                b.style.background = bgColor;
            } else {
                b.style.background = b.getAttribute('data-bg');
            }
        });
        // .panel颜色为当前背景色加黑色20%
        const panel = document.querySelector('.panel');
        panel.style.background = `linear-gradient(rgba(0,0,0,0.2),rgba(0,0,0,0.2)),${bgColor}`;
        // 滑块颜色为当前背景色
        document.querySelectorAll('.slider-row input[type="range"]').forEach(r => {
            r.style.background = bgColor;
        });
        document.querySelectorAll('.slider-row input[type="range"]').forEach(r => {
            r.style.setProperty('--main-bg', bgColor);
        });
    }

    // 色块点击
    let selectedColorIndex = 0;
    colorBlocks.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            // 清除所有颜色按钮的选中状态
            colorBlocks.forEach(b => b.classList.remove('selected'));
            // 清除所有四季按钮的选中状态
            document.querySelectorAll('.season-btn').forEach(b => b.classList.remove('active'));
            // 设置当前颜色按钮为选中状态
            btn.classList.add('selected');
            selectedColorIndex = index;
            // 清除当前季节
            currentSeason = null;
            // 更新背景色
            baseColor = btn.getAttribute('data-bg');
            updateBg();
            // 色卡颜色与背景同步
            colorBlocks.forEach(b => {
                if (b.classList.contains('selected')) {
                    b.style.background = mainBg.style.background;
                } else {
                    b.style.background = b.getAttribute('data-bg');
                }
            });
        });
    });

    // 色环滑动
    hueSlider.addEventListener('input', e => {
        hue = e.target.value;
        updateBg();
    });

    // 饱和度滑动
    saturationSlider.addEventListener('input', e => {
        saturation = e.target.value;
        saturationValue.textContent = `${saturation}%`;
        updateBg();
    });
    // 亮度滑动
    brightnessSlider.addEventListener('input', e => {
        brightness = e.target.value;
        brightnessValue.textContent = `${brightness}%`;
        updateBg();
    });

    // 比例切换
    ratioBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            ratioBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            let ratio = btn.getAttribute('data-ratio');
            cameraContainer.style.width = '';
            cameraContainer.style.aspectRatio = '';
            cameraContainer.style.height = '';
            if (ratio === '1:1') {
                cameraContainer.style.height = '';
            } else if (ratio === '4:3') {
                // 高度=宽度*3/4
                const width = cameraContainer.clientWidth;
                cameraContainer.style.height = (width * 3 / 4) + 'px';
            } else if (ratio === '16:9') {
                // 高度=宽度*9/16
                const width = cameraContainer.clientWidth;
                cameraContainer.style.height = (width * 9 / 16) + 'px';
            }
        });
    });

    // 工具函数：hex转rgb
    function hexToRgb(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) {
            hex = hex.split('').map(x => x + x).join('');
        }
        const num = parseInt(hex, 16);
        return {
            r: (num >> 16) & 255,
            g: (num >> 8) & 255,
            b: num & 255
        };
    }
    // 工具函数：rgb转hsl
    function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) {
            h = s = 0;
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h, s, l };
    }

    // 初始化
    updateBg();
    // 默认选中第一个颜色按钮
    colorBlocks[0].classList.add('selected');
    colorBlocks[0].style.background = mainBg.style.background;
    initCamera();
    // 初始化滑块显示
    saturationValue.textContent = `${saturation}%`;
    brightnessValue.textContent = `${brightness}%`;

    // 四季色板数据
    const SEASONS = {
        spring: [
            '#e45833', '#f6852e', '#f5d2b9', '#fb9885', '#fb7560',
            '#e89a30', '#dcaa62', '#e7bb5d', '#fbdb0d', '#fdd314',
            '#ddeb7a', '#a6d48b', '#abe053', '#9ac935', '#aadbb8',
            '#5ab7c7', '#00afcc', '#00accd', '#3f63df', '#cc7eb0'
        ],
        summer: [
            '#a03341', '#d34d66', '#ea8aa8', '#cc8aa6', '#ecbbb9',
            '#fbdfe4', '#fcfdbd', '#81bea5', '#60b39b', '#06ab93',
            '#a6bdca', '#87badb', '#b9c9d8', '#768897', '#8ca1d3',
            '#a09cc4', '#c7b7d4', '#a68ab8', '#b6aac9', '#71626a'
        ],
        autumn: [
            '#b55033', '#702e20', '#f3b389', '#fca606', '#ec7903',
            '#eb9c36', '#dea866', '#957638', '#80512e', '#8a4511',
            '#cfb74b', '#e6ba5e', '#767f44', '#03640a', '#014d1f',
            '#027991', '#016784', '#1b5d7d', '#305669', '#43374b'
        ],
        winter: [
            '#d70832', '#e40277', '#7c1c2f', '#fcdee1', '#feff5c',
            '#b9e3cb', '#099177', '#089177', '#087a6b', '#066840',
            '#1980bf', '#014999', '#1257a8', '#1a2f58', '#275573',
            '#c7b9d3', '#a29bc3', '#705299', '#54539f', '#670c1b'
        ]
    };

    let currentSeason = null;
    let currentColorIdx = 0;

    // 四季按钮事件处理
    const seasonBtns = document.querySelectorAll('.season-btn');
    seasonBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const season = btn.getAttribute('data-season');
            // 清除所有四季按钮的选中状态
            seasonBtns.forEach(b => b.classList.remove('active'));
            // 清除所有颜色按钮的选中状态
            colorBlocks.forEach(b => b.classList.remove('selected'));
            // 设置当前四季按钮为选中状态
            btn.classList.add('active');
            
            if (currentSeason === season) {
                // 如果点击当前季节，切换到下一个颜色
                currentColorIdx = (currentColorIdx + 1) % SEASONS[season].length;
            } else {
                // 如果切换到新季节，重置颜色索引
                currentSeason = season;
                currentColorIdx = 0;
            }
            
            // 更新背景色
            baseColor = SEASONS[season][currentColorIdx];
            updateBg();
        });
    });

    // 点击背景切换颜色
    mainBg.addEventListener('click', (e) => {
        if (e.target === mainBg) {
            if (currentSeason) {
                // 如果当前在四季模式，切换到下一个四季颜色
                currentColorIdx = (currentColorIdx + 1) % SEASONS[currentSeason].length;
                baseColor = SEASONS[currentSeason][currentColorIdx];
            } else if (document.querySelector('.color-block.selected')) {
                // 如果在普通模式且有选中的颜色按钮，切换到下一个颜色按钮的颜色
                selectedColorIndex = (selectedColorIndex + 1) % colorBlocks.length;
                const nextColorBlock = colorBlocks[selectedColorIndex];
                colorBlocks.forEach(b => b.classList.remove('selected'));
                nextColorBlock.classList.add('selected');
                baseColor = nextColorBlock.getAttribute('data-bg');
            }
            updateBg();
        }
    });

    // 弹窗相关元素
    const seasonTestBtn = document.getElementById('seasonTestBtn');
    const seasonModal = document.getElementById('seasonModal');
    const seasonModalContent = document.getElementById('seasonModalContent');
    const seasonName = document.getElementById('seasonName');
    const seasonArrow = document.getElementById('seasonArrow');
    const seasonColorArea = document.getElementById('seasonColorArea');

    // 显示弹窗
    seasonTestBtn.addEventListener('click', () => {
        seasonModal.classList.add('show');
        currentSeason = null;
        currentColorIdx = 0;
        renderSeasonModal();
    });
    // 切换季节
    seasonArrow.addEventListener('click', (e) => {
        e.stopPropagation();
        currentSeason = null;
        currentColorIdx = 0;
        renderSeasonModal();
    });
    // 切换当前季节下一个颜色
    seasonColorArea.addEventListener('click', (e) => {
        e.stopPropagation();
        const colors = SEASONS[currentSeason];
        currentColorIdx = (currentColorIdx + 1) % colors.length;
        renderSeasonModal();
    });
    // 点击弹窗外关闭
    seasonModal.addEventListener('click', (e) => {
        if (e.target === seasonModal) {
            seasonModal.classList.remove('show');
        }
    });
    // 渲染弹窗内容
    function renderSeasonModal() {
        const season = SEASONS[currentSeason];
        seasonName.textContent = currentSeason ? currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1) : 'Select a Season';
        // seasonModalContent.style.background = season.colors[currentColorIdx]; // 不再需要
        // 始终白色
        seasonName.style.color = '#fff';
        seasonArrow.style.color = '#fff';
    }
    // 字体色自适应
    function getContrastYIQ(hexcolor){
        hexcolor = hexcolor.replace('#', '');
        if (hexcolor.length === 3) hexcolor = hexcolor.split('').map(x=>x+x).join('');
        var r = parseInt(hexcolor.substr(0,2),16);
        var g = parseInt(hexcolor.substr(2,2),16);
        var b = parseInt(hexcolor.substr(4,2),16);
        var yiq = ((r*299)+(g*587)+(b*114))/1000;
        return (yiq >= 180) ? '#222' : '#fff';
    }

    // 仅在点击.main-bg空白处时切换panel显示/隐藏
    let panelVisible = true;
    document.querySelector('.main-bg').addEventListener('click', function(e) {
        const panel = document.querySelector('.panel');
        // 只在点击.main-bg本身（非其子元素）时触发
        if (e.target === this) {
            panelVisible = !panelVisible;
            if (panelVisible) {
                panel.style.opacity = '1';
                panel.style.visibility = 'visible';
                panel.style.pointerEvents = 'auto';
            } else {
                panel.style.opacity = '0';
                panel.style.visibility = 'hidden';
                panel.style.pointerEvents = 'none';
            }
        }
    });

    // 拍照并保存
    const takePhotoBtn = document.getElementById('takePhoto');
    takePhotoBtn.addEventListener('click', () => {
        const video = document.getElementById('camera');
        const container = document.querySelector('.camera-container');
        // 获取当前容器宽高
        const width = container.clientWidth;
        const height = container.clientHeight;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        // 画面镜像
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, width, height);
        // 下载图片
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'photo.png';
        link.click();
    });
}); 