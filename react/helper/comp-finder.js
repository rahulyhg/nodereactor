"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FindComp = void 0;

var _react = _interopRequireDefault(require("react"));

var AdminComps = _interopRequireWildcard(require("../admin/dashboard/pages"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var FindComp = function FindComp(props) {
  var vendor_comps = window.nr_vendor_comps;
  var _props$comp_props = props.comp_props,
      comp_props = _props$comp_props === void 0 ? {} : _props$comp_props;
  var _comp_props$node_type = comp_props.node_type,
      node_type = _comp_props$node_type === void 0 ? false : _comp_props$node_type,
      _comp_props$nr_packag = comp_props.nr_package,
      nr_package = _comp_props$nr_packag === void 0 ? false : _comp_props$nr_packag,
      component = comp_props.component,
      _comp_props$fallback_ = comp_props.fallback_component,
      fallback_component = _comp_props$fallback_ === void 0 ? false : _comp_props$fallback_;
  var params = Object.assign({}, props);
  delete params.comp_props;

  var default_resp = _react["default"].createElement("small", {
    className: "text-danger"
  }, _react["default"].createElement("u", null, _react["default"].createElement("b", null, _react["default"].createElement("i", null, component))), " not found.");

  if (node_type === true) {
    if (AdminComps[component]) {
      /* If it's admin component */
      var Cmp = {
        c: AdminComps[component]
      };
      return _react["default"].createElement(Cmp.c, params);
    }
  } else if (typeof node_type == 'string' && vendor_comps[node_type] && nr_package !== false) {
    var ret = function ret(component) {
      /* Find in third party components, theme and plugins. */
      for (var i = 0; i < vendor_comps[node_type].length; i++) {
        var node = vendor_comps[node_type][i];

        if (node.component && node.nr_package == nr_package && node.component[component]) {
          var Cmpc = {
            c: node.component[component]
          };
          return _react["default"].createElement(Cmpc.c, params);
        }
      }

      return false;
    };

    var resp = ret(component);

    if (resp == false && fallback_component !== false) {
      resp = ret(fallback_component);
    }

    if (resp) {
      return resp;
    }
  }

  return default_resp;
};

exports.FindComp = FindComp;