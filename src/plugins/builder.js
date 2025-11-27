function generateStyles(item) {
    //console.log("item",item);
    const responsiveClasses = generateResponsiveClassNames(item);
    const classNames = generateClassNames(item);
    const combinedStyles = generateCombinedStyles(item);  
    return {
      classes: `${responsiveClasses} ${classNames}`,
      style: combinedStyles,
    };
  }
  
  function generateResponsiveClassNames(item) {
    const responsiveClasses = [];
  
    if (item && item.mobile && !item.tablet && !item.labtop && !item.desktop) {
      responsiveClasses.push('block sm:hidden');
    }
    if (item && item.mobile && item.tablet && !item.labtop && !item.desktop) {
      responsiveClasses.push('block sm:block md:hidden');
    }
    if (item && item.mobile && item.tablet && item.labtop && !item.desktop) {
      responsiveClasses.push('block sm:block md:block lg:hidden');
    }
    if (item && item.mobile && item.tablet && item.labtop && item.desktop) {
      responsiveClasses.push('block');
    }
    if (item && !item.mobile && item.tablet && !item.labtop && !item.desktop) {
      responsiveClasses.push('hidden sm:block md:hidden');
    }
    if (item && !item.mobile && item.tablet && item.labtop && !item.desktop) {
      responsiveClasses.push('hidden sm:block md:block lg:hidden');
    }
    if (item && !item.mobile && item.tablet && item.labtop && item.desktop) {
      responsiveClasses.push('hidden sm:block md:block');
    }
    if (item && !item.mobile && !item.tablet && item.labtop && !item.desktop) {
      responsiveClasses.push('hidden md:block lg:hidden');
    }
    if (item && !item.mobile && !item.tablet && item.labtop && item.desktop) {
      responsiveClasses.push('hidden md:block');
    }
    if (item && !item.mobile && !item.tablet && !item.labtop && item.desktop) {
      responsiveClasses.push('hidden lg:block');
    }
    if (item && !item.mobile && !item.tablet && !item.labtop && !item.desktop) {
      responsiveClasses.push('hidden');
    }
    return responsiveClasses.join(' ');
  }
  
  function generateClassNames(item) {
    const classes = [];

    if (item && item.showShadow) {
      classes.push('shadow-lg');
    }

    if (item && item.position) {
      classes.push(`${item.position}`);
    }
    // Padding
    if (item && item.paddingTop) {
      classes.push(`pt-${item.paddingTop}`);
    }
    if (item && item.paddingRight) {
      classes.push(`pr-${item.paddingRight}`);
    }
    if (item && item.paddingBottom) {
      classes.push(`pb-${item.paddingBottom}`);
    }
    if (item && item.paddingLeft) {
      classes.push(`pl-${item.paddingLeft}`);
    }
    // Margin
    if (item && item.marginTop) {
      classes.push(`mt-${item.marginTop}`);
    }
    if (item && item.marginRight) {
      classes.push(`mr-${item.marginRight}`);
    }
    if (item && item.marginBottom) {
      classes.push(`mb-${item.marginBottom}`);
    }
    if (item && item.marginLeft) {
      classes.push(`ml-${item.marginLeft}`);
    }

    // // Padding
    // if (item && item.paddingInnerTop) {
    //   classes.push(`pt-${item.paddingInnerTop}`);
    // }
    // if (item && item.paddingInnerRight) {
    //   classes.push(`pr-${item.paddingInnerRight}`);
    // }
    // if (item && item.paddingInnerBottom) {
    //   classes.push(`pb-${item.paddingInnerBottom}`);
    // }
    // if (item && item.paddingInnerLeft) {
    //   classes.push(`pl-${item.paddingInnerLeft}`);
    // }
    // // Margin
    // if (item && item.marginInnerTop) {
    //   classes.push(`mt-${item.marginInnerTop}`);
    // }
    // if (item && item.marginInnerRight) {
    //   classes.push(`mr-${item.marginInnerRight}`);
    // }
    // if (item && item.marginInnerBottom) {
    //   classes.push(`mb-${item.marginInnerBottom}`);
    // }
    // if (item && item.marginInnerLeft) {
    //   classes.push(`ml-${item.marginInnerLeft}`);
    // }

    // if (item && item.height) {
    //   classes.push(`${item.height}`);
    // }

    // Border
    const borderClasses = [];
    if (item && item.borderLeftWidth) {
      if (item.borderLeftWidth === '1') {
        borderClasses.push('border-l');
      } else if (item.borderLeftWidth === '0') {
        borderClasses.push('border-l-0');
      } else {
        borderClasses.push(`border-l-${item.borderLeftWidth}`);
      }
    }
    if (item && item.borderTopWidth) {
      if (item.borderTopWidth === '1') {
        borderClasses.push('border-t');
      } else if (item.borderTopWidth === '0') {
        borderClasses.push('border-t-0');
      } else {
        borderClasses.push(`border-t-${item.borderTopWidth}`);
      }
    }
    if (item && item.borderRightWidth) {
      if (item.borderRightWidth === '1') {
        borderClasses.push('border-r');
      } else if (item.borderRightWidth === '0') {
        borderClasses.push('border-r-0');
      } else {
        borderClasses.push(`border-r-${item.borderRightWidth}`);
      }
    }
    if (item && item.borderBottomWidth) {
      if (item.borderBottomWidth === '1') {
        borderClasses.push('border-b');
      } else if (item.borderBottomWidth === '0') {
        borderClasses.push('border-b-0');
      } else {
        borderClasses.push(`border-b-${item.borderBottomWidth}`);
      }
    }
    if (item && item.borderColor) {
      borderClasses.push(`border-${item.borderColor}`);
    }
    if (item && item.borderStyle) {
      borderClasses.push(`border-${item.borderStyle}`);
    }
    if (borderClasses.length > 0) {
      classes.push(borderClasses.join(' '));
    }
    return classes.join(' ');
  }
  
  function generateCombinedStyles(item) {
    const backgroundStyles = generateBackgroundStyles(item);
    const borderStyles = generateBorderStyles(item);
    const combinedStyles = {
      ...backgroundStyles,
      ...borderStyles,
    };
    return generateStyleAttribute(combinedStyles);
  }
  
  function generateBackgroundStyles(item) {
    if (item && item.bgType === 'color') {
      return {
        'background-color': item.bgColor + ';',
      };
    } else if (item && item.bgType === 'image') {
      return {
        'background-image': `url(${item.bgImage});`,
      };
    } else if (item && item.bgType === 'gradient') {
      return {
        'background-image': `linear-gradient(to bottom right, ${item.bgGradientColor1}, ${item.bgGradientColor2});`,
      };
    } else if (item && item.bgType === 'video') {
      return {
        'background-image': `url(${item.bgVideo});`,
      };
    } else if (item && item.bgType === 'none') {
      return {};
    } else if (!item || !item.bgType) {
      return {};
    }
  
    if (item && item.bgInnerType === 'color') {
      return {
        'background-color': item.bgInnerColor + ';',
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
    } else if (item && item.bgInnerType === 'none') {
      return {};
    } else if (!item || !item.bgInnerType) {
      return {};
    }
    return {};
  }
  
  function generateBorderStyles(item) {
    const borderStyles = {};
  
    if (item && item.borderRadiusTopLeft) {
      borderStyles['border-top-left-radius'] = item.borderRadiusTopLeft + 'px';
    }
    if (item && item.borderRadiusTopRight) {
      borderStyles['border-top-right-radius'] = item.borderRadiusTopRight + 'px';
    }
    if (item && item.borderRadiusBottomRight) {
      borderStyles['border-bottom-right-radius'] = item.borderRadiusBottomRight + 'px';
    }
    if (item && item.borderRadiusBottomLeft) {
      borderStyles['border-bottom-left-radius'] = item.borderRadiusBottomLeft + 'px';
    }
  
    return borderStyles;
  }
  
  function generateStyleAttribute(styleProperties) {
    return Object.keys(styleProperties)
      .map((property) => `${property}: ${styleProperties[property]}`)
      .join('; ');
  }
  
  export {
    generateStyles,
  };
  