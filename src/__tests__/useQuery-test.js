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
var jest_react_profiler_1 = require('jest-react-profiler');
var react_1 = require('react');
var react_testing_library_1 = require('react-testing-library');
var graphql_1 = require('graphql');
var __1 = require('..');
var createClient_1 = require('../__testutils__/createClient');
var data_1 = require('../__testutils__/data');
var noop_1 = require('../__testutils__/noop');
var wait_1 = require('../__testutils__/wait');
jest.mock('../internal/actHack');
var TASKS_QUERY = graphql_tag_1['default'](
  templateObject_1 ||
    (templateObject_1 = __makeTemplateObject(
      [
        '\n  query TasksQuery {\n    tasks {\n      id\n      text\n      completed\n    }\n  }\n',
      ],
      [
        '\n  query TasksQuery {\n    tasks {\n      id\n      text\n      completed\n    }\n  }\n',
      ]
    ))
);
var GRAPQHL_ERROR_QUERY = graphql_tag_1['default'](
  templateObject_2 ||
    (templateObject_2 = __makeTemplateObject(
      ['\n  query GrapqhlErrorQuery {\n    tasks {\n      guid\n    }\n  }\n'],
      ['\n  query GrapqhlErrorQuery {\n    tasks {\n      guid\n    }\n  }\n']
    ))
);
var NETWORK_ERROR_QUERY = graphql_tag_1['default'](
  templateObject_3 ||
    (templateObject_3 = __makeTemplateObject(
      ['\n  query NetworkErrorQuery {\n    tasks {\n      id\n    }\n  }\n'],
      ['\n  query NetworkErrorQuery {\n    tasks {\n      id\n    }\n  }\n']
    ))
);
var FILTERED_TASKS_QUERY = graphql_tag_1['default'](
  templateObject_4 ||
    (templateObject_4 = __makeTemplateObject(
      [
        '\n  query FilteredTasksQuery($completed: Boolean!) {\n    tasks(completed: $completed) {\n      id\n      text\n      completed\n    }\n  }\n',
      ],
      [
        '\n  query FilteredTasksQuery($completed: Boolean!) {\n    tasks(completed: $completed) {\n      id\n      text\n      completed\n    }\n  }\n',
      ]
    ))
);
var TASKS_MOCKS = [
  {
    request: { query: TASKS_QUERY, variables: {} },
    result: {
      data: { __typename: 'Query', tasks: data_1.SAMPLE_TASKS.slice() },
    },
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
  {
    request: { query: FILTERED_TASKS_QUERY, variables: { completed: true } },
    result: {
      data: {
        __typename: 'Query',
        tasks: data_1.SAMPLE_TASKS.filter(function(task) {
          return task.completed;
        }),
      },
    },
  },
  {
    request: { query: FILTERED_TASKS_QUERY, variables: { completed: false } },
    result: {
      data: {
        __typename: 'Query',
        tasks: data_1.SAMPLE_TASKS.filter(function(task) {
          return !task.completed;
        }),
      },
    },
  },
];
function createMockClient() {
  return createClient_1['default']({ mocks: TASKS_MOCKS });
}
function TaskList(_a) {
  var tasks = _a.tasks;
  return react_1['default'].createElement(
    'ul',
    null,
    tasks.map(function(task) {
      return react_1['default'].createElement(
        'li',
        { key: task.id },
        task.text
      );
    })
  );
}
function Tasks(_a) {
  var query = _a.query,
    options = __rest(_a, ['query']);
  var _b = __1.useQuery(query, options),
    data = _b.data,
    error = _b.error,
    loading = _b.loading;
  if (error) {
    return react_1['default'].createElement(
      react_1['default'].Fragment,
      null,
      error.message
    );
  }
  if (loading) {
    return react_1['default'].createElement(
      react_1['default'].Fragment,
      null,
      'Loading without suspense'
    );
  }
  if (!data) {
    return react_1['default'].createElement(
      react_1['default'].Fragment,
      null,
      'Skipped loading of data'
    );
  }
  return react_1['default'].createElement(TaskList, { tasks: data.tasks });
}
var SuspenseCompat = function(_a) {
  var children = _a.children;
  return react_1['default'].createElement(
    react_1['default'].Fragment,
    null,
    children
  );
};
function TasksWrapper(_a) {
  var client = _a.client,
    props = __rest(_a, ['client']);
  var SuspenseComponent =
    props.suspend !== false ? react_1.Suspense : SuspenseCompat;
  var inner = react_1['default'].createElement(
    SuspenseComponent,
    {
      fallback: react_1['default'].createElement(
        react_1['default'].Fragment,
        null,
        'Loading with suspense'
      ),
    },
    react_1['default'].createElement(Tasks, __assign({}, props))
  );
  if (client) {
    return react_1['default'].createElement(
      __1.ApolloProvider,
      { client: client },
      inner
    );
  }
  return inner;
}
afterEach(react_testing_library_1.cleanup);
it('should return the query data', function() {
  return __awaiter(_this, void 0, void 0, function() {
    var client, container;
    return __generator(this, function(_a) {
      switch (_a.label) {
        case 0:
          client = createMockClient();
          container = react_testing_library_1.render(
            react_1['default'].createElement(TasksWrapper, {
              client: client,
              query: TASKS_QUERY,
            })
          ).container;
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  Loading without suspense\n</div>\n'
          );
          return [4 /*yield*/, wait_1['default']()];
        case 1:
          _a.sent();
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  <ul>\n    <li>\n      Learn GraphQL\n    </li>\n    <li>\n      Learn React\n    </li>\n    <li>\n      Learn Apollo\n    </li>\n  </ul>\n</div>\n'
          );
          return [2 /*return*/];
      }
    });
  });
});
it('should accept a client option', function() {
  return __awaiter(_this, void 0, void 0, function() {
    var client, container;
    return __generator(this, function(_a) {
      switch (_a.label) {
        case 0:
          client = createMockClient();
          container = react_testing_library_1.render(
            react_1['default'].createElement(TasksWrapper, {
              query: TASKS_QUERY,
              client: client,
            })
          ).container;
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  Loading without suspense\n</div>\n'
          );
          return [4 /*yield*/, wait_1['default']()];
        case 1:
          _a.sent();
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  <ul>\n    <li>\n      Learn GraphQL\n    </li>\n    <li>\n      Learn React\n    </li>\n    <li>\n      Learn Apollo\n    </li>\n  </ul>\n</div>\n'
          );
          return [2 /*return*/];
      }
    });
  });
});
it('should work with suspense enabled', function() {
  return __awaiter(_this, void 0, void 0, function() {
    var client, container;
    return __generator(this, function(_a) {
      switch (_a.label) {
        case 0:
          client = createMockClient();
          container = react_testing_library_1.render(
            react_1['default'].createElement(TasksWrapper, {
              client: client,
              query: TASKS_QUERY,
              suspend: true,
            })
          ).container;
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  Loading with suspense\n</div>\n'
          );
          return [4 /*yield*/, wait_1['default']()];
        case 1:
          _a.sent();
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  <ul>\n    <li>\n      Learn GraphQL\n    </li>\n    <li>\n      Learn React\n    </li>\n    <li>\n      Learn Apollo\n    </li>\n  </ul>\n</div>\n'
          );
          return [2 /*return*/];
      }
    });
  });
});
it.each([false, true])(
  'should support query variables with with "suspend: %s"',
  function(suspend) {
    return __awaiter(_this, void 0, void 0, function() {
      var client, container;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            client = createMockClient();
            container = react_testing_library_1.render(
              react_1['default'].createElement(TasksWrapper, {
                client: client,
                query: FILTERED_TASKS_QUERY,
                suspend: suspend,
                variables: { completed: true },
              })
            ).container;
            if (suspend) {
              expect(container).toMatchInlineSnapshot(
                '\n<div>\n  Loading with suspense\n</div>\n'
              );
            } else {
              expect(container).toMatchInlineSnapshot(
                '\n<div>\n  Loading without suspense\n</div>\n'
              );
            }
            return [4 /*yield*/, wait_1['default']()];
          case 1:
            _a.sent();
            expect(container).toMatchInlineSnapshot(
              '\n<div>\n  <ul>\n    <li>\n      Learn GraphQL\n    </li>\n  </ul>\n</div>\n'
            );
            return [2 /*return*/];
        }
      });
    });
  }
);
it('should support updating query variables without suspense', function() {
  return __awaiter(_this, void 0, void 0, function() {
    var client, _a, container, rerender;
    return __generator(this, function(_b) {
      switch (_b.label) {
        case 0:
          client = createMockClient();
          (_a = react_testing_library_1.render(
            react_1['default'].createElement(TasksWrapper, {
              client: client,
              query: FILTERED_TASKS_QUERY,
              variables: { completed: true },
            })
          )),
            (container = _a.container),
            (rerender = _a.rerender);
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  Loading without suspense\n</div>\n'
          );
          return [4 /*yield*/, wait_1['default']()];
        case 1:
          _b.sent();
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  <ul>\n    <li>\n      Learn GraphQL\n    </li>\n  </ul>\n</div>\n'
          );
          rerender(
            react_1['default'].createElement(TasksWrapper, {
              client: client,
              query: FILTERED_TASKS_QUERY,
              variables: { completed: false },
            })
          );
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  Loading without suspense\n</div>\n'
          );
          return [4 /*yield*/, wait_1['default']()];
        case 2:
          _b.sent();
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  <ul>\n    <li>\n      Learn React\n    </li>\n    <li>\n      Learn Apollo\n    </li>\n  </ul>\n</div>\n'
          );
          rerender(
            react_1['default'].createElement(TasksWrapper, {
              client: client,
              query: FILTERED_TASKS_QUERY,
              variables: { completed: true },
            })
          );
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  <ul>\n    <li>\n      Learn GraphQL\n    </li>\n  </ul>\n</div>\n'
          );
          return [2 /*return*/];
      }
    });
  });
});
it('should support updating query variables with suspense', function() {
  return __awaiter(_this, void 0, void 0, function() {
    var client, _a, container, rerender;
    return __generator(this, function(_b) {
      switch (_b.label) {
        case 0:
          client = createMockClient();
          (_a = react_testing_library_1.render(
            react_1['default'].createElement(TasksWrapper, {
              client: client,
              query: FILTERED_TASKS_QUERY,
              suspend: true,
              variables: { completed: true },
            })
          )),
            (container = _a.container),
            (rerender = _a.rerender);
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  Loading with suspense\n</div>\n'
          );
          return [4 /*yield*/, wait_1['default']()];
        case 1:
          _b.sent();
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  <ul>\n    <li>\n      Learn GraphQL\n    </li>\n  </ul>\n</div>\n'
          );
          rerender(
            react_1['default'].createElement(TasksWrapper, {
              client: client,
              query: FILTERED_TASKS_QUERY,
              suspend: true,
              variables: { completed: false },
            })
          );
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  <ul\n    style="display: none;"\n  >\n    <li>\n      Learn GraphQL\n    </li>\n  </ul>\n  Loading with suspense\n</div>\n'
          );
          return [4 /*yield*/, wait_1['default']()];
        case 2:
          _b.sent();
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  <ul\n    style=""\n  >\n    <li>\n      Learn React\n    </li>\n    <li>\n      Learn Apollo\n    </li>\n  </ul>\n</div>\n'
          );
          rerender(
            react_1['default'].createElement(TasksWrapper, {
              client: client,
              query: FILTERED_TASKS_QUERY,
              variables: { completed: true },
            })
          );
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  <ul\n    style=""\n  >\n    <li>\n      Learn GraphQL\n    </li>\n  </ul>\n</div>\n'
          );
          return [2 /*return*/];
      }
    });
  });
});
it("shouldn't suspend if the data is already cached", function() {
  return __awaiter(_this, void 0, void 0, function() {
    var client, _a, container, rerender;
    return __generator(this, function(_b) {
      switch (_b.label) {
        case 0:
          client = createMockClient();
          (_a = react_testing_library_1.render(
            react_1['default'].createElement(TasksWrapper, {
              client: client,
              query: FILTERED_TASKS_QUERY,
              suspend: true,
              variables: { completed: true },
            })
          )),
            (container = _a.container),
            (rerender = _a.rerender);
          return [4 /*yield*/, wait_1['default']()];
        case 1:
          _b.sent();
          rerender(
            react_1['default'].createElement(TasksWrapper, {
              client: client,
              query: FILTERED_TASKS_QUERY,
              suspend: true,
              variables: { completed: false },
            })
          );
          return [4 /*yield*/, wait_1['default']()];
        case 2:
          _b.sent();
          rerender(
            react_1['default'].createElement(TasksWrapper, {
              client: client,
              query: FILTERED_TASKS_QUERY,
              variables: { completed: true },
            })
          );
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  <ul\n    style=""\n  >\n    <li>\n      Learn GraphQL\n    </li>\n  </ul>\n</div>\n'
          );
          return [2 /*return*/];
      }
    });
  });
});
it("shouldn't allow a query with non-standard fetch policy with suspense", function() {
  return __awaiter(_this, void 0, void 0, function() {
    var client, consoleErrorMock;
    return __generator(this, function(_a) {
      client = createMockClient();
      consoleErrorMock = jest
        .spyOn(console, 'error')
        .mockImplementation(noop_1['default']);
      expect(function() {
        return react_testing_library_1.render(
          react_1['default'].createElement(TasksWrapper, {
            client: client,
            query: TASKS_QUERY,
            suspend: true,
            fetchPolicy: 'cache-and-network',
          })
        );
      }).toThrowErrorMatchingInlineSnapshot(
        '"Fetch policy cache-and-network is not supported without \'suspend: false\'"'
      );
      expect(consoleErrorMock).toBeCalled();
      consoleErrorMock.mockRestore();
      return [2 /*return*/];
    });
  });
});
it('should allow a query with non-standard fetch policy without suspense', function() {
  return __awaiter(_this, void 0, void 0, function() {
    var client, container;
    return __generator(this, function(_a) {
      switch (_a.label) {
        case 0:
          client = createMockClient();
          container = react_testing_library_1.render(
            react_1['default'].createElement(TasksWrapper, {
              client: client,
              suspend: false,
              query: TASKS_QUERY,
              fetchPolicy: 'cache-and-network',
            })
          ).container;
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  Loading without suspense\n</div>\n'
          );
          return [4 /*yield*/, wait_1['default']()];
        case 1:
          _a.sent();
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  <ul>\n    <li>\n      Learn GraphQL\n    </li>\n    <li>\n      Learn React\n    </li>\n    <li>\n      Learn Apollo\n    </li>\n  </ul>\n</div>\n'
          );
          return [2 /*return*/];
      }
    });
  });
});
it("shouldn't make obsolete renders in suspense mode", function() {
  return __awaiter(_this, void 0, void 0, function() {
    var client, TasksWrapperWithProfiler, _a, container, rerender;
    return __generator(this, function(_b) {
      switch (_b.label) {
        case 0:
          client = createMockClient();
          TasksWrapperWithProfiler = jest_react_profiler_1.withProfiler(
            TasksWrapper
          );
          (_a = react_testing_library_1.render(
            react_1['default'].createElement(TasksWrapperWithProfiler, {
              client: client,
              query: FILTERED_TASKS_QUERY,
              suspend: true,
              variables: { completed: true },
            })
          )),
            (container = _a.container),
            (rerender = _a.rerender);
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  Loading with suspense\n</div>\n'
          );
          expect(TasksWrapperWithProfiler).toHaveCommittedTimes(1);
          return [4 /*yield*/, wait_1['default']()];
        case 1:
          _b.sent();
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  <ul>\n    <li>\n      Learn GraphQL\n    </li>\n  </ul>\n</div>\n'
          );
          // TODO: Find out why.
          expect(TasksWrapperWithProfiler).toHaveCommittedTimes(2);
          rerender(
            react_1['default'].createElement(TasksWrapperWithProfiler, {
              client: client,
              query: FILTERED_TASKS_QUERY,
              suspend: true,
              variables: { completed: false },
            })
          );
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  <ul\n    style="display: none;"\n  >\n    <li>\n      Learn GraphQL\n    </li>\n  </ul>\n  Loading with suspense\n</div>\n'
          );
          return [4 /*yield*/, wait_1['default']()];
        case 2:
          _b.sent();
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  <ul\n    style=""\n  >\n    <li>\n      Learn React\n    </li>\n    <li>\n      Learn Apollo\n    </li>\n  </ul>\n</div>\n'
          );
          expect(TasksWrapperWithProfiler).toHaveCommittedTimes(
            3 // TODO: Figure out why.
          );
          rerender(
            react_1['default'].createElement(TasksWrapperWithProfiler, {
              client: client,
              query: FILTERED_TASKS_QUERY,
              suspend: true,
              variables: { completed: true },
            })
          );
          expect(TasksWrapperWithProfiler).toHaveCommittedTimes(1);
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  <ul\n    style=""\n  >\n    <li>\n      Learn GraphQL\n    </li>\n  </ul>\n</div>\n'
          );
          return [4 /*yield*/, wait_1['default']()];
        case 3:
          _b.sent();
          expect(TasksWrapperWithProfiler).toHaveCommittedTimes(1);
          return [2 /*return*/];
      }
    });
  });
});
it('skips query in suspense mode', function() {
  return __awaiter(_this, void 0, void 0, function() {
    var client, container;
    return __generator(this, function(_a) {
      switch (_a.label) {
        case 0:
          client = createMockClient();
          container = react_testing_library_1.render(
            react_1['default'].createElement(TasksWrapper, {
              client: client,
              skip: true,
              query: TASKS_QUERY,
            })
          ).container;
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  Skipped loading of data\n</div>\n'
          );
          return [4 /*yield*/, wait_1['default']()];
        case 1:
          _a.sent();
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  Skipped loading of data\n</div>\n'
          );
          return [2 /*return*/];
      }
    });
  });
});
it('skips query in non-suspense mode', function() {
  return __awaiter(_this, void 0, void 0, function() {
    var client, container;
    return __generator(this, function(_a) {
      switch (_a.label) {
        case 0:
          client = createMockClient();
          container = react_testing_library_1.render(
            react_1['default'].createElement(TasksWrapper, {
              client: client,
              skip: true,
              suspend: false,
              query: TASKS_QUERY,
            })
          ).container;
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  Skipped loading of data\n</div>\n'
          );
          return [4 /*yield*/, wait_1['default']()];
        case 1:
          _a.sent();
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  Skipped loading of data\n</div>\n'
          );
          return [2 /*return*/];
      }
    });
  });
});
it('starts skipped query in suspense mode', function() {
  return __awaiter(_this, void 0, void 0, function() {
    var client, _a, rerender, container;
    return __generator(this, function(_b) {
      switch (_b.label) {
        case 0:
          client = createMockClient();
          (_a = react_testing_library_1.render(
            react_1['default'].createElement(TasksWrapper, {
              client: client,
              query: TASKS_QUERY,
              skip: true,
              suspend: true,
            })
          )),
            (rerender = _a.rerender),
            (container = _a.container);
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  Skipped loading of data\n</div>\n'
          );
          return [4 /*yield*/, wait_1['default']()];
        case 1:
          _b.sent();
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  Skipped loading of data\n</div>\n'
          );
          rerender(
            react_1['default'].createElement(TasksWrapper, {
              client: client,
              query: TASKS_QUERY,
              skip: false,
              suspend: true,
            })
          );
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  \n  Loading with suspense\n</div>\n'
          );
          return [4 /*yield*/, wait_1['default']()];
        case 2:
          _b.sent();
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  <ul>\n    <li>\n      Learn GraphQL\n    </li>\n    <li>\n      Learn React\n    </li>\n    <li>\n      Learn Apollo\n    </li>\n  </ul>\n</div>\n'
          );
          return [2 /*return*/];
      }
    });
  });
});
it('starts skipped query in non-suspense mode', function() {
  return __awaiter(_this, void 0, void 0, function() {
    var client, _a, rerender, container;
    return __generator(this, function(_b) {
      switch (_b.label) {
        case 0:
          client = createMockClient();
          (_a = react_testing_library_1.render(
            react_1['default'].createElement(TasksWrapper, {
              client: client,
              query: TASKS_QUERY,
              skip: true,
              suspend: false,
            })
          )),
            (rerender = _a.rerender),
            (container = _a.container);
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  Skipped loading of data\n</div>\n'
          );
          return [4 /*yield*/, wait_1['default']()];
        case 1:
          _b.sent();
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  Skipped loading of data\n</div>\n'
          );
          rerender(
            react_1['default'].createElement(TasksWrapper, {
              client: client,
              skip: false,
              suspend: false,
              query: TASKS_QUERY,
            })
          );
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  Loading without suspense\n</div>\n'
          );
          return [4 /*yield*/, wait_1['default']()];
        case 2:
          _b.sent();
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  <ul>\n    <li>\n      Learn GraphQL\n    </li>\n    <li>\n      Learn React\n    </li>\n    <li>\n      Learn Apollo\n    </li>\n  </ul>\n</div>\n'
          );
          return [2 /*return*/];
      }
    });
  });
});
it('handles network error in suspense mode', function() {
  return __awaiter(_this, void 0, void 0, function() {
    var client, container;
    return __generator(this, function(_a) {
      switch (_a.label) {
        case 0:
          client = createMockClient();
          container = react_testing_library_1.render(
            react_1['default'].createElement(TasksWrapper, {
              suspend: true,
              client: client,
              query: NETWORK_ERROR_QUERY,
            })
          ).container;
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  Loading with suspense\n</div>\n'
          );
          return [4 /*yield*/, wait_1['default']()];
        case 1:
          _a.sent();
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  Network error: Simulating network error\n</div>\n'
          );
          return [2 /*return*/];
      }
    });
  });
});
it('handles network error in non-suspense mode', function() {
  return __awaiter(_this, void 0, void 0, function() {
    var client, container;
    return __generator(this, function(_a) {
      switch (_a.label) {
        case 0:
          client = createMockClient();
          container = react_testing_library_1.render(
            react_1['default'].createElement(TasksWrapper, {
              suspend: false,
              client: client,
              query: NETWORK_ERROR_QUERY,
            })
          ).container;
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  Loading without suspense\n</div>\n'
          );
          return [4 /*yield*/, wait_1['default']()];
        case 1:
          _a.sent();
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  Network error: Simulating network error\n</div>\n'
          );
          return [2 /*return*/];
      }
    });
  });
});
it('handles GraphQL error in suspense mode', function() {
  return __awaiter(_this, void 0, void 0, function() {
    var client, container;
    return __generator(this, function(_a) {
      switch (_a.label) {
        case 0:
          client = createMockClient();
          container = react_testing_library_1.render(
            react_1['default'].createElement(TasksWrapper, {
              suspend: true,
              client: client,
              query: GRAPQHL_ERROR_QUERY,
            })
          ).container;
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  Loading with suspense\n</div>\n'
          );
          return [4 /*yield*/, wait_1['default']()];
        case 1:
          _a.sent();
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  GraphQL error: Simulating GraphQL error\n</div>\n'
          );
          return [2 /*return*/];
      }
    });
  });
});
it('handles GraphQL error in non-suspense mode', function() {
  return __awaiter(_this, void 0, void 0, function() {
    var client, container;
    return __generator(this, function(_a) {
      switch (_a.label) {
        case 0:
          client = createMockClient();
          container = react_testing_library_1.render(
            react_1['default'].createElement(TasksWrapper, {
              suspend: false,
              client: client,
              query: GRAPQHL_ERROR_QUERY,
            })
          ).container;
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  Loading without suspense\n</div>\n'
          );
          return [4 /*yield*/, wait_1['default']()];
        case 1:
          _a.sent();
          expect(container).toMatchInlineSnapshot(
            '\n<div>\n  GraphQL error: Simulating GraphQL error\n</div>\n'
          );
          return [2 /*return*/];
      }
    });
  });
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
