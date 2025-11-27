class DeviceUtils {
  isMobile() {
    return window.innerWidth <= 768;
  }

  deviceDetect() {
    return this.isMobile() ? 'mobile' : 'desktop';
  }
}

const deviceUtils = new DeviceUtils();
export default deviceUtils;
