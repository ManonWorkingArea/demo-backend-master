export default {
    data() {
      return {
        imageStyle: ''
      }
    },
    methods: {
      rotateImage(degrees) {
        this.imageStyle = `transform: rotate(${degrees}deg);`;
      },
      flipImage(direction) {
        this.imageStyle = `transform: scale(${direction === 'horizontal' ? -1 : 1}, ${direction === 'vertical' ? -1 : 1});`;
      },
      resizeImage(width, height) {
        this.imageStyle = `width: ${width}px; height: ${height}px;`;
      },
      cropImage(x, y, width, height) {
        this.imageStyle = `clip: rect(${y}px, ${x + width}px, ${y + height}px, ${x}px);`;
      }
    }
  }
  