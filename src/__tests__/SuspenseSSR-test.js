'use strict';
var __makeTemplateObject =
  (this && this.__makeTemplateObject) ||
  function(cooked, raw) {
    if (Object.defineProperty) {
      Object.defineProperty(cooked, 'raw', { value: raw });
    } else {
      cooked.raw = raw;
    }
    return cooked;
  };
var __assign =
  (this && this.__assign) ||
  function() {
    __assign =
      Object.assign ||
      function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  function(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : new P(function(resolve) {
              resolve(result.value);
            }).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function(thisArg, body) {
    var _ = {
        label: 0,
        sent: function() {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function() {
          return this;
        }),
      g
    );
    function verb(n) {
      return function(v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y['return']
                  : op[0]
                  ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
var __rest =
  (this && this.__rest) ||
  function(s, e) {
    var t = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === 'function')
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++)
        if (e.indexOf(p[i]) < 0) t[p[i]] = s[p[i]];
    return t;
  };
var _this = this;
exports.__esModule = true;
var graphql_tag_1 = require('graphql-tag');
var React = require('react');
var server_1 = require('react-dom/server');
var react_testing_library_1 = require('react-testing-library');
var ApolloContext_1 = require('../ApolloContext');
var SuspenseSSR_1 = require('../SuspenseSSR');
var createClient_1 = require('../__testutils__/createClient');
var wait_1 = require('../__testutils__/wait');
var getMarkupFromTree_1 = require('../getMarkupFromTree');
var useQuery_1 = require('../useQuery');
jest.mock('../internal/actHack');
var USER_QUERY = graphql_tag_1['default'](
  templateObject_1 ||
    (templateObject_1 = __makeTemplateObject(
      ['\n  {\n    currentUser {\n      firstName\n    }\n  }\n'],
      ['\n  {\n    currentUser {\n      firstName\n    }\n  }\n']
    ))
);
var MOCKS = [
  {
    request: { query: USER_QUERY },
    result: { data: { currentUser: { firstName: 'James' } } },
  },
];
function createMockClient(link) {
  return createClient_1['default']({
    link: link,
    mocks: MOCKS,
    addTypename: false,
  });
}
function UserDetails(props) {
  var _a = useQuery_1.useQuery(USER_QUERY, props),
    data = _a.data,
    loading = _a.loading;
  return React.createElement(
    React.Fragment,
    null,
    loading
      ? 'Loading'
      : !data
      ? 'No Data'
      : !data.currentUser
      ? 'No Current User'
      : data.currentUser.firstName
  );
}
function UserDetailsWrapper(_a) {
  var client = _a.client,
    props = __rest(_a, ['client']);
  return React.createElement(
    ApolloContext_1.ApolloProvider,
    { client: client },
    React.createElement(
      SuspenseSSR_1.unstable_SuspenseSSR,
      {
        fallback: React.createElement(
          React.Fragment,
          null,
          'Loading with suspense'
        ),
      },
      React.createElement(UserDetails, __assign({}, props))
    )
  );
}
describe.each([[true], [false]])('SuspenseSSR with "suspend: %s"', function(
  suspend
) {
  it('not throws in react-dom', function() {
    return __awaiter(_this, void 0, void 0, function() {
      var client, container;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            client = createMockClient();
            container = react_testing_library_1.render(
              React.createElement(UserDetailsWrapper, {
                client: client,
                suspend: suspend,
              })
            ).container;
            if (suspend) {
              expect(container).toMatchInlineSnapshot(
                '\n<div>\n  Loading with suspense\n</div>\n'
              );
            } else {
              expect(container).toMatchInlineSnapshot(
                '\n<div>\n  Loading\n</div>\n'
              );
            }
            return [4 /*yield*/, wait_1['default']()];
          case 1:
            _a.sent();
            expect(container).toMatchInlineSnapshot(
              '\n<div>\n  James\n</div>\n'
            );
            return [2 /*return*/];
        }
      });
    });
  });
  it('not throws in react-dom/server', function() {
    return __awaiter(_this, void 0, void 0, function() {
      var client;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            client = createMockClient();
            return [
              4 /*yield*/,
              expect(
                getMarkupFromTree_1.getMarkupFromTree({
                  renderFunction: server_1.renderToString,
                  tree: React.createElement(UserDetailsWrapper, {
                    client: client,
                    suspend: suspend,
                  }),
                })
              ).resolves.toMatchInlineSnapshot('"James"'),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  });
});
var templateObject_1;
