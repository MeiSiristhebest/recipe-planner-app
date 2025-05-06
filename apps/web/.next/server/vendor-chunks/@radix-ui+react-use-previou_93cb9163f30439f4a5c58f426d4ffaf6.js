"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/@radix-ui+react-use-previou_93cb9163f30439f4a5c58f426d4ffaf6";
exports.ids = ["vendor-chunks/@radix-ui+react-use-previou_93cb9163f30439f4a5c58f426d4ffaf6"];
exports.modules = {

/***/ "(ssr)/../../node_modules/.pnpm/@radix-ui+react-use-previou_93cb9163f30439f4a5c58f426d4ffaf6/node_modules/@radix-ui/react-use-previous/dist/index.mjs":
/*!******************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@radix-ui+react-use-previou_93cb9163f30439f4a5c58f426d4ffaf6/node_modules/@radix-ui/react-use-previous/dist/index.mjs ***!
  \******************************************************************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   usePrevious: () => (/* binding */ usePrevious)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"(ssr)/../../node_modules/.pnpm/next@14.0.3_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/server/future/route-modules/app-page/vendored/ssr/react.js\");\n// packages/react/use-previous/src/use-previous.tsx\n\nfunction usePrevious(value) {\n    const ref = react__WEBPACK_IMPORTED_MODULE_0__.useRef({\n        value,\n        previous: value\n    });\n    return react__WEBPACK_IMPORTED_MODULE_0__.useMemo(()=>{\n        if (ref.current.value !== value) {\n            ref.current.previous = ref.current.value;\n            ref.current.value = value;\n        }\n        return ref.current.previous;\n    }, [\n        value\n    ]);\n}\n //# sourceMappingURL=index.mjs.map\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0ByYWRpeC11aStyZWFjdC11c2UtcHJldmlvdV85M2NiOTE2M2YzMDQzOWY0YTVjNThmNDI2ZDRmZmFmNi9ub2RlX21vZHVsZXMvQHJhZGl4LXVpL3JlYWN0LXVzZS1wcmV2aW91cy9kaXN0L2luZGV4Lm1qcyIsIm1hcHBpbmdzIjoiOzs7OztBQUFBLG1EQUFtRDtBQUNwQjtBQUMvQixTQUFTQyxZQUFZQyxLQUFLO0lBQ3hCLE1BQU1DLE1BQU1ILHlDQUFZLENBQUM7UUFBRUU7UUFBT0csVUFBVUg7SUFBTTtJQUNsRCxPQUFPRiwwQ0FBYSxDQUFDO1FBQ25CLElBQUlHLElBQUlJLE9BQU8sQ0FBQ0wsS0FBSyxLQUFLQSxPQUFPO1lBQy9CQyxJQUFJSSxPQUFPLENBQUNGLFFBQVEsR0FBR0YsSUFBSUksT0FBTyxDQUFDTCxLQUFLO1lBQ3hDQyxJQUFJSSxPQUFPLENBQUNMLEtBQUssR0FBR0E7UUFDdEI7UUFDQSxPQUFPQyxJQUFJSSxPQUFPLENBQUNGLFFBQVE7SUFDN0IsR0FBRztRQUFDSDtLQUFNO0FBQ1o7QUFHRSxDQUNGLGtDQUFrQyIsInNvdXJjZXMiOlsid2VicGFjazovL3dlYi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vQHJhZGl4LXVpK3JlYWN0LXVzZS1wcmV2aW91XzkzY2I5MTYzZjMwNDM5ZjRhNWM1OGY0MjZkNGZmYWY2L25vZGVfbW9kdWxlcy9AcmFkaXgtdWkvcmVhY3QtdXNlLXByZXZpb3VzL2Rpc3QvaW5kZXgubWpzP2MyOGMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gcGFja2FnZXMvcmVhY3QvdXNlLXByZXZpb3VzL3NyYy91c2UtcHJldmlvdXMudHN4XG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmZ1bmN0aW9uIHVzZVByZXZpb3VzKHZhbHVlKSB7XG4gIGNvbnN0IHJlZiA9IFJlYWN0LnVzZVJlZih7IHZhbHVlLCBwcmV2aW91czogdmFsdWUgfSk7XG4gIHJldHVybiBSZWFjdC51c2VNZW1vKCgpID0+IHtcbiAgICBpZiAocmVmLmN1cnJlbnQudmFsdWUgIT09IHZhbHVlKSB7XG4gICAgICByZWYuY3VycmVudC5wcmV2aW91cyA9IHJlZi5jdXJyZW50LnZhbHVlO1xuICAgICAgcmVmLmN1cnJlbnQudmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHJlZi5jdXJyZW50LnByZXZpb3VzO1xuICB9LCBbdmFsdWVdKTtcbn1cbmV4cG9ydCB7XG4gIHVzZVByZXZpb3VzXG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXgubWpzLm1hcFxuIl0sIm5hbWVzIjpbIlJlYWN0IiwidXNlUHJldmlvdXMiLCJ2YWx1ZSIsInJlZiIsInVzZVJlZiIsInByZXZpb3VzIiwidXNlTWVtbyIsImN1cnJlbnQiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/../../node_modules/.pnpm/@radix-ui+react-use-previou_93cb9163f30439f4a5c58f426d4ffaf6/node_modules/@radix-ui/react-use-previous/dist/index.mjs\n");

/***/ })

};
;