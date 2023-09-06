/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/vanilla-tilt/lib/vanilla-tilt.js":
/*!*******************************************************!*\
  !*** ./node_modules/vanilla-tilt/lib/vanilla-tilt.js ***!
  \*******************************************************/
/***/ ((module) => {



var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

/**
 * Created by Sergiu Șandor (micku7zu) on 1/27/2017.
 * Original idea: https://github.com/gijsroge/tilt.js
 * MIT License.
 * Version 1.8.1
 */

var VanillaTilt = function () {
  function VanillaTilt(element) {
    var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    classCallCheck(this, VanillaTilt);

    if (!(element instanceof Node)) {
      throw "Can't initialize VanillaTilt because " + element + " is not a Node.";
    }

    this.width = null;
    this.height = null;
    this.clientWidth = null;
    this.clientHeight = null;
    this.left = null;
    this.top = null;

    // for Gyroscope sampling
    this.gammazero = null;
    this.betazero = null;
    this.lastgammazero = null;
    this.lastbetazero = null;

    this.transitionTimeout = null;
    this.updateCall = null;
    this.event = null;

    this.updateBind = this.update.bind(this);
    this.resetBind = this.reset.bind(this);

    this.element = element;
    this.settings = this.extendSettings(settings);

    this.reverse = this.settings.reverse ? -1 : 1;
    this.resetToStart = VanillaTilt.isSettingTrue(this.settings["reset-to-start"]);
    this.glare = VanillaTilt.isSettingTrue(this.settings.glare);
    this.glarePrerender = VanillaTilt.isSettingTrue(this.settings["glare-prerender"]);
    this.fullPageListening = VanillaTilt.isSettingTrue(this.settings["full-page-listening"]);
    this.gyroscope = VanillaTilt.isSettingTrue(this.settings.gyroscope);
    this.gyroscopeSamples = this.settings.gyroscopeSamples;

    this.elementListener = this.getElementListener();

    if (this.glare) {
      this.prepareGlare();
    }

    if (this.fullPageListening) {
      this.updateClientSize();
    }

    this.addEventListeners();
    this.reset();

    if (this.resetToStart === false) {
      this.settings.startX = 0;
      this.settings.startY = 0;
    }
  }

  VanillaTilt.isSettingTrue = function isSettingTrue(setting) {
    return setting === "" || setting === true || setting === 1;
  };

  /**
   * Method returns element what will be listen mouse events
   * @return {Node}
   */


  VanillaTilt.prototype.getElementListener = function getElementListener() {
    if (this.fullPageListening) {
      return window.document;
    }

    if (typeof this.settings["mouse-event-element"] === "string") {
      var mouseEventElement = document.querySelector(this.settings["mouse-event-element"]);

      if (mouseEventElement) {
        return mouseEventElement;
      }
    }

    if (this.settings["mouse-event-element"] instanceof Node) {
      return this.settings["mouse-event-element"];
    }

    return this.element;
  };

  /**
   * Method set listen methods for this.elementListener
   * @return {Node}
   */


  VanillaTilt.prototype.addEventListeners = function addEventListeners() {
    this.onMouseEnterBind = this.onMouseEnter.bind(this);
    this.onMouseMoveBind = this.onMouseMove.bind(this);
    this.onMouseLeaveBind = this.onMouseLeave.bind(this);
    this.onWindowResizeBind = this.onWindowResize.bind(this);
    this.onDeviceOrientationBind = this.onDeviceOrientation.bind(this);

    this.elementListener.addEventListener("mouseenter", this.onMouseEnterBind);
    this.elementListener.addEventListener("mouseleave", this.onMouseLeaveBind);
    this.elementListener.addEventListener("mousemove", this.onMouseMoveBind);

    if (this.glare || this.fullPageListening) {
      window.addEventListener("resize", this.onWindowResizeBind);
    }

    if (this.gyroscope) {
      window.addEventListener("deviceorientation", this.onDeviceOrientationBind);
    }
  };

  /**
   * Method remove event listeners from current this.elementListener
   */


  VanillaTilt.prototype.removeEventListeners = function removeEventListeners() {
    this.elementListener.removeEventListener("mouseenter", this.onMouseEnterBind);
    this.elementListener.removeEventListener("mouseleave", this.onMouseLeaveBind);
    this.elementListener.removeEventListener("mousemove", this.onMouseMoveBind);

    if (this.gyroscope) {
      window.removeEventListener("deviceorientation", this.onDeviceOrientationBind);
    }

    if (this.glare || this.fullPageListening) {
      window.removeEventListener("resize", this.onWindowResizeBind);
    }
  };

  VanillaTilt.prototype.destroy = function destroy() {
    clearTimeout(this.transitionTimeout);
    if (this.updateCall !== null) {
      cancelAnimationFrame(this.updateCall);
    }

    this.element.style.willChange = "";
    this.element.style.transition = "";
    this.element.style.transform = "";
    this.resetGlare();

    this.removeEventListeners();
    this.element.vanillaTilt = null;
    delete this.element.vanillaTilt;

    this.element = null;
  };

  VanillaTilt.prototype.onDeviceOrientation = function onDeviceOrientation(event) {
    if (event.gamma === null || event.beta === null) {
      return;
    }

    this.updateElementPosition();

    if (this.gyroscopeSamples > 0) {
      this.lastgammazero = this.gammazero;
      this.lastbetazero = this.betazero;

      if (this.gammazero === null) {
        this.gammazero = event.gamma;
        this.betazero = event.beta;
      } else {
        this.gammazero = (event.gamma + this.lastgammazero) / 2;
        this.betazero = (event.beta + this.lastbetazero) / 2;
      }

      this.gyroscopeSamples -= 1;
    }

    var totalAngleX = this.settings.gyroscopeMaxAngleX - this.settings.gyroscopeMinAngleX;
    var totalAngleY = this.settings.gyroscopeMaxAngleY - this.settings.gyroscopeMinAngleY;

    var degreesPerPixelX = totalAngleX / this.width;
    var degreesPerPixelY = totalAngleY / this.height;

    var angleX = event.gamma - (this.settings.gyroscopeMinAngleX + this.gammazero);
    var angleY = event.beta - (this.settings.gyroscopeMinAngleY + this.betazero);

    var posX = angleX / degreesPerPixelX;
    var posY = angleY / degreesPerPixelY;

    if (this.updateCall !== null) {
      cancelAnimationFrame(this.updateCall);
    }

    this.event = {
      clientX: posX + this.left,
      clientY: posY + this.top
    };

    this.updateCall = requestAnimationFrame(this.updateBind);
  };

  VanillaTilt.prototype.onMouseEnter = function onMouseEnter() {
    this.updateElementPosition();
    this.element.style.willChange = "transform";
    this.setTransition();
  };

  VanillaTilt.prototype.onMouseMove = function onMouseMove(event) {
    if (this.updateCall !== null) {
      cancelAnimationFrame(this.updateCall);
    }

    this.event = event;
    this.updateCall = requestAnimationFrame(this.updateBind);
  };

  VanillaTilt.prototype.onMouseLeave = function onMouseLeave() {
    this.setTransition();

    if (this.settings.reset) {
      requestAnimationFrame(this.resetBind);
    }
  };

  VanillaTilt.prototype.reset = function reset() {
    this.onMouseEnter();

    if (this.fullPageListening) {
      this.event = {
        clientX: (this.settings.startX + this.settings.max) / (2 * this.settings.max) * this.clientWidth,
        clientY: (this.settings.startY + this.settings.max) / (2 * this.settings.max) * this.clientHeight
      };
    } else {
      this.event = {
        clientX: this.left + (this.settings.startX + this.settings.max) / (2 * this.settings.max) * this.width,
        clientY: this.top + (this.settings.startY + this.settings.max) / (2 * this.settings.max) * this.height
      };
    }

    var backupScale = this.settings.scale;
    this.settings.scale = 1;
    this.update();
    this.settings.scale = backupScale;
    this.resetGlare();
  };

  VanillaTilt.prototype.resetGlare = function resetGlare() {
    if (this.glare) {
      this.glareElement.style.transform = "rotate(180deg) translate(-50%, -50%)";
      this.glareElement.style.opacity = "0";
    }
  };

  VanillaTilt.prototype.getValues = function getValues() {
    var x = void 0,
        y = void 0;

    if (this.fullPageListening) {
      x = this.event.clientX / this.clientWidth;
      y = this.event.clientY / this.clientHeight;
    } else {
      x = (this.event.clientX - this.left) / this.width;
      y = (this.event.clientY - this.top) / this.height;
    }

    x = Math.min(Math.max(x, 0), 1);
    y = Math.min(Math.max(y, 0), 1);

    var tiltX = (this.reverse * (this.settings.max - x * this.settings.max * 2)).toFixed(2);
    var tiltY = (this.reverse * (y * this.settings.max * 2 - this.settings.max)).toFixed(2);
    var angle = Math.atan2(this.event.clientX - (this.left + this.width / 2), -(this.event.clientY - (this.top + this.height / 2))) * (180 / Math.PI);

    return {
      tiltX: tiltX,
      tiltY: tiltY,
      percentageX: x * 100,
      percentageY: y * 100,
      angle: angle
    };
  };

  VanillaTilt.prototype.updateElementPosition = function updateElementPosition() {
    var rect = this.element.getBoundingClientRect();

    this.width = this.element.offsetWidth;
    this.height = this.element.offsetHeight;
    this.left = rect.left;
    this.top = rect.top;
  };

  VanillaTilt.prototype.update = function update() {
    var values = this.getValues();

    this.element.style.transform = "perspective(" + this.settings.perspective + "px) " + "rotateX(" + (this.settings.axis === "x" ? 0 : values.tiltY) + "deg) " + "rotateY(" + (this.settings.axis === "y" ? 0 : values.tiltX) + "deg) " + "scale3d(" + this.settings.scale + ", " + this.settings.scale + ", " + this.settings.scale + ")";

    if (this.glare) {
      this.glareElement.style.transform = "rotate(" + values.angle + "deg) translate(-50%, -50%)";
      this.glareElement.style.opacity = "" + values.percentageY * this.settings["max-glare"] / 100;
    }

    this.element.dispatchEvent(new CustomEvent("tiltChange", {
      "detail": values
    }));

    this.updateCall = null;
  };

  /**
   * Appends the glare element (if glarePrerender equals false)
   * and sets the default style
   */


  VanillaTilt.prototype.prepareGlare = function prepareGlare() {
    // If option pre-render is enabled we assume all html/css is present for an optimal glare effect.
    if (!this.glarePrerender) {
      // Create glare element
      var jsTiltGlare = document.createElement("div");
      jsTiltGlare.classList.add("js-tilt-glare");

      var jsTiltGlareInner = document.createElement("div");
      jsTiltGlareInner.classList.add("js-tilt-glare-inner");

      jsTiltGlare.appendChild(jsTiltGlareInner);
      this.element.appendChild(jsTiltGlare);
    }

    this.glareElementWrapper = this.element.querySelector(".js-tilt-glare");
    this.glareElement = this.element.querySelector(".js-tilt-glare-inner");

    if (this.glarePrerender) {
      return;
    }

    Object.assign(this.glareElementWrapper.style, {
      "position": "absolute",
      "top": "0",
      "left": "0",
      "width": "100%",
      "height": "100%",
      "overflow": "hidden",
      "pointer-events": "none",
      "border-radius": "inherit"
    });

    Object.assign(this.glareElement.style, {
      "position": "absolute",
      "top": "50%",
      "left": "50%",
      "pointer-events": "none",
      "background-image": "linear-gradient(0deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)",
      "transform": "rotate(180deg) translate(-50%, -50%)",
      "transform-origin": "0% 0%",
      "opacity": "0"
    });

    this.updateGlareSize();
  };

  VanillaTilt.prototype.updateGlareSize = function updateGlareSize() {
    if (this.glare) {
      var glareSize = (this.element.offsetWidth > this.element.offsetHeight ? this.element.offsetWidth : this.element.offsetHeight) * 2;

      Object.assign(this.glareElement.style, {
        "width": glareSize + "px",
        "height": glareSize + "px"
      });
    }
  };

  VanillaTilt.prototype.updateClientSize = function updateClientSize() {
    this.clientWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    this.clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  };

  VanillaTilt.prototype.onWindowResize = function onWindowResize() {
    this.updateGlareSize();
    this.updateClientSize();
  };

  VanillaTilt.prototype.setTransition = function setTransition() {
    var _this = this;

    clearTimeout(this.transitionTimeout);
    this.element.style.transition = this.settings.speed + "ms " + this.settings.easing;
    if (this.glare) this.glareElement.style.transition = "opacity " + this.settings.speed + "ms " + this.settings.easing;

    this.transitionTimeout = setTimeout(function () {
      _this.element.style.transition = "";
      if (_this.glare) {
        _this.glareElement.style.transition = "";
      }
    }, this.settings.speed);
  };

  /**
   * Method return patched settings of instance
   * @param {boolean} settings.reverse - reverse the tilt direction
   * @param {number} settings.max - max tilt rotation (degrees)
   * @param {startX} settings.startX - the starting tilt on the X axis, in degrees. Default: 0
   * @param {startY} settings.startY - the starting tilt on the Y axis, in degrees. Default: 0
   * @param {number} settings.perspective - Transform perspective, the lower the more extreme the tilt gets
   * @param {string} settings.easing - Easing on enter/exit
   * @param {number} settings.scale - 2 = 200%, 1.5 = 150%, etc..
   * @param {number} settings.speed - Speed of the enter/exit transition
   * @param {boolean} settings.transition - Set a transition on enter/exit
   * @param {string|null} settings.axis - What axis should be enabled. Can be "x" or "y"
   * @param {boolean} settings.glare - if it should have a "glare" effect
   * @param {number} settings.max-glare - the maximum "glare" opacity (1 = 100%, 0.5 = 50%)
   * @param {boolean} settings.glare-prerender - false = VanillaTilt creates the glare elements for you, otherwise
   * @param {boolean} settings.full-page-listening - If true, parallax effect will listen to mouse move events on the whole document, not only the selected element
   * @param {string|object} settings.mouse-event-element - String selector or link to HTML-element what will be listen mouse events
   * @param {boolean} settings.reset - false = If the tilt effect has to be reset on exit
   * @param {boolean} settings.reset-to-start - true = On reset event (mouse leave) will return to initial start angle (if startX or startY is set)
   * @param {gyroscope} settings.gyroscope - Enable tilting by deviceorientation events
   * @param {gyroscopeSensitivity} settings.gyroscopeSensitivity - Between 0 and 1 - The angle at which max tilt position is reached. 1 = 90deg, 0.5 = 45deg, etc..
   * @param {gyroscopeSamples} settings.gyroscopeSamples - How many gyroscope moves to decide the starting position.
   */


  VanillaTilt.prototype.extendSettings = function extendSettings(settings) {
    var defaultSettings = {
      reverse: false,
      max: 15,
      startX: 0,
      startY: 0,
      perspective: 1000,
      easing: "cubic-bezier(.03,.98,.52,.99)",
      scale: 1,
      speed: 300,
      transition: true,
      axis: null,
      glare: false,
      "max-glare": 1,
      "glare-prerender": false,
      "full-page-listening": false,
      "mouse-event-element": null,
      reset: true,
      "reset-to-start": true,
      gyroscope: true,
      gyroscopeMinAngleX: -45,
      gyroscopeMaxAngleX: 45,
      gyroscopeMinAngleY: -45,
      gyroscopeMaxAngleY: 45,
      gyroscopeSamples: 10
    };

    var newSettings = {};
    for (var property in defaultSettings) {
      if (property in settings) {
        newSettings[property] = settings[property];
      } else if (this.element.hasAttribute("data-tilt-" + property)) {
        var attribute = this.element.getAttribute("data-tilt-" + property);
        try {
          newSettings[property] = JSON.parse(attribute);
        } catch (e) {
          newSettings[property] = attribute;
        }
      } else {
        newSettings[property] = defaultSettings[property];
      }
    }

    return newSettings;
  };

  VanillaTilt.init = function init(elements, settings) {
    if (elements instanceof Node) {
      elements = [elements];
    }

    if (elements instanceof NodeList) {
      elements = [].slice.call(elements);
    }

    if (!(elements instanceof Array)) {
      return;
    }

    elements.forEach(function (element) {
      if (!("vanillaTilt" in element)) {
        element.vanillaTilt = new VanillaTilt(element, settings);
      }
    });
  };

  return VanillaTilt;
}();

if (typeof document !== "undefined") {
  /* expose the class to window */
  window.VanillaTilt = VanillaTilt;

  /**
   * Auto load
   */
  VanillaTilt.init(document.querySelectorAll("[data-tilt]"));
}

module.exports = VanillaTilt;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**************************!*\
  !*** ./src/js/module.js ***!
  \**************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var vanilla_tilt__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vanilla-tilt */ "./node_modules/vanilla-tilt/lib/vanilla-tilt.js");
/* harmony import */ var vanilla_tilt__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vanilla_tilt__WEBPACK_IMPORTED_MODULE_0__);

vanilla_tilt__WEBPACK_IMPORTED_MODULE_0___default().init(document.querySelector(".started__images"), {
  max: 5,
  speed: 900
});
vanilla_tilt__WEBPACK_IMPORTED_MODULE_0___default().init(document.querySelectorAll(".greeting__body li"), {
  max: 15,
  speed: 900
});
var swiper = new Swiper('.swiper', {
  navigation: {
    nextEl: ".button-next",
    prevEl: ".button-prev"
  },
  breakpoints: {
    320: {
      slidesPerView: 1,
      spaceBetweenSlides: 10
    },
    499: {
      slidesPerView: 2,
      spaceBetweenSlides: 10
    },
    992: {
      slidesPerView: 3,
      spaceBetweenSlides: 10
    },
    1024: {
      slidesPerView: 4,
      spaceBetweenSlides: 10
    },
    1367: {
      slidesPerView: 5,
      spaceBetweenSlides: 24
    }
  }
});
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBYTs7QUFFYjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGNBQWM7QUFDZDs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsY0FBYztBQUNkOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQSxh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aWIvdmFuaWxsYS10aWx0LmpzIiwid2VicGFjazovL3NsYWdyYWNoLXRlbXBsYXRlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3NsYWdyYWNoLXRlbXBsYXRlL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL3NsYWdyYWNoLXRlbXBsYXRlL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9zbGFncmFjaC10ZW1wbGF0ZS93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3NsYWdyYWNoLXRlbXBsYXRlL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vc2xhZ3JhY2gtdGVtcGxhdGUvLi9zcmMvanMvbW9kdWxlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxudmFyIGNsYXNzQ2FsbENoZWNrID0gZnVuY3Rpb24gKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gIH1cbn07XG5cbi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFNlcmdpdSDImGFuZG9yIChtaWNrdTd6dSkgb24gMS8yNy8yMDE3LlxyXG4gKiBPcmlnaW5hbCBpZGVhOiBodHRwczovL2dpdGh1Yi5jb20vZ2lqc3JvZ2UvdGlsdC5qc1xyXG4gKiBNSVQgTGljZW5zZS5cclxuICogVmVyc2lvbiAxLjguMVxyXG4gKi9cblxudmFyIFZhbmlsbGFUaWx0ID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBWYW5pbGxhVGlsdChlbGVtZW50KSB7XG4gICAgdmFyIHNldHRpbmdzID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7fTtcbiAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBWYW5pbGxhVGlsdCk7XG5cbiAgICBpZiAoIShlbGVtZW50IGluc3RhbmNlb2YgTm9kZSkpIHtcbiAgICAgIHRocm93IFwiQ2FuJ3QgaW5pdGlhbGl6ZSBWYW5pbGxhVGlsdCBiZWNhdXNlIFwiICsgZWxlbWVudCArIFwiIGlzIG5vdCBhIE5vZGUuXCI7XG4gICAgfVxuXG4gICAgdGhpcy53aWR0aCA9IG51bGw7XG4gICAgdGhpcy5oZWlnaHQgPSBudWxsO1xuICAgIHRoaXMuY2xpZW50V2lkdGggPSBudWxsO1xuICAgIHRoaXMuY2xpZW50SGVpZ2h0ID0gbnVsbDtcbiAgICB0aGlzLmxlZnQgPSBudWxsO1xuICAgIHRoaXMudG9wID0gbnVsbDtcblxuICAgIC8vIGZvciBHeXJvc2NvcGUgc2FtcGxpbmdcbiAgICB0aGlzLmdhbW1hemVybyA9IG51bGw7XG4gICAgdGhpcy5iZXRhemVybyA9IG51bGw7XG4gICAgdGhpcy5sYXN0Z2FtbWF6ZXJvID0gbnVsbDtcbiAgICB0aGlzLmxhc3RiZXRhemVybyA9IG51bGw7XG5cbiAgICB0aGlzLnRyYW5zaXRpb25UaW1lb3V0ID0gbnVsbDtcbiAgICB0aGlzLnVwZGF0ZUNhbGwgPSBudWxsO1xuICAgIHRoaXMuZXZlbnQgPSBudWxsO1xuXG4gICAgdGhpcy51cGRhdGVCaW5kID0gdGhpcy51cGRhdGUuYmluZCh0aGlzKTtcbiAgICB0aGlzLnJlc2V0QmluZCA9IHRoaXMucmVzZXQuYmluZCh0aGlzKTtcblxuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5zZXR0aW5ncyA9IHRoaXMuZXh0ZW5kU2V0dGluZ3Moc2V0dGluZ3MpO1xuXG4gICAgdGhpcy5yZXZlcnNlID0gdGhpcy5zZXR0aW5ncy5yZXZlcnNlID8gLTEgOiAxO1xuICAgIHRoaXMucmVzZXRUb1N0YXJ0ID0gVmFuaWxsYVRpbHQuaXNTZXR0aW5nVHJ1ZSh0aGlzLnNldHRpbmdzW1wicmVzZXQtdG8tc3RhcnRcIl0pO1xuICAgIHRoaXMuZ2xhcmUgPSBWYW5pbGxhVGlsdC5pc1NldHRpbmdUcnVlKHRoaXMuc2V0dGluZ3MuZ2xhcmUpO1xuICAgIHRoaXMuZ2xhcmVQcmVyZW5kZXIgPSBWYW5pbGxhVGlsdC5pc1NldHRpbmdUcnVlKHRoaXMuc2V0dGluZ3NbXCJnbGFyZS1wcmVyZW5kZXJcIl0pO1xuICAgIHRoaXMuZnVsbFBhZ2VMaXN0ZW5pbmcgPSBWYW5pbGxhVGlsdC5pc1NldHRpbmdUcnVlKHRoaXMuc2V0dGluZ3NbXCJmdWxsLXBhZ2UtbGlzdGVuaW5nXCJdKTtcbiAgICB0aGlzLmd5cm9zY29wZSA9IFZhbmlsbGFUaWx0LmlzU2V0dGluZ1RydWUodGhpcy5zZXR0aW5ncy5neXJvc2NvcGUpO1xuICAgIHRoaXMuZ3lyb3Njb3BlU2FtcGxlcyA9IHRoaXMuc2V0dGluZ3MuZ3lyb3Njb3BlU2FtcGxlcztcblxuICAgIHRoaXMuZWxlbWVudExpc3RlbmVyID0gdGhpcy5nZXRFbGVtZW50TGlzdGVuZXIoKTtcblxuICAgIGlmICh0aGlzLmdsYXJlKSB7XG4gICAgICB0aGlzLnByZXBhcmVHbGFyZSgpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmZ1bGxQYWdlTGlzdGVuaW5nKSB7XG4gICAgICB0aGlzLnVwZGF0ZUNsaWVudFNpemUoKTtcbiAgICB9XG5cbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXJzKCk7XG4gICAgdGhpcy5yZXNldCgpO1xuXG4gICAgaWYgKHRoaXMucmVzZXRUb1N0YXJ0ID09PSBmYWxzZSkge1xuICAgICAgdGhpcy5zZXR0aW5ncy5zdGFydFggPSAwO1xuICAgICAgdGhpcy5zZXR0aW5ncy5zdGFydFkgPSAwO1xuICAgIH1cbiAgfVxuXG4gIFZhbmlsbGFUaWx0LmlzU2V0dGluZ1RydWUgPSBmdW5jdGlvbiBpc1NldHRpbmdUcnVlKHNldHRpbmcpIHtcbiAgICByZXR1cm4gc2V0dGluZyA9PT0gXCJcIiB8fCBzZXR0aW5nID09PSB0cnVlIHx8IHNldHRpbmcgPT09IDE7XG4gIH07XG5cbiAgLyoqXHJcbiAgICogTWV0aG9kIHJldHVybnMgZWxlbWVudCB3aGF0IHdpbGwgYmUgbGlzdGVuIG1vdXNlIGV2ZW50c1xyXG4gICAqIEByZXR1cm4ge05vZGV9XHJcbiAgICovXG5cblxuICBWYW5pbGxhVGlsdC5wcm90b3R5cGUuZ2V0RWxlbWVudExpc3RlbmVyID0gZnVuY3Rpb24gZ2V0RWxlbWVudExpc3RlbmVyKCkge1xuICAgIGlmICh0aGlzLmZ1bGxQYWdlTGlzdGVuaW5nKSB7XG4gICAgICByZXR1cm4gd2luZG93LmRvY3VtZW50O1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgdGhpcy5zZXR0aW5nc1tcIm1vdXNlLWV2ZW50LWVsZW1lbnRcIl0gPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHZhciBtb3VzZUV2ZW50RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5zZXR0aW5nc1tcIm1vdXNlLWV2ZW50LWVsZW1lbnRcIl0pO1xuXG4gICAgICBpZiAobW91c2VFdmVudEVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIG1vdXNlRXZlbnRFbGVtZW50O1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLnNldHRpbmdzW1wibW91c2UtZXZlbnQtZWxlbWVudFwiXSBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldHRpbmdzW1wibW91c2UtZXZlbnQtZWxlbWVudFwiXTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5lbGVtZW50O1xuICB9O1xuXG4gIC8qKlxyXG4gICAqIE1ldGhvZCBzZXQgbGlzdGVuIG1ldGhvZHMgZm9yIHRoaXMuZWxlbWVudExpc3RlbmVyXHJcbiAgICogQHJldHVybiB7Tm9kZX1cclxuICAgKi9cblxuXG4gIFZhbmlsbGFUaWx0LnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVycyA9IGZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXJzKCkge1xuICAgIHRoaXMub25Nb3VzZUVudGVyQmluZCA9IHRoaXMub25Nb3VzZUVudGVyLmJpbmQodGhpcyk7XG4gICAgdGhpcy5vbk1vdXNlTW92ZUJpbmQgPSB0aGlzLm9uTW91c2VNb3ZlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5vbk1vdXNlTGVhdmVCaW5kID0gdGhpcy5vbk1vdXNlTGVhdmUuYmluZCh0aGlzKTtcbiAgICB0aGlzLm9uV2luZG93UmVzaXplQmluZCA9IHRoaXMub25XaW5kb3dSZXNpemUuYmluZCh0aGlzKTtcbiAgICB0aGlzLm9uRGV2aWNlT3JpZW50YXRpb25CaW5kID0gdGhpcy5vbkRldmljZU9yaWVudGF0aW9uLmJpbmQodGhpcyk7XG5cbiAgICB0aGlzLmVsZW1lbnRMaXN0ZW5lci5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCB0aGlzLm9uTW91c2VFbnRlckJpbmQpO1xuICAgIHRoaXMuZWxlbWVudExpc3RlbmVyLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIHRoaXMub25Nb3VzZUxlYXZlQmluZCk7XG4gICAgdGhpcy5lbGVtZW50TGlzdGVuZXIuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm9uTW91c2VNb3ZlQmluZCk7XG5cbiAgICBpZiAodGhpcy5nbGFyZSB8fCB0aGlzLmZ1bGxQYWdlTGlzdGVuaW5nKSB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCB0aGlzLm9uV2luZG93UmVzaXplQmluZCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZ3lyb3Njb3BlKSB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImRldmljZW9yaWVudGF0aW9uXCIsIHRoaXMub25EZXZpY2VPcmllbnRhdGlvbkJpbmQpO1xuICAgIH1cbiAgfTtcblxuICAvKipcclxuICAgKiBNZXRob2QgcmVtb3ZlIGV2ZW50IGxpc3RlbmVycyBmcm9tIGN1cnJlbnQgdGhpcy5lbGVtZW50TGlzdGVuZXJcclxuICAgKi9cblxuXG4gIFZhbmlsbGFUaWx0LnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVycyA9IGZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXJzKCkge1xuICAgIHRoaXMuZWxlbWVudExpc3RlbmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIHRoaXMub25Nb3VzZUVudGVyQmluZCk7XG4gICAgdGhpcy5lbGVtZW50TGlzdGVuZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgdGhpcy5vbk1vdXNlTGVhdmVCaW5kKTtcbiAgICB0aGlzLmVsZW1lbnRMaXN0ZW5lci5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMub25Nb3VzZU1vdmVCaW5kKTtcblxuICAgIGlmICh0aGlzLmd5cm9zY29wZSkge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJkZXZpY2VvcmllbnRhdGlvblwiLCB0aGlzLm9uRGV2aWNlT3JpZW50YXRpb25CaW5kKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5nbGFyZSB8fCB0aGlzLmZ1bGxQYWdlTGlzdGVuaW5nKSB7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCB0aGlzLm9uV2luZG93UmVzaXplQmluZCk7XG4gICAgfVxuICB9O1xuXG4gIFZhbmlsbGFUaWx0LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy50cmFuc2l0aW9uVGltZW91dCk7XG4gICAgaWYgKHRoaXMudXBkYXRlQ2FsbCAhPT0gbnVsbCkge1xuICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy51cGRhdGVDYWxsKTtcbiAgICB9XG5cbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lsbENoYW5nZSA9IFwiXCI7XG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zaXRpb24gPSBcIlwiO1xuICAgIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSBcIlwiO1xuICAgIHRoaXMucmVzZXRHbGFyZSgpO1xuXG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVycygpO1xuICAgIHRoaXMuZWxlbWVudC52YW5pbGxhVGlsdCA9IG51bGw7XG4gICAgZGVsZXRlIHRoaXMuZWxlbWVudC52YW5pbGxhVGlsdDtcblxuICAgIHRoaXMuZWxlbWVudCA9IG51bGw7XG4gIH07XG5cbiAgVmFuaWxsYVRpbHQucHJvdG90eXBlLm9uRGV2aWNlT3JpZW50YXRpb24gPSBmdW5jdGlvbiBvbkRldmljZU9yaWVudGF0aW9uKGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LmdhbW1hID09PSBudWxsIHx8IGV2ZW50LmJldGEgPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0ZUVsZW1lbnRQb3NpdGlvbigpO1xuXG4gICAgaWYgKHRoaXMuZ3lyb3Njb3BlU2FtcGxlcyA+IDApIHtcbiAgICAgIHRoaXMubGFzdGdhbW1hemVybyA9IHRoaXMuZ2FtbWF6ZXJvO1xuICAgICAgdGhpcy5sYXN0YmV0YXplcm8gPSB0aGlzLmJldGF6ZXJvO1xuXG4gICAgICBpZiAodGhpcy5nYW1tYXplcm8gPT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5nYW1tYXplcm8gPSBldmVudC5nYW1tYTtcbiAgICAgICAgdGhpcy5iZXRhemVybyA9IGV2ZW50LmJldGE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmdhbW1hemVybyA9IChldmVudC5nYW1tYSArIHRoaXMubGFzdGdhbW1hemVybykgLyAyO1xuICAgICAgICB0aGlzLmJldGF6ZXJvID0gKGV2ZW50LmJldGEgKyB0aGlzLmxhc3RiZXRhemVybykgLyAyO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmd5cm9zY29wZVNhbXBsZXMgLT0gMTtcbiAgICB9XG5cbiAgICB2YXIgdG90YWxBbmdsZVggPSB0aGlzLnNldHRpbmdzLmd5cm9zY29wZU1heEFuZ2xlWCAtIHRoaXMuc2V0dGluZ3MuZ3lyb3Njb3BlTWluQW5nbGVYO1xuICAgIHZhciB0b3RhbEFuZ2xlWSA9IHRoaXMuc2V0dGluZ3MuZ3lyb3Njb3BlTWF4QW5nbGVZIC0gdGhpcy5zZXR0aW5ncy5neXJvc2NvcGVNaW5BbmdsZVk7XG5cbiAgICB2YXIgZGVncmVlc1BlclBpeGVsWCA9IHRvdGFsQW5nbGVYIC8gdGhpcy53aWR0aDtcbiAgICB2YXIgZGVncmVlc1BlclBpeGVsWSA9IHRvdGFsQW5nbGVZIC8gdGhpcy5oZWlnaHQ7XG5cbiAgICB2YXIgYW5nbGVYID0gZXZlbnQuZ2FtbWEgLSAodGhpcy5zZXR0aW5ncy5neXJvc2NvcGVNaW5BbmdsZVggKyB0aGlzLmdhbW1hemVybyk7XG4gICAgdmFyIGFuZ2xlWSA9IGV2ZW50LmJldGEgLSAodGhpcy5zZXR0aW5ncy5neXJvc2NvcGVNaW5BbmdsZVkgKyB0aGlzLmJldGF6ZXJvKTtcblxuICAgIHZhciBwb3NYID0gYW5nbGVYIC8gZGVncmVlc1BlclBpeGVsWDtcbiAgICB2YXIgcG9zWSA9IGFuZ2xlWSAvIGRlZ3JlZXNQZXJQaXhlbFk7XG5cbiAgICBpZiAodGhpcy51cGRhdGVDYWxsICE9PSBudWxsKSB7XG4gICAgICBjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLnVwZGF0ZUNhbGwpO1xuICAgIH1cblxuICAgIHRoaXMuZXZlbnQgPSB7XG4gICAgICBjbGllbnRYOiBwb3NYICsgdGhpcy5sZWZ0LFxuICAgICAgY2xpZW50WTogcG9zWSArIHRoaXMudG9wXG4gICAgfTtcblxuICAgIHRoaXMudXBkYXRlQ2FsbCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLnVwZGF0ZUJpbmQpO1xuICB9O1xuXG4gIFZhbmlsbGFUaWx0LnByb3RvdHlwZS5vbk1vdXNlRW50ZXIgPSBmdW5jdGlvbiBvbk1vdXNlRW50ZXIoKSB7XG4gICAgdGhpcy51cGRhdGVFbGVtZW50UG9zaXRpb24oKTtcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lsbENoYW5nZSA9IFwidHJhbnNmb3JtXCI7XG4gICAgdGhpcy5zZXRUcmFuc2l0aW9uKCk7XG4gIH07XG5cbiAgVmFuaWxsYVRpbHQucHJvdG90eXBlLm9uTW91c2VNb3ZlID0gZnVuY3Rpb24gb25Nb3VzZU1vdmUoZXZlbnQpIHtcbiAgICBpZiAodGhpcy51cGRhdGVDYWxsICE9PSBudWxsKSB7XG4gICAgICBjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLnVwZGF0ZUNhbGwpO1xuICAgIH1cblxuICAgIHRoaXMuZXZlbnQgPSBldmVudDtcbiAgICB0aGlzLnVwZGF0ZUNhbGwgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy51cGRhdGVCaW5kKTtcbiAgfTtcblxuICBWYW5pbGxhVGlsdC5wcm90b3R5cGUub25Nb3VzZUxlYXZlID0gZnVuY3Rpb24gb25Nb3VzZUxlYXZlKCkge1xuICAgIHRoaXMuc2V0VHJhbnNpdGlvbigpO1xuXG4gICAgaWYgKHRoaXMuc2V0dGluZ3MucmVzZXQpIHtcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLnJlc2V0QmluZCk7XG4gICAgfVxuICB9O1xuXG4gIFZhbmlsbGFUaWx0LnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgIHRoaXMub25Nb3VzZUVudGVyKCk7XG5cbiAgICBpZiAodGhpcy5mdWxsUGFnZUxpc3RlbmluZykge1xuICAgICAgdGhpcy5ldmVudCA9IHtcbiAgICAgICAgY2xpZW50WDogKHRoaXMuc2V0dGluZ3Muc3RhcnRYICsgdGhpcy5zZXR0aW5ncy5tYXgpIC8gKDIgKiB0aGlzLnNldHRpbmdzLm1heCkgKiB0aGlzLmNsaWVudFdpZHRoLFxuICAgICAgICBjbGllbnRZOiAodGhpcy5zZXR0aW5ncy5zdGFydFkgKyB0aGlzLnNldHRpbmdzLm1heCkgLyAoMiAqIHRoaXMuc2V0dGluZ3MubWF4KSAqIHRoaXMuY2xpZW50SGVpZ2h0XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmV2ZW50ID0ge1xuICAgICAgICBjbGllbnRYOiB0aGlzLmxlZnQgKyAodGhpcy5zZXR0aW5ncy5zdGFydFggKyB0aGlzLnNldHRpbmdzLm1heCkgLyAoMiAqIHRoaXMuc2V0dGluZ3MubWF4KSAqIHRoaXMud2lkdGgsXG4gICAgICAgIGNsaWVudFk6IHRoaXMudG9wICsgKHRoaXMuc2V0dGluZ3Muc3RhcnRZICsgdGhpcy5zZXR0aW5ncy5tYXgpIC8gKDIgKiB0aGlzLnNldHRpbmdzLm1heCkgKiB0aGlzLmhlaWdodFxuICAgICAgfTtcbiAgICB9XG5cbiAgICB2YXIgYmFja3VwU2NhbGUgPSB0aGlzLnNldHRpbmdzLnNjYWxlO1xuICAgIHRoaXMuc2V0dGluZ3Muc2NhbGUgPSAxO1xuICAgIHRoaXMudXBkYXRlKCk7XG4gICAgdGhpcy5zZXR0aW5ncy5zY2FsZSA9IGJhY2t1cFNjYWxlO1xuICAgIHRoaXMucmVzZXRHbGFyZSgpO1xuICB9O1xuXG4gIFZhbmlsbGFUaWx0LnByb3RvdHlwZS5yZXNldEdsYXJlID0gZnVuY3Rpb24gcmVzZXRHbGFyZSgpIHtcbiAgICBpZiAodGhpcy5nbGFyZSkge1xuICAgICAgdGhpcy5nbGFyZUVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gXCJyb3RhdGUoMTgwZGVnKSB0cmFuc2xhdGUoLTUwJSwgLTUwJSlcIjtcbiAgICAgIHRoaXMuZ2xhcmVFbGVtZW50LnN0eWxlLm9wYWNpdHkgPSBcIjBcIjtcbiAgICB9XG4gIH07XG5cbiAgVmFuaWxsYVRpbHQucHJvdG90eXBlLmdldFZhbHVlcyA9IGZ1bmN0aW9uIGdldFZhbHVlcygpIHtcbiAgICB2YXIgeCA9IHZvaWQgMCxcbiAgICAgICAgeSA9IHZvaWQgMDtcblxuICAgIGlmICh0aGlzLmZ1bGxQYWdlTGlzdGVuaW5nKSB7XG4gICAgICB4ID0gdGhpcy5ldmVudC5jbGllbnRYIC8gdGhpcy5jbGllbnRXaWR0aDtcbiAgICAgIHkgPSB0aGlzLmV2ZW50LmNsaWVudFkgLyB0aGlzLmNsaWVudEhlaWdodDtcbiAgICB9IGVsc2Uge1xuICAgICAgeCA9ICh0aGlzLmV2ZW50LmNsaWVudFggLSB0aGlzLmxlZnQpIC8gdGhpcy53aWR0aDtcbiAgICAgIHkgPSAodGhpcy5ldmVudC5jbGllbnRZIC0gdGhpcy50b3ApIC8gdGhpcy5oZWlnaHQ7XG4gICAgfVxuXG4gICAgeCA9IE1hdGgubWluKE1hdGgubWF4KHgsIDApLCAxKTtcbiAgICB5ID0gTWF0aC5taW4oTWF0aC5tYXgoeSwgMCksIDEpO1xuXG4gICAgdmFyIHRpbHRYID0gKHRoaXMucmV2ZXJzZSAqICh0aGlzLnNldHRpbmdzLm1heCAtIHggKiB0aGlzLnNldHRpbmdzLm1heCAqIDIpKS50b0ZpeGVkKDIpO1xuICAgIHZhciB0aWx0WSA9ICh0aGlzLnJldmVyc2UgKiAoeSAqIHRoaXMuc2V0dGluZ3MubWF4ICogMiAtIHRoaXMuc2V0dGluZ3MubWF4KSkudG9GaXhlZCgyKTtcbiAgICB2YXIgYW5nbGUgPSBNYXRoLmF0YW4yKHRoaXMuZXZlbnQuY2xpZW50WCAtICh0aGlzLmxlZnQgKyB0aGlzLndpZHRoIC8gMiksIC0odGhpcy5ldmVudC5jbGllbnRZIC0gKHRoaXMudG9wICsgdGhpcy5oZWlnaHQgLyAyKSkpICogKDE4MCAvIE1hdGguUEkpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHRpbHRYOiB0aWx0WCxcbiAgICAgIHRpbHRZOiB0aWx0WSxcbiAgICAgIHBlcmNlbnRhZ2VYOiB4ICogMTAwLFxuICAgICAgcGVyY2VudGFnZVk6IHkgKiAxMDAsXG4gICAgICBhbmdsZTogYW5nbGVcbiAgICB9O1xuICB9O1xuXG4gIFZhbmlsbGFUaWx0LnByb3RvdHlwZS51cGRhdGVFbGVtZW50UG9zaXRpb24gPSBmdW5jdGlvbiB1cGRhdGVFbGVtZW50UG9zaXRpb24oKSB7XG4gICAgdmFyIHJlY3QgPSB0aGlzLmVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICB0aGlzLndpZHRoID0gdGhpcy5lbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5lbGVtZW50Lm9mZnNldEhlaWdodDtcbiAgICB0aGlzLmxlZnQgPSByZWN0LmxlZnQ7XG4gICAgdGhpcy50b3AgPSByZWN0LnRvcDtcbiAgfTtcblxuICBWYW5pbGxhVGlsdC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgIHZhciB2YWx1ZXMgPSB0aGlzLmdldFZhbHVlcygpO1xuXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9IFwicGVyc3BlY3RpdmUoXCIgKyB0aGlzLnNldHRpbmdzLnBlcnNwZWN0aXZlICsgXCJweCkgXCIgKyBcInJvdGF0ZVgoXCIgKyAodGhpcy5zZXR0aW5ncy5heGlzID09PSBcInhcIiA/IDAgOiB2YWx1ZXMudGlsdFkpICsgXCJkZWcpIFwiICsgXCJyb3RhdGVZKFwiICsgKHRoaXMuc2V0dGluZ3MuYXhpcyA9PT0gXCJ5XCIgPyAwIDogdmFsdWVzLnRpbHRYKSArIFwiZGVnKSBcIiArIFwic2NhbGUzZChcIiArIHRoaXMuc2V0dGluZ3Muc2NhbGUgKyBcIiwgXCIgKyB0aGlzLnNldHRpbmdzLnNjYWxlICsgXCIsIFwiICsgdGhpcy5zZXR0aW5ncy5zY2FsZSArIFwiKVwiO1xuXG4gICAgaWYgKHRoaXMuZ2xhcmUpIHtcbiAgICAgIHRoaXMuZ2xhcmVFbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9IFwicm90YXRlKFwiICsgdmFsdWVzLmFuZ2xlICsgXCJkZWcpIHRyYW5zbGF0ZSgtNTAlLCAtNTAlKVwiO1xuICAgICAgdGhpcy5nbGFyZUVsZW1lbnQuc3R5bGUub3BhY2l0eSA9IFwiXCIgKyB2YWx1ZXMucGVyY2VudGFnZVkgKiB0aGlzLnNldHRpbmdzW1wibWF4LWdsYXJlXCJdIC8gMTAwO1xuICAgIH1cblxuICAgIHRoaXMuZWxlbWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChcInRpbHRDaGFuZ2VcIiwge1xuICAgICAgXCJkZXRhaWxcIjogdmFsdWVzXG4gICAgfSkpO1xuXG4gICAgdGhpcy51cGRhdGVDYWxsID0gbnVsbDtcbiAgfTtcblxuICAvKipcclxuICAgKiBBcHBlbmRzIHRoZSBnbGFyZSBlbGVtZW50IChpZiBnbGFyZVByZXJlbmRlciBlcXVhbHMgZmFsc2UpXHJcbiAgICogYW5kIHNldHMgdGhlIGRlZmF1bHQgc3R5bGVcclxuICAgKi9cblxuXG4gIFZhbmlsbGFUaWx0LnByb3RvdHlwZS5wcmVwYXJlR2xhcmUgPSBmdW5jdGlvbiBwcmVwYXJlR2xhcmUoKSB7XG4gICAgLy8gSWYgb3B0aW9uIHByZS1yZW5kZXIgaXMgZW5hYmxlZCB3ZSBhc3N1bWUgYWxsIGh0bWwvY3NzIGlzIHByZXNlbnQgZm9yIGFuIG9wdGltYWwgZ2xhcmUgZWZmZWN0LlxuICAgIGlmICghdGhpcy5nbGFyZVByZXJlbmRlcikge1xuICAgICAgLy8gQ3JlYXRlIGdsYXJlIGVsZW1lbnRcbiAgICAgIHZhciBqc1RpbHRHbGFyZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICBqc1RpbHRHbGFyZS5jbGFzc0xpc3QuYWRkKFwianMtdGlsdC1nbGFyZVwiKTtcblxuICAgICAgdmFyIGpzVGlsdEdsYXJlSW5uZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAganNUaWx0R2xhcmVJbm5lci5jbGFzc0xpc3QuYWRkKFwianMtdGlsdC1nbGFyZS1pbm5lclwiKTtcblxuICAgICAganNUaWx0R2xhcmUuYXBwZW5kQ2hpbGQoanNUaWx0R2xhcmVJbm5lcik7XG4gICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoanNUaWx0R2xhcmUpO1xuICAgIH1cblxuICAgIHRoaXMuZ2xhcmVFbGVtZW50V3JhcHBlciA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmpzLXRpbHQtZ2xhcmVcIik7XG4gICAgdGhpcy5nbGFyZUVsZW1lbnQgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5qcy10aWx0LWdsYXJlLWlubmVyXCIpO1xuXG4gICAgaWYgKHRoaXMuZ2xhcmVQcmVyZW5kZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBPYmplY3QuYXNzaWduKHRoaXMuZ2xhcmVFbGVtZW50V3JhcHBlci5zdHlsZSwge1xuICAgICAgXCJwb3NpdGlvblwiOiBcImFic29sdXRlXCIsXG4gICAgICBcInRvcFwiOiBcIjBcIixcbiAgICAgIFwibGVmdFwiOiBcIjBcIixcbiAgICAgIFwid2lkdGhcIjogXCIxMDAlXCIsXG4gICAgICBcImhlaWdodFwiOiBcIjEwMCVcIixcbiAgICAgIFwib3ZlcmZsb3dcIjogXCJoaWRkZW5cIixcbiAgICAgIFwicG9pbnRlci1ldmVudHNcIjogXCJub25lXCIsXG4gICAgICBcImJvcmRlci1yYWRpdXNcIjogXCJpbmhlcml0XCJcbiAgICB9KTtcblxuICAgIE9iamVjdC5hc3NpZ24odGhpcy5nbGFyZUVsZW1lbnQuc3R5bGUsIHtcbiAgICAgIFwicG9zaXRpb25cIjogXCJhYnNvbHV0ZVwiLFxuICAgICAgXCJ0b3BcIjogXCI1MCVcIixcbiAgICAgIFwibGVmdFwiOiBcIjUwJVwiLFxuICAgICAgXCJwb2ludGVyLWV2ZW50c1wiOiBcIm5vbmVcIixcbiAgICAgIFwiYmFja2dyb3VuZC1pbWFnZVwiOiBcImxpbmVhci1ncmFkaWVudCgwZGVnLCByZ2JhKDI1NSwyNTUsMjU1LDApIDAlLCByZ2JhKDI1NSwyNTUsMjU1LDEpIDEwMCUpXCIsXG4gICAgICBcInRyYW5zZm9ybVwiOiBcInJvdGF0ZSgxODBkZWcpIHRyYW5zbGF0ZSgtNTAlLCAtNTAlKVwiLFxuICAgICAgXCJ0cmFuc2Zvcm0tb3JpZ2luXCI6IFwiMCUgMCVcIixcbiAgICAgIFwib3BhY2l0eVwiOiBcIjBcIlxuICAgIH0pO1xuXG4gICAgdGhpcy51cGRhdGVHbGFyZVNpemUoKTtcbiAgfTtcblxuICBWYW5pbGxhVGlsdC5wcm90b3R5cGUudXBkYXRlR2xhcmVTaXplID0gZnVuY3Rpb24gdXBkYXRlR2xhcmVTaXplKCkge1xuICAgIGlmICh0aGlzLmdsYXJlKSB7XG4gICAgICB2YXIgZ2xhcmVTaXplID0gKHRoaXMuZWxlbWVudC5vZmZzZXRXaWR0aCA+IHRoaXMuZWxlbWVudC5vZmZzZXRIZWlnaHQgPyB0aGlzLmVsZW1lbnQub2Zmc2V0V2lkdGggOiB0aGlzLmVsZW1lbnQub2Zmc2V0SGVpZ2h0KSAqIDI7XG5cbiAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5nbGFyZUVsZW1lbnQuc3R5bGUsIHtcbiAgICAgICAgXCJ3aWR0aFwiOiBnbGFyZVNpemUgKyBcInB4XCIsXG4gICAgICAgIFwiaGVpZ2h0XCI6IGdsYXJlU2l6ZSArIFwicHhcIlxuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIFZhbmlsbGFUaWx0LnByb3RvdHlwZS51cGRhdGVDbGllbnRTaXplID0gZnVuY3Rpb24gdXBkYXRlQ2xpZW50U2l6ZSgpIHtcbiAgICB0aGlzLmNsaWVudFdpZHRoID0gd2luZG93LmlubmVyV2lkdGggfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIHx8IGRvY3VtZW50LmJvZHkuY2xpZW50V2lkdGg7XG5cbiAgICB0aGlzLmNsaWVudEhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0IHx8IGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0O1xuICB9O1xuXG4gIFZhbmlsbGFUaWx0LnByb3RvdHlwZS5vbldpbmRvd1Jlc2l6ZSA9IGZ1bmN0aW9uIG9uV2luZG93UmVzaXplKCkge1xuICAgIHRoaXMudXBkYXRlR2xhcmVTaXplKCk7XG4gICAgdGhpcy51cGRhdGVDbGllbnRTaXplKCk7XG4gIH07XG5cbiAgVmFuaWxsYVRpbHQucHJvdG90eXBlLnNldFRyYW5zaXRpb24gPSBmdW5jdGlvbiBzZXRUcmFuc2l0aW9uKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBjbGVhclRpbWVvdXQodGhpcy50cmFuc2l0aW9uVGltZW91dCk7XG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zaXRpb24gPSB0aGlzLnNldHRpbmdzLnNwZWVkICsgXCJtcyBcIiArIHRoaXMuc2V0dGluZ3MuZWFzaW5nO1xuICAgIGlmICh0aGlzLmdsYXJlKSB0aGlzLmdsYXJlRWxlbWVudC5zdHlsZS50cmFuc2l0aW9uID0gXCJvcGFjaXR5IFwiICsgdGhpcy5zZXR0aW5ncy5zcGVlZCArIFwibXMgXCIgKyB0aGlzLnNldHRpbmdzLmVhc2luZztcblxuICAgIHRoaXMudHJhbnNpdGlvblRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIF90aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNpdGlvbiA9IFwiXCI7XG4gICAgICBpZiAoX3RoaXMuZ2xhcmUpIHtcbiAgICAgICAgX3RoaXMuZ2xhcmVFbGVtZW50LnN0eWxlLnRyYW5zaXRpb24gPSBcIlwiO1xuICAgICAgfVxuICAgIH0sIHRoaXMuc2V0dGluZ3Muc3BlZWQpO1xuICB9O1xuXG4gIC8qKlxyXG4gICAqIE1ldGhvZCByZXR1cm4gcGF0Y2hlZCBzZXR0aW5ncyBvZiBpbnN0YW5jZVxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gc2V0dGluZ3MucmV2ZXJzZSAtIHJldmVyc2UgdGhlIHRpbHQgZGlyZWN0aW9uXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNldHRpbmdzLm1heCAtIG1heCB0aWx0IHJvdGF0aW9uIChkZWdyZWVzKVxyXG4gICAqIEBwYXJhbSB7c3RhcnRYfSBzZXR0aW5ncy5zdGFydFggLSB0aGUgc3RhcnRpbmcgdGlsdCBvbiB0aGUgWCBheGlzLCBpbiBkZWdyZWVzLiBEZWZhdWx0OiAwXHJcbiAgICogQHBhcmFtIHtzdGFydFl9IHNldHRpbmdzLnN0YXJ0WSAtIHRoZSBzdGFydGluZyB0aWx0IG9uIHRoZSBZIGF4aXMsIGluIGRlZ3JlZXMuIERlZmF1bHQ6IDBcclxuICAgKiBAcGFyYW0ge251bWJlcn0gc2V0dGluZ3MucGVyc3BlY3RpdmUgLSBUcmFuc2Zvcm0gcGVyc3BlY3RpdmUsIHRoZSBsb3dlciB0aGUgbW9yZSBleHRyZW1lIHRoZSB0aWx0IGdldHNcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc2V0dGluZ3MuZWFzaW5nIC0gRWFzaW5nIG9uIGVudGVyL2V4aXRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gc2V0dGluZ3Muc2NhbGUgLSAyID0gMjAwJSwgMS41ID0gMTUwJSwgZXRjLi5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gc2V0dGluZ3Muc3BlZWQgLSBTcGVlZCBvZiB0aGUgZW50ZXIvZXhpdCB0cmFuc2l0aW9uXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBzZXR0aW5ncy50cmFuc2l0aW9uIC0gU2V0IGEgdHJhbnNpdGlvbiBvbiBlbnRlci9leGl0XHJcbiAgICogQHBhcmFtIHtzdHJpbmd8bnVsbH0gc2V0dGluZ3MuYXhpcyAtIFdoYXQgYXhpcyBzaG91bGQgYmUgZW5hYmxlZC4gQ2FuIGJlIFwieFwiIG9yIFwieVwiXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBzZXR0aW5ncy5nbGFyZSAtIGlmIGl0IHNob3VsZCBoYXZlIGEgXCJnbGFyZVwiIGVmZmVjdFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzZXR0aW5ncy5tYXgtZ2xhcmUgLSB0aGUgbWF4aW11bSBcImdsYXJlXCIgb3BhY2l0eSAoMSA9IDEwMCUsIDAuNSA9IDUwJSlcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHNldHRpbmdzLmdsYXJlLXByZXJlbmRlciAtIGZhbHNlID0gVmFuaWxsYVRpbHQgY3JlYXRlcyB0aGUgZ2xhcmUgZWxlbWVudHMgZm9yIHlvdSwgb3RoZXJ3aXNlXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBzZXR0aW5ncy5mdWxsLXBhZ2UtbGlzdGVuaW5nIC0gSWYgdHJ1ZSwgcGFyYWxsYXggZWZmZWN0IHdpbGwgbGlzdGVuIHRvIG1vdXNlIG1vdmUgZXZlbnRzIG9uIHRoZSB3aG9sZSBkb2N1bWVudCwgbm90IG9ubHkgdGhlIHNlbGVjdGVkIGVsZW1lbnRcclxuICAgKiBAcGFyYW0ge3N0cmluZ3xvYmplY3R9IHNldHRpbmdzLm1vdXNlLWV2ZW50LWVsZW1lbnQgLSBTdHJpbmcgc2VsZWN0b3Igb3IgbGluayB0byBIVE1MLWVsZW1lbnQgd2hhdCB3aWxsIGJlIGxpc3RlbiBtb3VzZSBldmVudHNcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHNldHRpbmdzLnJlc2V0IC0gZmFsc2UgPSBJZiB0aGUgdGlsdCBlZmZlY3QgaGFzIHRvIGJlIHJlc2V0IG9uIGV4aXRcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHNldHRpbmdzLnJlc2V0LXRvLXN0YXJ0IC0gdHJ1ZSA9IE9uIHJlc2V0IGV2ZW50IChtb3VzZSBsZWF2ZSkgd2lsbCByZXR1cm4gdG8gaW5pdGlhbCBzdGFydCBhbmdsZSAoaWYgc3RhcnRYIG9yIHN0YXJ0WSBpcyBzZXQpXHJcbiAgICogQHBhcmFtIHtneXJvc2NvcGV9IHNldHRpbmdzLmd5cm9zY29wZSAtIEVuYWJsZSB0aWx0aW5nIGJ5IGRldmljZW9yaWVudGF0aW9uIGV2ZW50c1xyXG4gICAqIEBwYXJhbSB7Z3lyb3Njb3BlU2Vuc2l0aXZpdHl9IHNldHRpbmdzLmd5cm9zY29wZVNlbnNpdGl2aXR5IC0gQmV0d2VlbiAwIGFuZCAxIC0gVGhlIGFuZ2xlIGF0IHdoaWNoIG1heCB0aWx0IHBvc2l0aW9uIGlzIHJlYWNoZWQuIDEgPSA5MGRlZywgMC41ID0gNDVkZWcsIGV0Yy4uXHJcbiAgICogQHBhcmFtIHtneXJvc2NvcGVTYW1wbGVzfSBzZXR0aW5ncy5neXJvc2NvcGVTYW1wbGVzIC0gSG93IG1hbnkgZ3lyb3Njb3BlIG1vdmVzIHRvIGRlY2lkZSB0aGUgc3RhcnRpbmcgcG9zaXRpb24uXHJcbiAgICovXG5cblxuICBWYW5pbGxhVGlsdC5wcm90b3R5cGUuZXh0ZW5kU2V0dGluZ3MgPSBmdW5jdGlvbiBleHRlbmRTZXR0aW5ncyhzZXR0aW5ncykge1xuICAgIHZhciBkZWZhdWx0U2V0dGluZ3MgPSB7XG4gICAgICByZXZlcnNlOiBmYWxzZSxcbiAgICAgIG1heDogMTUsXG4gICAgICBzdGFydFg6IDAsXG4gICAgICBzdGFydFk6IDAsXG4gICAgICBwZXJzcGVjdGl2ZTogMTAwMCxcbiAgICAgIGVhc2luZzogXCJjdWJpYy1iZXppZXIoLjAzLC45OCwuNTIsLjk5KVwiLFxuICAgICAgc2NhbGU6IDEsXG4gICAgICBzcGVlZDogMzAwLFxuICAgICAgdHJhbnNpdGlvbjogdHJ1ZSxcbiAgICAgIGF4aXM6IG51bGwsXG4gICAgICBnbGFyZTogZmFsc2UsXG4gICAgICBcIm1heC1nbGFyZVwiOiAxLFxuICAgICAgXCJnbGFyZS1wcmVyZW5kZXJcIjogZmFsc2UsXG4gICAgICBcImZ1bGwtcGFnZS1saXN0ZW5pbmdcIjogZmFsc2UsXG4gICAgICBcIm1vdXNlLWV2ZW50LWVsZW1lbnRcIjogbnVsbCxcbiAgICAgIHJlc2V0OiB0cnVlLFxuICAgICAgXCJyZXNldC10by1zdGFydFwiOiB0cnVlLFxuICAgICAgZ3lyb3Njb3BlOiB0cnVlLFxuICAgICAgZ3lyb3Njb3BlTWluQW5nbGVYOiAtNDUsXG4gICAgICBneXJvc2NvcGVNYXhBbmdsZVg6IDQ1LFxuICAgICAgZ3lyb3Njb3BlTWluQW5nbGVZOiAtNDUsXG4gICAgICBneXJvc2NvcGVNYXhBbmdsZVk6IDQ1LFxuICAgICAgZ3lyb3Njb3BlU2FtcGxlczogMTBcbiAgICB9O1xuXG4gICAgdmFyIG5ld1NldHRpbmdzID0ge307XG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gZGVmYXVsdFNldHRpbmdzKSB7XG4gICAgICBpZiAocHJvcGVydHkgaW4gc2V0dGluZ3MpIHtcbiAgICAgICAgbmV3U2V0dGluZ3NbcHJvcGVydHldID0gc2V0dGluZ3NbcHJvcGVydHldO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmVsZW1lbnQuaGFzQXR0cmlidXRlKFwiZGF0YS10aWx0LVwiICsgcHJvcGVydHkpKSB7XG4gICAgICAgIHZhciBhdHRyaWJ1dGUgPSB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiZGF0YS10aWx0LVwiICsgcHJvcGVydHkpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIG5ld1NldHRpbmdzW3Byb3BlcnR5XSA9IEpTT04ucGFyc2UoYXR0cmlidXRlKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIG5ld1NldHRpbmdzW3Byb3BlcnR5XSA9IGF0dHJpYnV0ZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3U2V0dGluZ3NbcHJvcGVydHldID0gZGVmYXVsdFNldHRpbmdzW3Byb3BlcnR5XTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbmV3U2V0dGluZ3M7XG4gIH07XG5cbiAgVmFuaWxsYVRpbHQuaW5pdCA9IGZ1bmN0aW9uIGluaXQoZWxlbWVudHMsIHNldHRpbmdzKSB7XG4gICAgaWYgKGVsZW1lbnRzIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgZWxlbWVudHMgPSBbZWxlbWVudHNdO1xuICAgIH1cblxuICAgIGlmIChlbGVtZW50cyBpbnN0YW5jZW9mIE5vZGVMaXN0KSB7XG4gICAgICBlbGVtZW50cyA9IFtdLnNsaWNlLmNhbGwoZWxlbWVudHMpO1xuICAgIH1cblxuICAgIGlmICghKGVsZW1lbnRzIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgaWYgKCEoXCJ2YW5pbGxhVGlsdFwiIGluIGVsZW1lbnQpKSB7XG4gICAgICAgIGVsZW1lbnQudmFuaWxsYVRpbHQgPSBuZXcgVmFuaWxsYVRpbHQoZWxlbWVudCwgc2V0dGluZ3MpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiBWYW5pbGxhVGlsdDtcbn0oKTtcblxuaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAvKiBleHBvc2UgdGhlIGNsYXNzIHRvIHdpbmRvdyAqL1xuICB3aW5kb3cuVmFuaWxsYVRpbHQgPSBWYW5pbGxhVGlsdDtcblxuICAvKipcclxuICAgKiBBdXRvIGxvYWRcclxuICAgKi9cbiAgVmFuaWxsYVRpbHQuaW5pdChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtdGlsdF1cIikpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFZhbmlsbGFUaWx0O1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCBWYW5pbGxhVGlsdCBmcm9tICd2YW5pbGxhLXRpbHQnXHJcblxyXG5WYW5pbGxhVGlsdC5pbml0KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc3RhcnRlZF9faW1hZ2VzXCIpLCB7bWF4OiA1LCBzcGVlZDogOTAwfSk7XHJcblZhbmlsbGFUaWx0LmluaXQoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5ncmVldGluZ19fYm9keSBsaVwiKSwge21heDogMTUsIHNwZWVkOiA5MDB9KTtcclxuXHJcbmNvbnN0IHN3aXBlciA9IG5ldyBTd2lwZXIoJy5zd2lwZXInLCB7XHJcblx0bmF2aWdhdGlvbjoge1xyXG5cdFx0bmV4dEVsOiBcIi5idXR0b24tbmV4dFwiLFxyXG5cdFx0cHJldkVsOiBcIi5idXR0b24tcHJldlwiLFxyXG5cdH0sXHJcblx0YnJlYWtwb2ludHM6IHtcclxuXHRcdDMyMDoge1xyXG5cdFx0XHRzbGlkZXNQZXJWaWV3OiAxLFxyXG5cdFx0XHRzcGFjZUJldHdlZW5TbGlkZXM6IDEwXHJcblx0XHR9LFxyXG5cdFx0NDk5OiB7XHJcblx0XHRcdHNsaWRlc1BlclZpZXc6IDIsXHJcblx0XHRcdHNwYWNlQmV0d2VlblNsaWRlczogMTBcclxuXHRcdH0sXHJcblx0XHQ5OTI6IHtcclxuXHRcdFx0c2xpZGVzUGVyVmlldzogMyxcclxuXHRcdFx0c3BhY2VCZXR3ZWVuU2xpZGVzOiAxMFxyXG5cdFx0fSxcclxuXHRcdDEwMjQ6IHtcclxuXHRcdFx0c2xpZGVzUGVyVmlldzogNCxcclxuXHRcdFx0c3BhY2VCZXR3ZWVuU2xpZGVzOiAxMFxyXG5cdFx0fSxcclxuXHRcdDEzNjc6IHtcclxuXHRcdFx0c2xpZGVzUGVyVmlldzogNSxcclxuXHRcdFx0c3BhY2VCZXR3ZWVuU2xpZGVzOiAyNFxyXG5cdFx0fVxyXG5cdH1cclxufSk7XHJcbiJdLCJuYW1lcyI6WyJWYW5pbGxhVGlsdCIsImluaXQiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJtYXgiLCJzcGVlZCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJzd2lwZXIiLCJTd2lwZXIiLCJuYXZpZ2F0aW9uIiwibmV4dEVsIiwicHJldkVsIiwiYnJlYWtwb2ludHMiLCJzbGlkZXNQZXJWaWV3Iiwic3BhY2VCZXR3ZWVuU2xpZGVzIl0sInNvdXJjZVJvb3QiOiIifQ==