export function uploadImg(selector) {
    return {
        data() {
            return {
                showUploadPopup: false,
                editingImg: '',
                originalElement: null,
                editableImgs: [],
                currentAngle: 0,
                resizeValue: 1,
                flipDirection: 'horizontal',
                currentLeft: 0,
                currentTop: 0,
            };
        },
        mounted() {
            this.addUploadButtons();
        },
        methods: {

            move(direction) {
                let top = parseInt(this.$refs.popupBox.querySelector('img').style.top) || 0;
                let left = parseInt(this.$refs.popupBox.querySelector('img').style.left) || 0;

                // Set the position property to relative if it is not already set
                if (this.$refs.popupBox.querySelector('img').style.position !== 'relative') {
                    this.$refs.popupBox.querySelector('img').style.position = 'relative';
                }

                if (direction === 'up') {
                    top -= 10;
                } else if (direction === 'down') {
                    top += 10;
                } else if (direction === 'left') {
                    left -= 10;
                } else if (direction === 'right') {
                    left += 10;
                }

                this.$refs.popupBox.querySelector('img').style.top = `${top}px`;
                this.$refs.popupBox.querySelector('img').style.left = `${left}px`;
            },
            rotate() {
                this.currentAngle += 45;
                if (this.currentAngle >= 360) {
                    this.currentAngle = 0;
                }
                const previewBoxImg = this.$refs.popupBox.querySelector('img');
                previewBoxImg.style.transform = `rotate(${this.currentAngle}deg) scale${this.flipDirection === 'horizontal' ? 'X' : 'Y'}(-1)`;
            },
            flip() {
                this.flipDirection = this.flipDirection === 'horizontal' ? 'vertical' : 'horizontal';
                const previewBoxImg = this.$refs.popupBox.querySelector('img');
                previewBoxImg.style.transform = `rotate(${this.currentAngle}deg) scale${this.flipDirection === 'horizontal' ? 'X' : 'Y'}(-1)`;
            },
            resize() {
                // Find the image element inside the popup box
                const image = this.$refs.popupBox.querySelector('img');

                // Check if the image element exists
                if (image) {
                    // Set the transform property of the image element
                    image.style.transform = `scale(${this.resizeValue})`;
                }
            },
            crop() {
                console.log("Crop")
                // Find the image element inside the popup box
                const image = this.$refs.popupBox.querySelector('img');

                // Check if the div element that wraps the image exists
                let wrapper = this.$refs.popupBox.querySelector('div.crop');
                if (!wrapper) {
                    // If the div element does not exist, create it and append the image element to it
                    wrapper = document.createElement('div');
                    wrapper.classList.add('crop');
                    image.parentNode.replaceChild(wrapper, image);
                    wrapper.appendChild(image);
                }

                // Set the width and height of the wrapper element to the original dimensions of the image
                // and add the overflow: hidden style property
                wrapper.style.width = `${image.naturalWidth}px`;
                wrapper.style.height = `${image.naturalHeight}px`;
                wrapper.style.overflow = 'hidden';

                // Set the clip property of the image element to a rectangle with the dimensions of the wrapper element
                image.style.clip = `rect(0px, ${wrapper.offsetWidth}px, ${wrapper.offsetHeight}px, 0px)`;

                // Check if the htmlContainer ref is defined
                if (this.$parent.$refs.htmlContainer) {
                    // Get the HTML string from the v-html directive
                    this.$parent.htmlContent = this.$parent.$refs.htmlContainer.innerHTML;
                }

                // Add the upload buttons again
                this.addUploadButtons();
            },
            addUploadButtons() {
                // Get all elements matching the selector
                const uploadElements = document.querySelectorAll(selector);

                // Loop through the upload elements
                for (const element of uploadElements) {
                    // Store the original src of the element
                    const originalSrc = element.src;

                    // Check if the element is wrapped in a div element with the crop class
                    let wrapper = element.parentNode;
                    if (!wrapper || !wrapper.classList.contains('crop')) {
                        // If the element is not wrapped in a div element with the crop class, wrap it in one
                        wrapper = document.createElement('div');
                        wrapper.classList.add('crop');
                        element.parentNode.replaceChild(wrapper, element);
                        wrapper.appendChild(element);
                    }

                    // Add a click event listener to the element that shows the upload popup
                    element.addEventListener('click', () => {
                        this.editingImg = originalSrc;
                        this.originalElement = element;
                        if (this.$refs.popupBox) {
                            const previewBoxImg = this.$refs.popupBox.querySelector('img');
                            if (previewBoxImg) {
                                previewBoxImg.style = element.getAttribute('style');
                                previewBoxImg.style.clip = element.style.clip;
                                previewBoxImg.style.transform = element.style.transform;
                                this.crop(previewBoxImg);
                            }
                        }
                        this.showPopup = true;
                        this.showUploadPopup = true;
                    });

                    // Add the element to the editable imgs array
                    this.editableImgs.push(element);
                }
            },
            previewImg(event) {
                const file = event.target.files[0];
                const reader = new FileReader();

                reader.onloadend = () => {
                    this.editingImg = reader.result;
                };
                reader.readAsDataURL(file);
            },
            saveEditingImg() {
                // Get the preview image element
                const previewBoxImg = this.$refs.popupBox.querySelector('img');

                // Set the src attribute and the style attribute of the original element
                this.originalElement.src = this.editingImg;
                this.originalElement.style = previewBoxImg.getAttribute('style');

                // Check if the original element has a parent element with the crop class
                const cropElement = this.originalElement.parentElement;
                if (cropElement && cropElement.classList.contains('crop')) {
                    // Update the style attribute of the crop element
                    cropElement.style = previewBoxImg.parentElement.getAttribute('style');
                }

                // Check if the htmlContainer ref is defined
                if (this.$parent.$refs.htmlContainer) {
                    // Get the HTML string from the v-html directive
                    this.$parent.htmlContent = this.$parent.$refs.htmlContainer.innerHTML;
                }

                // Add the upload buttons again
                this.addUploadButtons();

                // Hide the overlay and reset the showUploadPopup property
                this.showPopup = false;
                this.showUploadPopup = false;
                this.editingImg = '';
            },
        },
    };
}