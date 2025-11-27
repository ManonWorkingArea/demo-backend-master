// TooltipPlugin.js
const TooltipPlugin = {
  install(app) {
    app.directive('custom-tooltip', {
      mounted(el, binding) {
        const { text, position } = binding.value;

        let tooltipEl; // Define tooltip element outside of event listeners

        el.addEventListener('mouseenter', (event) => {
          tooltipEl = document.createElement('div');
          tooltipEl.classList.add(
            'bg-gray-800',
            'text-white',
            'p-2',
            'rounded-md',
            'absolute',
            'tooltip',
            'hidden'
          );

          switch (position) {
            case 'top':
              tooltipEl.classList.add('tooltip-top');
              break;
            case 'bottom':
              tooltipEl.classList.add('tooltip-bottom');
              break;
            case 'left':
              tooltipEl.classList.add('tooltip-left');
              break;
            case 'right':
              tooltipEl.classList.add('tooltip-right');
              break;
          }

          tooltipEl.textContent = text;
          document.body.appendChild(tooltipEl);

          // Calculate tooltip position based on mouse event
          const tooltipWidth = tooltipEl.offsetWidth;
          const tooltipHeight = tooltipEl.offsetHeight;
          const mouseX = event.clientX;
          const mouseY = event.clientY;

          // Adjust tooltip position to avoid being cut off at edges
          let tooltipX = mouseX + 10;
          let tooltipY = mouseY + 10;

          if (position === 'top') {
            tooltipY = mouseY - tooltipHeight - 10;
          } else if (position === 'bottom') {
            tooltipY = mouseY + 10;
          } else if (position === 'left') {
            tooltipX = mouseX - tooltipWidth - 10;
          } else if (position === 'right') {
            tooltipX = mouseX + 10;
          }

          tooltipEl.style.left = tooltipX + 'px';
          tooltipEl.style.top = tooltipY + 'px';
        });

        el.addEventListener('mouseleave', () => {
          if (tooltipEl) {
            tooltipEl.remove();
            tooltipEl = null;
          }
        });
      }
    });
  }
};

export default TooltipPlugin;
