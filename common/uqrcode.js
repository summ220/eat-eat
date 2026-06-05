import UQRCode from '@/uni_modules/Sansnn-uQRCode/js_sdk/uqrcode/uqrcode.js'

// 纯 JS 实现的 string 转 base64 辅助函数，确保任何环境下无 DOM 依赖，绝对稳定
function stringToBase64(str) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let bytes = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0xd800 || code >= 0xe000) {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    }
  }
  let result = '';
  let i;
  for (i = 0; i < bytes.length - 2; i += 3) {
    result += chars[bytes[i] >> 2];
    result += chars[((bytes[i] & 0x03) << 4) | (bytes[i + 1] >> 4)];
    result += chars[((bytes[i + 1] & 0x0f) << 2) | (bytes[i + 2] >> 6)];
    result += chars[bytes[i + 2] & 0x3f];
  }
  if (i < bytes.length) {
    result += chars[bytes[i] >> 2];
    if (i === bytes.length - 1) {
      result += chars[(bytes[i] & 0x03) << 4];
      result += '==';
    } else {
      result += chars[((bytes[i] & 0x03) << 4) | (bytes[i + 1] >> 4)];
      result += chars[(bytes[i + 1] & 0x0f) << 2];
      result += '=';
    }
  }
  return result;
}

/**
 * 纯 JS 离线生成二维码 SVG 并转为 Base64 格式
 * 完美摆脱微信小程序 Canvas 组件兼容性 Bug，100% 稳定清晰
 */
export function generateQrCodeSvg(text, options = {}) {
  const defaults = {
    typeNumber: 3,
    errorCorrectLevel: UQRCode.errorCorrectLevel.M,
    colorDark: '#2C3E50',
    colorLight: '#FFFFFF',
    margin: 2
  };
  
  const opts = Object.assign({}, defaults, options);
  
  // 实例化 UQRCode 纯内存矩阵生成器
  const qr = new UQRCode();
  qr.data = text;
  qr.typeNumber = opts.typeNumber;
  qr.errorCorrectLevel = opts.errorCorrectLevel;
  qr.make();
  
  const count = qr.moduleCount;
  const margin = opts.margin;
  const size = count + margin * 2;
  
  // 拼接 SVG 路径
  const path = [];
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (qr.modules[row][col].isBlack) {
        const x = col + margin;
        const y = row + margin;
        path.push(`M${x},${y}h1v1h-1z`);
      }
    }
  }
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="100%" height="100%">` +
              `<rect width="100%" height="100%" fill="${opts.colorLight}"/>` +
              `<path d="${path.join('')}" fill="${opts.colorDark}" shape-rendering="crispEdges"/>` +
              `</svg>`;
              
  return 'data:image/svg+xml;base64,' + stringToBase64(svg);
}
