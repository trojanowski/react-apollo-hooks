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
var graphql_tag_1 = require('graphql-tag');
var react_1 = require('react');
var react_testing_library_1 = require('react-testing-library');
var __1 = require('..');
var createClient_1 = require('../__testutils__/createClient');
var data_1 = require('../__testutils__/data');
var noop_1 = require('../__testutils__/noop');
var wait_1 = require('../__testutils__/wait');
jest.mock('../internal/actHack');
var TASKS_MOCKS = [
  {
    request: {
      query: graphql_tag_1['default'](
        templateObject_1 ||
          (templateObject_1 = __makeTemplateObject(
            [
              '\n        query TasksQuery {\n          tasks {\n            id\n            text\n            completed\n            __typename\n          }\n        }\n      ',
            ],
            [
              '\n        query TasksQuery {\n          tasks {\n            id\n            text\n            completed\n            __typename\n          }\n        }\n      ',
            ]
          ))
      ),
      variables: {},
    },
    result: {
      data: {
        __typename: 'Query',
        tasks: data_1.SAMPLE_TASKS.slice(),
      },
    },
  },
  {
    request: {
      query: graphql_tag_1['default'](
        templateObject_2 ||
          (templateObject_2 = __makeTemplateObject(
            [
              '\n        mutation ToggleTaskMutation($taskId: ID!) {\n          toggleTask(taskId: $taskId) {\n            id\n            completed\n            __typename\n          }\n        }\n      ',
            ],
            [
              '\n        mutation ToggleTaskMutation($taskId: ID!) {\n          toggleTask(taskId: $taskId) {\n            id\n            completed\n            __typename\n          }\n        }\n      ',
            ]
          ))
      ),
      variables: { taskId: '1' },
    },
    result: {
      data: {
        __typename: 'Mutation',
        toggleTask: {
          __typename: 'Task',
          completed: false,
          id: '1',
        },
      },
    },
  },
  {
    request: {
      query: graphql_tag_1['default'](
        templateObject_3 ||
          (templateObject_3 = __makeTemplateObject(
            [
              '\n        mutation AddTaskMutation($input: AddTaskMutationInput!) {\n          addTask(input: $input) {\n            id\n            text\n            completed\n            __typename\n          }\n        }\n      ',
            ],
            [
              '\n        mutation AddTaskMutation($input: AddTaskMutationInput!) {\n          addTask(input: $input) {\n            id\n            text\n            completed\n            __typename\n          }\n        }\n      ',
            ]
          ))
      ),
      variables: { input: { text: 'Learn Jest' } },
    },
    result: {
      data: {
        __typename: 'Mutation',
        addTask: {
          __typename: 'Task',
          completed: false,
          id: '4',
          text: 'Learn Jest',
        },
      },
    },
  },
];
var TASKS_QUERY = graphql_tag_1['default'](
  templateObject_4 ||
    (templateObject_4 = __makeTemplateObject(
      [
        '\n  query TasksQuery {\n    tasks {\n      id\n      text\n      completed\n    }\n  }\n',
      ],
      [
        '\n  query TasksQuery {\n    tasks {\n      id\n      text\n      completed\n    }\n  }\n',
      ]
    ))
);
var TOGGLE_TASK_MUTATION = graphql_tag_1['default'](
  templateObject_5 ||
    (templateObject_5 = __makeTemplateObject(
      [
        '\n  mutation ToggleTaskMutation($taskId: ID!) {\n    toggleTask(taskId: $taskId) {\n      id\n      completed\n    }\n  }\n',
      ],
      [
        '\n  mutation ToggleTaskMutation($taskId: ID!) {\n    toggleTask(taskId: $taskId) {\n      id\n      completed\n    }\n  }\n',
      ]
    ))
);
var ADD_TASK_MUTATION = graphql_tag_1['default'](
  templateObject_6 ||
    (templateObject_6 = __makeTemplateObject(
      [
        '\n  mutation AddTaskMutation($input: AddTaskMutationInput!) {\n    addTask(input: $input) {\n      id\n      text\n      completed\n    }\n  }\n',
      ],
      [
        '\n  mutation AddTaskMutation($input: AddTaskMutationInput!) {\n    addTask(input: $input) {\n      id\n      text\n      completed\n    }\n  }\n',
      ]
    ))
);
function Task(_a) {
  var onChange = _a.onChange,
    task = _a.task;
  return react_1['default'].createElement(
    'li',
    null,
    react_1['default'].createElement('input', {
      checked: task.completed,
      onChange: function() {
        return onChange(task);
      },
      type: 'checkbox',
    }),
    task.text
  );
}
function TaskList(_a) {
  var onChange = _a.onChange,
    tasks = _a.tasks;
  return react_1['default'].createElement(
    'ul',
    null,
    tasks.map(function(task) {
      return react_1['default'].createElement(Task, {
        key: task.id,
        onChange: onChange,
        task: task,
      });
    })
  );
}
afterEach(react_testing_library_1.cleanup);
it('should create a function to perform mutations', function() {
  return __awaiter(_this, void 0, void 0, function() {
    function TasksWithMutation() {
      var _a = __1.useQuery(TASKS_QUERY),
        data = _a.data,
        error = _a.error,
        loading = _a.loading;
      var toggleTask = __1.useMutation(TOGGLE_TASK_MUTATION);
      if (error) {
        throw error;
      }
      if (loading) {
        return react_1['default'].createElement(
          react_1['default'].Fragment,
          null,
          'Loading'
        );
      }
      return react_1['default'].createElement(TaskList, {
        onChange: function(task) {
          return toggleTask({ variables: { taskId: task.id } });
        },
        tasks: data.tasks,
      });
    }
    var client, container, firstCheckbox;
    return __generator(this, function(_a) {
      switch (_a.label) {
        case 0:
          client = createClient_1['default']({ mocks: TASKS_MOCKS });
          container = react_testing_library_1.render(
            react_1['default'].createElement(
              __1.ApolloProvider,
              { client: client },
              react_1['default'].createElement(TasksWithMutation, null)
            )
          ).container;
          return [4 /*yield*/, wait_1['default']()];
        case 1:
          _a.sent();
          firstCheckbox = container.querySelector('input:checked');
          expect(firstCheckbox.checked).toBeTruthy();
          react_testing_library_1.fireEvent.click(firstCheckbox);
          return [4 /*yield*/, wait_1['default']()];
        case 2:
          _a.sent();
          expect(container.querySelector('input').checked).toBeFalsy();
          return [2 /*return*/];
      }
    });
  });
});
it('should allow to pass options forwarded to the mutation', function() {
  return __awaiter(_this, void 0, void 0, function() {
    function TasksWithMutation() {
      var _a = __1.useQuery(TASKS_QUERY),
        data = _a.data,
        error = _a.error,
        loading = _a.loading;
      var addTask = __1.useMutation(ADD_TASK_MUTATION, {
        update: function(proxy, mutationResult) {
          var previousData = proxy.readQuery({
            query: TASKS_QUERY,
          });
          previousData.tasks.push(mutationResult.data.addTask);
          proxy.writeQuery({ data: previousData, query: TASKS_QUERY });
        },
        variables: {
          input: {
            text: 'Learn Jest',
          },
        },
      });
      if (error) {
        throw error;
      }
      if (loading) {
        return react_1['default'].createElement(
          react_1['default'].Fragment,
          null,
          'Loading'
        );
      }
      return react_1['default'].createElement(
        react_1['default'].Fragment,
        null,
        react_1['default'].createElement(TaskList, {
          onChange: noop_1['default'],
          tasks: data.tasks,
        }),
        react_1['default'].createElement(
          'button',
          {
            'data-testid': 'add-task-button',
            onClick: function() {
              return addTask();
            },
          },
          'Add new task'
        )
      );
    }
    var client, _a, container, getByTestId, addTaskButton;
    return __generator(this, function(_b) {
      switch (_b.label) {
        case 0:
          client = createClient_1['default']({ mocks: TASKS_MOCKS });
          (_a = react_testing_library_1.render(
            react_1['default'].createElement(
              __1.ApolloProvider,
              { client: client },
              react_1['default'].createElement(TasksWithMutation, null)
            )
          )),
            (container = _a.container),
            (getByTestId = _a.getByTestId);
          return [4 /*yield*/, wait_1['default']()];
        case 1:
          _b.sent();
          addTaskButton = getByTestId('add-task-button');
          react_testing_library_1.fireEvent.click(addTaskButton);
          return [4 /*yield*/, wait_1['default']()];
        case 2:
          _b.sent();
          expect(container.querySelectorAll('li')).toHaveLength(4);
          expect(container.querySelectorAll('li')[3].textContent).toBe(
            'Learn Jest'
          );
          return [2 /*return*/];
      }
    });
  });
});
var templateObject_1,
  templateObject_2,
  templateObject_3,
  templateObject_4,
  templateObject_5,
  templateObject_6;
