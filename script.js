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
    let baseColor = '#a259e6';
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
    colorBlocks.forEach(btn => {
        btn.addEventListener('click', () => {
            colorBlocks.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
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
    // 默认选中第一个
    colorBlocks[0].classList.add('selected');
    colorBlocks[0].style.background = mainBg.style.background;

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
            if (ratio === '1:1') {
                cameraContainer.style.aspectRatio = '1/1';
            } else if (ratio === '3:4') {
                cameraContainer.style.aspectRatio = '3/4';
            } else if (ratio === '9:16') {
                cameraContainer.style.aspectRatio = '9/16';
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
    initCamera();
    // 初始化滑块显示
    saturationValue.textContent = `${saturation}%`;
    brightnessValue.textContent = `${brightness}%`;

    // 四季色板数据
    const SEASONS = [
        {
            name: '春',
            colors: [
                '#f47a4e','#f7a94e','#f7d6b2','#f7b2b2','#f7a2a2',
                '#f7e14e','#f7e97a','#b2e77a','#7ad97a','#2eb67a',
                '#b2f7e1','#7ad9e7','#4ea2f7','#4e7af7','#b27af7'
            ]
        },
        {
            name: '夏',
            colors: [
                '#b24e6e','#e77aa2','#f7b2d6','#f7e7e1','#e1f7f7',
                '#b2e7e7','#7ad9e7','#4ea2f7','#7a9ef7','#b2b2f7',
                '#e1e1f7','#b2b2d6','#7a7ab2','#4e4e7a','#7a7a7a'
            ]
        },
        {
            name: '秋',
            colors: [
                '#b25e2e','#7a3e1e','#f7a94e','#f7d67a','#b2a24e',
                '#7a6e4e','#4e7a4e','#2e4e2e','#4e7a7a','#2e7a7a',
                '#2e4e7a','#4e6ea2','#7a9eb2','#b2b2b2','#4e4e4e'
            ]
        },
        {
            name: '冬',
            colors: [
                '#f74e7a','#b24e7a','#7a2e4e','#f7e14e','#b2e7e7',
                '#4ea2f7','#2e4e7a','#4e7af7','#7a7ab2','#b2b2f7',
                '#e1e1f7','#b2b2d6','#7a7ab2','#4e4e7a','#7a7a7a'
            ]
        }
    ];
    let currentSeason = 0;
    let currentColorIdx = 0;

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
        currentSeason = 0;
        currentColorIdx = 0;
        renderSeasonModal();
    });
    // 切换季节
    seasonArrow.addEventListener('click', (e) => {
        e.stopPropagation();
        currentSeason = (currentSeason + 1) % SEASONS.length;
        currentColorIdx = 0;
        renderSeasonModal();
    });
    // 切换当前季节下一个颜色
    seasonColorArea.addEventListener('click', (e) => {
        e.stopPropagation();
        const colors = SEASONS[currentSeason].colors;
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
        seasonName.textContent = season.name;
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
}); 