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
var react_1 = require('react');
var server_1 = require('react-dom/server');
var graphql_1 = require('graphql');
var ApolloContext_1 = require('../ApolloContext');
var createClient_1 = require('../__testutils__/createClient');
var getMarkupFromTree_1 = require('../getMarkupFromTree');
var useQuery_1 = require('../useQuery');
jest.mock('../internal/actHack');
var AUTH_QUERY = graphql_tag_1['default'](
  templateObject_1 ||
    (templateObject_1 = __makeTemplateObject(
      ['\n  {\n    isAuthorized\n  }\n'],
      ['\n  {\n    isAuthorized\n  }\n']
    ))
);
var USER_QUERY = graphql_tag_1['default'](
  templateObject_2 ||
    (templateObject_2 = __makeTemplateObject(
      ['\n  {\n    currentUser {\n      firstName\n    }\n  }\n'],
      ['\n  {\n    currentUser {\n      firstName\n    }\n  }\n']
    ))
);
var GRAPQHL_ERROR_QUERY = graphql_tag_1['default'](
  templateObject_3 ||
    (templateObject_3 = __makeTemplateObject(
      ['\n  query GrapqhlErrorQuery {\n    authorized\n  }\n'],
      ['\n  query GrapqhlErrorQuery {\n    authorized\n  }\n']
    ))
);
var NETWORK_ERROR_QUERY = graphql_tag_1['default'](
  templateObject_4 ||
    (templateObject_4 = __makeTemplateObject(
      ['\n  query NetworkErrorQuery {\n    isAuthorized\n  }\n'],
      ['\n  query NetworkErrorQuery {\n    isAuthorized\n  }\n']
    ))
);
var MOCKS = [
  {
    request: { query: AUTH_QUERY },
    result: { data: { isAuthorized: true } },
  },
  {
    request: { query: USER_QUERY },
    result: { data: { currentUser: { firstName: 'James' } } },
  },
  {
    request: { query: GRAPQHL_ERROR_QUERY, variables: {} },
    result: {
      data: { __typename: 'Query' },
      errors: [new graphql_1.GraphQLError('Simulating GraphQL error')],
    },
  },
  {
    error: new Error('Simulating network error'),
    request: { query: NETWORK_ERROR_QUERY, variables: {} },
  },
];
function createMockClient() {
  return createClient_1['default']({ mocks: MOCKS, addTypename: false });
}
function useAuthDetails(options) {
  var _a = useQuery_1.useQuery(AUTH_QUERY, options),
    data = _a.data,
    loading = _a.loading;
  return Boolean(!loading && data && data.isAuthorized);
}
function UserDetails(_a) {
  var _b = _a.query,
    query = _b === void 0 ? USER_QUERY : _b,
    props = __rest(_a, ['query']);
  var _c = useQuery_1.useQuery(query, props),
    data = _c.data,
    loading = _c.loading;
  return react_1['default'].createElement(
    react_1['default'].Fragment,
    null,
    loading
      ? 'Loading'
      : !data
      ? 'No Data (skipped)'
      : !data.currentUser
      ? 'No Current User (failed)'
      : data.currentUser.firstName
  );
}
function UserDetailsWrapper(_a) {
  var client = _a.client,
    props = __rest(_a, ['client']);
  return react_1['default'].createElement(
    ApolloContext_1.ApolloProvider,
    { client: client },
    react_1['default'].createElement(UserDetails, __assign({}, props))
  );
}
describe.each([[true], [false]])(
  'getMarkupFromTree with "suspend: %s"',
  function(suspend) {
    it('should run through all of the queries that want SSR', function() {
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
                    tree: react_1['default'].createElement(UserDetailsWrapper, {
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
    it('should allow network-only fetchPolicy as an option and still render prefetched data', function() {
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
                    tree: react_1['default'].createElement(UserDetailsWrapper, {
                      client: client,
                      suspend: suspend,
                      fetchPolicy: 'network-only',
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
    it('should allow cache-and-network fetchPolicy as an option and still render prefetched data', function() {
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
                    tree: react_1['default'].createElement(UserDetailsWrapper, {
                      client: client,
                      suspend: suspend,
                      fetchPolicy: 'cache-and-network',
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
    it('should pick up queries deep in the render tree', function() {
      return __awaiter(_this, void 0, void 0, function() {
        var client, Container;
        return __generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              client = createMockClient();
              Container = function() {
                return react_1['default'].createElement(
                  'div',
                  null,
                  react_1['default'].createElement('span', null, 'Hi'),
                  react_1['default'].createElement(
                    'div',
                    null,
                    react_1['default'].createElement(UserDetailsWrapper, {
                      client: client,
                      suspend: suspend,
                      fetchPolicy: 'cache-and-network',
                    })
                  )
                );
              };
              return [
                4 /*yield*/,
                expect(
                  getMarkupFromTree_1.getMarkupFromTree({
                    renderFunction: server_1.renderToString,
                    tree: react_1['default'].createElement(Container, null),
                  })
                ).resolves.toMatchInlineSnapshot(
                  '"<div><span>Hi</span><div>James</div></div>"'
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it('should handle nested queries that depend on each other', function() {
      return __awaiter(_this, void 0, void 0, function() {
        var client, AuthorizedUser, Container;
        return __generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              client = createMockClient();
              AuthorizedUser = function() {
                var authorized = useAuthDetails({ suspend: suspend });
                return react_1['default'].createElement(
                  'div',
                  null,
                  react_1['default'].createElement(
                    'div',
                    null,
                    'Authorized: ',
                    String(authorized)
                  ),
                  react_1['default'].createElement(UserDetails, {
                    suspend: suspend,
                    skip: !authorized,
                  })
                );
              };
              Container = function() {
                return react_1['default'].createElement(
                  ApolloContext_1.ApolloProvider,
                  { client: client },
                  react_1['default'].createElement(AuthorizedUser, null)
                );
              };
              return [
                4 /*yield*/,
                expect(
                  getMarkupFromTree_1.getMarkupFromTree({
                    renderFunction: server_1.renderToString,
                    tree: react_1['default'].createElement(Container, null),
                  })
                ).resolves.toMatchInlineSnapshot(
                  '"<div><div>Authorized: <!-- -->true</div>James</div>"'
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it('should return the first of multiple errors thrown by nested wrapped components', function() {
      return __awaiter(_this, void 0, void 0, function() {
        var client, fooError, BorkedComponent, Container;
        return __generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              client = createMockClient();
              fooError = new Error('foo');
              BorkedComponent = function() {
                throw fooError;
              };
              Container = function(props) {
                return react_1['default'].createElement(
                  'div',
                  null,
                  react_1['default'].createElement(
                    UserDetailsWrapper,
                    __assign({}, props, { client: client })
                  ),
                  react_1['default'].createElement(BorkedComponent, null),
                  react_1['default'].createElement(BorkedComponent, null)
                );
              };
              return [
                4 /*yield*/,
                expect(
                  getMarkupFromTree_1.getMarkupFromTree({
                    renderFunction: server_1.renderToString,
                    tree: react_1['default'].createElement(Container, {
                      suspend: suspend,
                    }),
                  })
                ).rejects.toBe(fooError),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it('should handle network errors thrown by queries', function() {
      return __awaiter(_this, void 0, void 0, function() {
        var client, tree;
        return __generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              client = createMockClient();
              tree = react_1['default'].createElement(UserDetailsWrapper, {
                client: client,
                suspend: suspend,
                query: NETWORK_ERROR_QUERY,
              });
              return [
                4 /*yield*/,
                expect(
                  getMarkupFromTree_1.getMarkupFromTree({
                    tree: tree,
                    renderFunction: server_1.renderToString,
                  })
                ).rejects.toMatchInlineSnapshot(
                  '[Error: Network error: Simulating network error]'
                ),
              ];
            case 1:
              _a.sent();
              expect(server_1.renderToString(tree)).toMatchInlineSnapshot(
                '"No Current User (failed)"'
              );
              return [2 /*return*/];
          }
        });
      });
    });
    it('should handle GraphQL errors thrown by queries', function() {
      return __awaiter(_this, void 0, void 0, function() {
        var client, tree;
        return __generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              client = createMockClient();
              tree = react_1['default'].createElement(UserDetailsWrapper, {
                client: client,
                suspend: suspend,
                query: GRAPQHL_ERROR_QUERY,
              });
              return [
                4 /*yield*/,
                expect(
                  getMarkupFromTree_1.getMarkupFromTree({
                    tree: tree,
                    renderFunction: server_1.renderToString,
                  })
                ).rejects.toMatchInlineSnapshot(
                  '[Error: GraphQL error: Simulating GraphQL error]'
                ),
              ];
            case 1:
              _a.sent();
              expect(server_1.renderToString(tree)).toMatchInlineSnapshot(
                '"No Current User (failed)"'
              );
              return [2 /*return*/];
          }
        });
      });
    });
    it('should correctly skip queries', function() {
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
                    tree: react_1['default'].createElement(UserDetailsWrapper, {
                      client: client,
                      skip: true,
                      suspend: suspend,
                    }),
                  })
                ).resolves.toMatchInlineSnapshot('"No Data (skipped)"'),
              ];
            case 1:
              _a.sent();
              expect(client.cache.extract()).toEqual({});
              return [2 /*return*/];
          }
        });
      });
    });
    it('should use the correct default props for a query', function() {
      return __awaiter(_this, void 0, void 0, function() {
        var client;
        return __generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              client = createMockClient();
              return [
                4 /*yield*/,
                getMarkupFromTree_1.getMarkupFromTree({
                  renderFunction: server_1.renderToString,
                  tree: react_1['default'].createElement(UserDetailsWrapper, {
                    client: client,
                    suspend: suspend,
                  }),
                }),
              ];
            case 1:
              _a.sent();
              expect(client.cache.extract()).toMatchInlineSnapshot(
                '\nObject {\n  "$ROOT_QUERY.currentUser": Object {\n    "firstName": "James",\n  },\n  "ROOT_QUERY": Object {\n    "currentUser": Object {\n      "generated": true,\n      "id": "$ROOT_QUERY.currentUser",\n      "type": "id",\n      "typename": undefined,\n    },\n  },\n}\n'
              );
              return [2 /*return*/];
          }
        });
      });
    });
    it("shouldn't run queries if ssr is turned to off", function() {
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
                    tree: react_1['default'].createElement(UserDetailsWrapper, {
                      client: client,
                      ssr: false,
                      suspend: suspend,
                    }),
                  })
                ).resolves.toMatchInlineSnapshot('"No Data (skipped)"'),
              ];
            case 1:
              _a.sent();
              expect(client.cache.extract()).toEqual({});
              return [2 /*return*/];
          }
        });
      });
    });
    it('should not require `ApolloProvider` to be the root component', function() {
      return __awaiter(_this, void 0, void 0, function() {
        var client, Root;
        return __generator(this, function(_a) {
          client = createMockClient();
          Root = function(props) {
            return react_1['default'].createElement('div', __assign({}, props));
          };
          return [
            2 /*return*/,
            expect(
              getMarkupFromTree_1.getMarkupFromTree({
                renderFunction: server_1.renderToString,
                tree: react_1['default'].createElement(
                  Root,
                  null,
                  react_1['default'].createElement(UserDetailsWrapper, {
                    client: client,
                    suspend: suspend,
                  })
                ),
              })
            ).resolves.toMatchInlineSnapshot('"<div>James</div>"'),
          ];
        });
      });
    });
  }
);
it('runs onBeforeRender', function() {
  return __awaiter(_this, void 0, void 0, function() {
    function Title(props) {
      var ctx = react_1.useContext(Context);
      ctx.headTags.push(
        react_1['default'].createElement('title', __assign({}, props))
      );
      return null;
    }
    var client, context, Context, step;
    return __generator(this, function(_a) {
      switch (_a.label) {
        case 0:
          client = createMockClient();
          context = { headTags: [] };
          Context = react_1.createContext(context);
          step = 0;
          return [
            4 /*yield*/,
            getMarkupFromTree_1.getMarkupFromTree({
              onBeforeRender: function() {
                switch (++step) {
                  case 1: {
                    // First attempt, nothing happened yet.
                    expect(context.headTags).toHaveLength(0);
                    break;
                  }
                  case 2: {
                    // Second attempt, we should have populated context.
                    expect(context.headTags).toHaveLength(1);
                    break;
                  }
                }
              },
              renderFunction: server_1.renderToString,
              tree: react_1['default'].createElement(
                react_1['default'].Fragment,
                null,
                react_1['default'].createElement(Title, null, 'Hello!'),
                react_1['default'].createElement(UserDetailsWrapper, {
                  client: client,
                })
              ),
            }),
          ];
        case 1:
          _a.sent();
          // Second attempt should create duplicates.
          expect(context.headTags).toHaveLength(2);
          expect.assertions(3);
          return [2 /*return*/];
      }
    });
  });
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
