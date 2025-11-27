export function customRotate(imageRef) {
    // Your logic for rotating the image goes here
    // For example:
    const currentRotation = imageRef.style.transform
    imageRef.style.transform = `${currentRotation} rotate(90deg)`
  }
  export function customFlip(imageRef) {
    // Your logic for flipping the image goes here
    // For example:
    const currentScale = imageRef.style.transform
    imageRef.style.transform = `${currentScale} scaleX(-1)`
  }
  
  export function customResize(imageRef, width, height) {
    // Your logic for resizing the image goes here
    // For example:
    imageRef.style.width = `${width}px`
    imageRef.style.height = `${height}px`
  }
  
  export function customCrop(imageRef, x, y, width, height) {
    // Your logic for cropping the image goes here
    // For example:
    imageRef.style.clip = `rect(${y}px, ${x + width}px, ${y + height}px, ${x}px)`
  }
  