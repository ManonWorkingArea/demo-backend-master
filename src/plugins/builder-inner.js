function generateInnerStyles(item) {
    //console.log("item",item);
    const classNames = generateClassNames(item);
    const combinedStyles = generateCombinedStyles(item);  
    return {
      classes: `${classNames}`,
      style: combinedStyles,
    };
  }
  
  function generateClassNames(item) {
    const classes = [];
    // Padding
    if (item && item.paddingInnerTop) {
      classes.push(`pt-${item.paddingInnerTop}`);
    }
    if (item && item.paddingInnerRight) {
      classes.push(`pr-${item.paddingInnerRight}`);
    }
    if (item && item.paddingInnerBottom) {
      classes.push(`pb-${item.paddingInnerBottom}`);
    }
    if (item && item.paddingInnerLeft) {
      classes.push(`pl-${item.paddingInnerLeft}`);
    }
    return classes.join(' ');
  }
  
  function generateCombinedStyles(item) {
    const backgroundStyles = generateBackgroundStyles(item);
    const combinedStyles = {
      ...backgroundStyles,
    };
    return generateStyleAttribute(combinedStyles);
  }
  
  function generateBackgroundStyles(item) {
    if (item && item.bgInnerType === 'color') {
      return {
        'background-color': item.bgInnerColor  + ';',
      };
    } else if (item && item.bgInnerType === 'image') {
      return {
        'background-image': `url(${item.bgInnerImage});`,
      };
    } else if (item && item.bgInnerType === 'gradient') {
      return {
        'background-image': `linear-gradient(to bottom right, ${item.bgInnerGradientColor1}, ${item.bgInnerGradientColor2});`,
      };
    } else if (item && item.bgInnerType === 'video') {
      return {
        'background-image': `url(${item.bgInnerVideo});`,
      };
    }
  
    return {};
  }

  function generateStyleAttribute(styleProperties) {
    return Object.keys(styleProperties)
      .map((property) => `${property}: ${styleProperties[property]}`)
      .join('; ');
  }
  
  export {
    generateInnerStyles,
  };
  