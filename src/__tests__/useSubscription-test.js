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
var __extends =
  (this && this.__extends) ||
  (function() {
    var extendStatics = function(d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function(d, b) {
            d.__proto__ = b;
          }) ||
        function(d, b) {
          for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function(d, b) {
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype =
        b === null
          ? Object.create(b)
          : ((__.prototype = b.prototype), new __());
    };
  })();
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
var _this = this;
exports.__esModule = true;
var apollo_client_1 = require('apollo-client');
var apollo_link_mock_1 = require('apollo-link-mock');
var graphql_tag_1 = require('graphql-tag');
var react_1 = require('react');
var react_testing_library_1 = require('react-testing-library');
var __1 = require('..');
var createClient_1 = require('../__testutils__/createClient');
var data_1 = require('../__testutils__/data');
var wait_1 = require('../__testutils__/wait');
jest.mock('../internal/actHack');
var TASKS_SUBSCRIPTION = graphql_tag_1['default'](
  templateObject_1 ||
    (templateObject_1 = __makeTemplateObject(
      [
        '\n  subscription NewTasks {\n    task {\n      id\n      text\n      completed\n    }\n  }\n',
      ],
      [
        '\n  subscription NewTasks {\n    task {\n      id\n      text\n      completed\n    }\n  }\n',
      ]
    ))
);
var FILTERED_TASKS_SUBSCRIPTION = graphql_tag_1['default'](
  templateObject_2 ||
    (templateObject_2 = __makeTemplateObject(
      [
        '\n  subscription FilteredNewTasks($completed: Boolean!) {\n    task(completed: $completed) {\n      id\n      text\n      completed\n    }\n  }\n',
      ],
      [
        '\n  subscription FilteredNewTasks($completed: Boolean!) {\n    task(completed: $completed) {\n      id\n      text\n      completed\n    }\n  }\n',
      ]
    ))
);
var results = data_1.SAMPLE_TASKS.map(function(task) {
  return {
    result: { data: { task: task } },
  };
});
var complitedResults = data_1.SAMPLE_TASKS.filter(function(task) {
  return task.completed;
}).map(function(task) {
  return {
    result: { data: { task: task } },
  };
});
var uncomplitedResults = data_1.SAMPLE_TASKS.filter(function(task) {
  return !task.completed;
}).map(function(task) {
  return {
    result: { data: { task: task } },
  };
});
afterEach(react_testing_library_1.cleanup);
it('should return the subscription data', function() {
  return __awaiter(_this, void 0, void 0, function() {
    var link, client, count, Component, i;
    return __generator(this, function(_a) {
      switch (_a.label) {
        case 0:
          link = new apollo_link_mock_1.MockSubscriptionLink();
          client = createClient_1['default']({ link: link });
          count = 0;
          Component = function() {
            var _a = __1.useSubscription(TASKS_SUBSCRIPTION),
              data = _a.data,
              loading = _a.loading,
              error = _a.error;
            if (count === 0) {
              expect(loading).toBe(true);
              expect(error).toBeUndefined();
              expect(data).toBeUndefined();
            } else if (count === 1) {
              expect(loading).toBe(false);
              expect(error).toBeUndefined();
              expect(data).toEqual(results[0].result.data);
            } else if (count === 2) {
              expect(loading).toBe(false);
              expect(error).toBeUndefined();
              expect(data).toEqual(results[1].result.data);
            } else if (count === 3) {
              expect(loading).toBe(false);
              expect(error).toBeUndefined();
              expect(data).toEqual(results[2].result.data);
            }
            count++;
            return null;
          };
          react_testing_library_1.render(
            react_1['default'].createElement(
              __1.ApolloProvider,
              { client: client },
              react_1['default'].createElement(Component, null)
            )
          );
          i = 0;
          _a.label = 1;
        case 1:
          if (!(i < 3)) return [3 /*break*/, 4];
          link.simulateResult(results[i]);
          return [4 /*yield*/, wait_1['default']()];
        case 2:
          _a.sent();
          _a.label = 3;
        case 3:
          i++;
          return [3 /*break*/, 1];
        case 4:
          expect(count).toBe(4);
          return [2 /*return*/];
      }
    });
  });
});
it('should return the subscription error', function() {
  return __awaiter(_this, void 0, void 0, function() {
    var link, client, subscriptionError, count, Component;
    return __generator(this, function(_a) {
      switch (_a.label) {
        case 0:
          link = new apollo_link_mock_1.MockSubscriptionLink();
          client = createClient_1['default']({ link: link });
          subscriptionError = {
            error: new Error('error occurred'),
          };
          count = 0;
          Component = function() {
            var _a = __1.useSubscription(TASKS_SUBSCRIPTION),
              data = _a.data,
              loading = _a.loading,
              error = _a.error;
            if (count === 0) {
              expect(loading).toBe(true);
              expect(error).toBeUndefined();
              expect(data).toBeUndefined();
            } else if (count === 1) {
              expect(loading).toBe(false);
              expect(error).toEqual(new Error('error occurred'));
              expect(data).toBeUndefined();
            }
            count++;
            return null;
          };
          react_testing_library_1.render(
            react_1['default'].createElement(
              __1.ApolloProvider,
              { client: client },
              react_1['default'].createElement(Component, null)
            )
          );
          link.simulateResult(subscriptionError);
          return [4 /*yield*/, wait_1['default']()];
        case 1:
          _a.sent();
          expect(count).toBe(2);
          return [2 /*return*/];
      }
    });
  });
});
it('should call provided onSubscriptionData', function() {
  return __awaiter(_this, void 0, void 0, function() {
    var link, client, count, Component, i;
    return __generator(this, function(_a) {
      switch (_a.label) {
        case 0:
          link = new apollo_link_mock_1.MockSubscriptionLink();
          client = createClient_1['default']({ link: link });
          count = 0;
          Component = function() {
            __1.useSubscription(TASKS_SUBSCRIPTION, {
              onSubscriptionData: function(opts) {
                var _a = opts.subscriptionData,
                  loading = _a.loading,
                  data = _a.data,
                  error = _a.error;
                expect(opts.client).toBeInstanceOf(
                  apollo_client_1.ApolloClient
                );
                expect(data).toEqual(results[count].result.data);
                expect(loading).toBe(false);
                expect(error).toBeUndefined();
                count++;
              },
            });
            return null;
          };
          react_testing_library_1.render(
            react_1['default'].createElement(
              __1.ApolloProvider,
              { client: client },
              react_1['default'].createElement(Component, null)
            )
          );
          i = 0;
          _a.label = 1;
        case 1:
          if (!(i < 3)) return [3 /*break*/, 4];
          link.simulateResult(results[i]);
          return [4 /*yield*/, wait_1['default']()];
        case 2:
          _a.sent();
          _a.label = 3;
        case 3:
          i++;
          return [3 /*break*/, 1];
        case 4:
          expect(count).toBe(3);
          return [2 /*return*/];
      }
    });
  });
});
it('should execute subscription with provided variables', function() {
  return __awaiter(_this, void 0, void 0, function() {
    var variables, MockSubscriptionLinkOverride, link, client, count, Component;
    return __generator(this, function(_a) {
      switch (_a.label) {
        case 0:
          variables = { completed: true };
          MockSubscriptionLinkOverride = /** @class */ (function(_super) {
            __extends(MockSubscriptionLinkOverride, _super);
            function MockSubscriptionLinkOverride() {
              return (_super !== null && _super.apply(this, arguments)) || this;
            }
            MockSubscriptionLinkOverride.prototype.request = function(req) {
              expect(req.variables).toEqual(variables);
              return _super.prototype.request.call(this, req);
            };
            return MockSubscriptionLinkOverride;
          })(apollo_link_mock_1.MockSubscriptionLink);
          link = new MockSubscriptionLinkOverride();
          client = createClient_1['default']({ link: link });
          count = 0;
          Component = function() {
            var _a = __1.useSubscription(FILTERED_TASKS_SUBSCRIPTION, {
                variables: variables,
              }),
              data = _a.data,
              loading = _a.loading,
              error = _a.error;
            if (count === 0) {
              expect(loading).toBe(true);
              expect(error).toBeUndefined();
              expect(data).toBeUndefined();
            } else if (count === 1) {
              expect(loading).toBe(false);
              expect(error).toBeUndefined();
              expect(data).toEqual(complitedResults[0].result.data);
            }
            count++;
            return null;
          };
          react_testing_library_1.render(
            react_1['default'].createElement(
              __1.ApolloProvider,
              { client: client },
              react_1['default'].createElement(Component, null)
            )
          );
          link.simulateResult(complitedResults[0]);
          return [4 /*yield*/, wait_1['default']()];
        case 1:
          _a.sent();
          expect(count).toBe(2);
          return [2 /*return*/];
      }
    });
  });
});
it('should not re-subscription if variables have not changed', function() {
  return __awaiter(_this, void 0, void 0, function() {
    var variables, MockSubscriptionLinkOverride, link, client, count, Component;
    return __generator(this, function(_a) {
      switch (_a.label) {
        case 0:
          variables = { completed: true };
          MockSubscriptionLinkOverride = /** @class */ (function(_super) {
            __extends(MockSubscriptionLinkOverride, _super);
            function MockSubscriptionLinkOverride() {
              return (_super !== null && _super.apply(this, arguments)) || this;
            }
            MockSubscriptionLinkOverride.prototype.request = function(req) {
              expect(req.variables).toEqual(variables);
              return _super.prototype.request.call(this, req);
            };
            return MockSubscriptionLinkOverride;
          })(apollo_link_mock_1.MockSubscriptionLink);
          link = new MockSubscriptionLinkOverride();
          client = createClient_1['default']({ link: link });
          count = 0;
          Component = function() {
            var _a = react_1['default'].useState(0),
              forceRender = _a[1];
            var _b = __1.useSubscription(FILTERED_TASKS_SUBSCRIPTION, {
                variables: variables,
              }),
              data = _b.data,
              loading = _b.loading,
              error = _b.error;
            if (count === 0) {
              expect(loading).toBe(true);
              expect(error).toBeUndefined();
              expect(data).toBeUndefined();
            } else if (count === 1) {
              expect(loading).toBe(false);
              expect(error).toBeUndefined();
              expect(data).toEqual(complitedResults[0].result.data);
              forceRender(function(c) {
                return c + 1;
              });
            } else if (count === 2) {
              expect(loading).toBe(false);
            }
            count++;
            return null;
          };
          react_testing_library_1.render(
            react_1['default'].createElement(
              __1.ApolloProvider,
              { client: client },
              react_1['default'].createElement(Component, null)
            )
          );
          link.simulateResult(complitedResults[0]);
          return [4 /*yield*/, wait_1['default']()];
        case 1:
          _a.sent();
          expect(count).toBe(3);
          return [2 /*return*/];
      }
    });
  });
});
it('should re-subscription if variables have changed', function() {
  return __awaiter(_this, void 0, void 0, function() {
    var MockSubscriptionLinkOverride, link, client, count, Component;
    return __generator(this, function(_a) {
      switch (_a.label) {
        case 0:
          MockSubscriptionLinkOverride = /** @class */ (function(_super) {
            __extends(MockSubscriptionLinkOverride, _super);
            function MockSubscriptionLinkOverride() {
              return (_super !== null && _super.apply(this, arguments)) || this;
            }
            MockSubscriptionLinkOverride.prototype.request = function(req) {
              this.variables = req.variables;
              return _super.prototype.request.call(this, req);
            };
            MockSubscriptionLinkOverride.prototype.simulateResult = function() {
              if (this.variables.completed) {
                return _super.prototype.simulateResult.call(
                  this,
                  complitedResults[0]
                );
              } else {
                return _super.prototype.simulateResult.call(
                  this,
                  uncomplitedResults[0]
                );
              }
            };
            return MockSubscriptionLinkOverride;
          })(apollo_link_mock_1.MockSubscriptionLink);
          link = new MockSubscriptionLinkOverride();
          client = createClient_1['default']({ link: link });
          count = 0;
          Component = function() {
            var _a = react_1['default'].useState(false),
              completed = _a[0],
              setCompleted = _a[1];
            var _b = __1.useSubscription(FILTERED_TASKS_SUBSCRIPTION, {
                variables: { completed: completed },
              }),
              data = _b.data,
              loading = _b.loading,
              error = _b.error;
            if (count === 0) {
              expect(loading).toBe(true);
              expect(error).toBeUndefined();
              expect(data).toBeUndefined();
            } else if (count === 1) {
              expect(loading).toBe(false);
              expect(error).toBeUndefined();
              expect(data).toEqual(uncomplitedResults[0].result.data);
              setCompleted(true);
            } else if (count === 2) {
              // TODO fix this
              expect(loading).toBe(false);
            } else if (count === 3) {
              expect(loading).toBe(true);
              expect(error).toBeUndefined();
              expect(data).toBeUndefined();
            } else if (count === 4) {
              expect(loading).toBe(false);
              expect(error).toBeUndefined();
              expect(data).toEqual(complitedResults[0].result.data);
            }
            count++;
            return null;
          };
          react_testing_library_1.render(
            react_1['default'].createElement(
              __1.ApolloProvider,
              { client: client },
              react_1['default'].createElement(Component, null)
            )
          );
          link.simulateResult();
          return [4 /*yield*/, wait_1['default']()];
        case 1:
          _a.sent();
          link.simulateResult();
          return [4 /*yield*/, wait_1['default']()];
        case 2:
          _a.sent();
          expect(count).toBe(5);
          return [2 /*return*/];
      }
    });
  });
});
it('should not subscribe if skip option is enabled', function() {
  return __awaiter(_this, void 0, void 0, function() {
    var variables, MockSubscriptionLinkOverride, link, client, Component;
    return __generator(this, function(_a) {
      variables = { completed: true };
      MockSubscriptionLinkOverride = /** @class */ (function(_super) {
        __extends(MockSubscriptionLinkOverride, _super);
        function MockSubscriptionLinkOverride() {
          return (_super !== null && _super.apply(this, arguments)) || this;
        }
        MockSubscriptionLinkOverride.prototype.request = function(req) {
          expect(req.variables).toEqual(variables);
          return _super.prototype.request.call(this, req);
        };
        return MockSubscriptionLinkOverride;
      })(apollo_link_mock_1.MockSubscriptionLink);
      link = new MockSubscriptionLinkOverride();
      client = createClient_1['default']({ link: link });
      Component = function() {
        var _a = __1.useSubscription(FILTERED_TASKS_SUBSCRIPTION, {
            variables: variables,
            skip: true,
          }),
          data = _a.data,
          loading = _a.loading,
          error = _a.error;
        expect(loading).toBe(true);
        expect(error).toBeUndefined();
        expect(data).toBeUndefined();
        return null;
      };
      react_testing_library_1.render(
        react_1['default'].createElement(
          __1.ApolloProvider,
          { client: client },
          react_1['default'].createElement(Component, null)
        )
      );
      react_testing_library_1.act(function() {
        link.simulateResult(complitedResults[0]);
      });
      return [2 /*return*/];
    });
  });
});
var templateObject_1, templateObject_2;
