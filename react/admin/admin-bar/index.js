"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AdminBar = void 0;

var _react = _interopRequireWildcard(require("react"));

var _logo = _interopRequireDefault(require("./logo.jpg"));

require("./style.scss");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var AdminBar =
/*#__PURE__*/
function (_Component) {
  _inherits(AdminBar, _Component);

  function AdminBar() {
    _classCallCheck(this, AdminBar);

    return _possibleConstructorReturn(this, _getPrototypeOf(AdminBar).apply(this, arguments));
  }

  _createClass(AdminBar, [{
    key: "render",
    value: function render() {
      var _window$nr_configs$cu = window.nr_configs.current_user,
          current_user = _window$nr_configs$cu === void 0 ? {} : _window$nr_configs$cu;
      var _current_user$display = current_user.display_name,
          display_name = _current_user$display === void 0 ? '' : _current_user$display,
          _current_user$gravata = current_user.gravatar,
          gravatar = _current_user$gravata === void 0 ? '' : _current_user$gravata;
      return _react.default.createElement("div", {
        id: "admin_header"
      }, _react.default.createElement("div", {
        className: "has_sub_content"
      }, _react.default.createElement("img", {
        src: _logo.default,
        style: {
          "maxHeight": "100%",
          "padding": "5px"
        }
      }), _react.default.createElement("div", {
        className: "sub_content left"
      }, _react.default.createElement("a", {
        href: "/",
        target: "_blank"
      }, "Visit Home"), _react.default.createElement("a", {
        href: "//NodeReactor.com",
        target: "_blank"
      }, "NR Documentation"))), _react.default.createElement("div", {
        className: "has_sub_content",
        style: {
          "float": "right"
        }
      }, _react.default.createElement("span", null, display_name), _react.default.createElement("img", {
        src: gravatar,
        style: {
          "maxHeight": "100%",
          "padding": "6px"
        }
      }), _react.default.createElement("div", {
        className: "sub_content right"
      }, _react.default.createElement("a", {
        href: "/logout"
      }, "Logout"), _react.default.createElement("a", {
        href: "/logout/all"
      }, "Logout From All"))));
    }
  }]);

  return AdminBar;
}(_react.Component);

exports.AdminBar = AdminBar;