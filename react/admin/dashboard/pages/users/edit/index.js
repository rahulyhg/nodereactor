"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EditUser = void 0;

var _react = _interopRequireWildcard(require("react"));

var _axios = _interopRequireDefault(require("axios"));

var _reactSvgSpinner = _interopRequireDefault(require("react-svg-spinner"));

var _react2 = require("nodereactor/react");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var InputFields = function InputFields(props) {
  var title = props.title,
      name = props.name,
      default_value = props.default_value,
      val_colletor = props.val_colletor,
      _props$disabled = props.disabled,
      disabled = _props$disabled === void 0 ? false : _props$disabled,
      _props$children = props.children,
      children = _props$children === void 0 ? null : _props$children;
  return _react["default"].createElement("div", {
    className: "row mb-4"
  }, _react["default"].createElement("div", {
    className: "col-12 col-sm-4 col-md-3 col-lg-2"
  }, title), _react["default"].createElement("div", {
    className: "col-12 col-sm-8 col-md-6 col-lg-4"
  }, _react["default"].createElement("input", {
    name: name,
    type: "text",
    className: "form-control",
    defaultValue: default_value,
    onChange: val_colletor,
    disabled: disabled
  }), children));
};

var ProcessUser =
/*#__PURE__*/
function (_Component) {
  _inherits(ProcessUser, _Component);

  function ProcessUser(props) {
    var _this;

    _classCallCheck(this, ProcessUser);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ProcessUser).call(this, props));
    var ob = {};

    if (_this.props.ResponseData.user) {
      ob = _this.props.ResponseData.user;
    }

    _this.state = {
      user_id: ob.user_id || 0,
      display_name: ob.display_name,
      user_username: ob.user_login,
      user_email: ob.user_email,
      user_password: ob.user_password,
      'message': null,
      loading: false,
      change_pass: false
    };
    _this.storeVal = _this.storeVal.bind(_assertThisInitialized(_this));
    _this.updateUser = _this.updateUser.bind(_assertThisInitialized(_this));
    _this.togglePass = _this.togglePass.bind(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(ProcessUser, [{
    key: "togglePass",
    value: function togglePass(bool) {
      this.setState({
        change_pass: bool
      });
    }
  }, {
    key: "storeVal",
    value: function storeVal(e) {
      var el = e.currentTarget;
      this.setState(_defineProperty({}, el.name, el.value));
    }
  }, {
    key: "updateUser",
    value: function updateUser() {
      var _this2 = this;

      this.setState({
        'message': null,
        'loading': true
      });
      var vals = this.state;
      delete vals.submitable;
      delete vals.user_username;
      var send_data = {
        'action': 'nr_update_user',
        'values': vals
      };
      (0, _axios["default"])({
        method: 'post',
        url: _react2.ajax_url,
        data: send_data
      }).then(function (r) {
        _this2.setState({
          'message': r.data.message ? r.data.message : 'No response',
          'loading': false
        });
      })["catch"](function (r) {
        _this2.setState({
          'message': 'Request Error',
          'loading': false
        });
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      return !this.state.user_id || this.state.user_id == 0 ? _react["default"].createElement("small", null, "User Not Found") : _react["default"].createElement("div", null, _react["default"].createElement("div", {
        className: "row mb-4"
      }, _react["default"].createElement("div", {
        className: "col-12"
      }, _react["default"].createElement("h3", null, "Add New User"), _react["default"].createElement("small", null, "Only administrator user role available for now.", _react["default"].createElement("br", null), "More user roles and role based capabilities will be added in future versions."))), _react["default"].createElement(InputFields, {
        title: "Display Name",
        name: "display_name",
        default_value: this.state.display_name,
        val_colletor: this.storeVal
      }, _react["default"].createElement("small", null, "Visible everywhere")), _react["default"].createElement(InputFields, {
        title: "Username",
        name: "user_username",
        default_value: this.state.user_username,
        disabled: true
      }), _react["default"].createElement(InputFields, {
        title: "Email Address",
        name: "user_email",
        default_value: this.state.user_email,
        val_colletor: this.storeVal
      }), this.state.change_pass ? _react["default"].createElement(InputFields, {
        title: "Password",
        name: "user_password",
        val_colletor: this.storeVal
      }, _react["default"].createElement("small", null, "Min. 8, Max. 20 characters."), _react["default"].createElement("br", null), _react["default"].createElement("a", {
        className: "text-info",
        onClick: function onClick() {
          return _this3.togglePass(false);
        }
      }, "Don't Change Password")) : _react["default"].createElement("p", null, _react["default"].createElement("a", {
        className: "text-info",
        onClick: function onClick() {
          return _this3.togglePass(true);
        }
      }, "Change Password")), _react["default"].createElement("div", {
        className: "row mb-4"
      }, _react["default"].createElement("div", {
        className: "col-12 col-sm-4 col-md-3 col-lg-2"
      }, "User Role"), _react["default"].createElement("div", {
        className: "col-12 col-sm-8 col-md-6 col-lg-4"
      }, _react["default"].createElement("select", {
        className: "form-control",
        disabled: "disabled"
      }, _react["default"].createElement("option", {
        selected: "selected"
      }, "administrator")))), _react["default"].createElement("div", {
        className: "row mb-4"
      }, _react["default"].createElement("div", {
        className: "col-12 col-sm-4 col-md-3 col-lg-2"
      }), _react["default"].createElement("div", {
        className: "col-12 col-sm-8 col-md-6 col-lg-4"
      }, _react["default"].createElement("button", {
        className: "btn btn-secondary btn-sm",
        onClick: this.updateUser
      }, "Update"), " \xA0\xA0", this.state.loading ? _react["default"].createElement(_reactSvgSpinner["default"], {
        size: "15px"
      }) : null)), _react["default"].createElement("div", null, this.state.message));
    }
  }]);

  return ProcessUser;
}(_react.Component);

var EditUser = function EditUser(props) {
  var user_id = true;

  if (props.user_id !== true) {
    user_id = window.location.pathname;
    user_id = user_id.split('/').filter(function (item) {
      return /\S+/.test(item) == true;
    });
    user_id = user_id[user_id.length - 1];
  }

  return _react["default"].createElement(_react2.Placeholder, {
    Data: {
      'action': 'nr_get_edit_user',
      'user_id': user_id
    },
    Component: ProcessUser
  });
};

exports.EditUser = EditUser;