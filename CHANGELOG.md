# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.2.1"></a>
## [0.2.1](https://github.com/trojanowski/react-apollo-hooks/compare/v0.2.0...v0.2.1) (2018-11-30)


### Bug Fixes

* add graphql to peer dependencies ([9488383](https://github.com/trojanowski/react-apollo-hooks/commit/9488383))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/trojanowski/react-apollo-hooks/compare/v0.1.8...v0.2.0) (2018-11-30)


### Bug Fixes

* cache queries for not-mounted yet components. It fixes problems with infinite loops after error occurred. ([246208c](https://github.com/trojanowski/react-apollo-hooks/commit/246208c)), closes [#23](https://github.com/trojanowski/react-apollo-hooks/issues/23)
* remove no longer needed `warning` dependency ([0c4459b](https://github.com/trojanowski/react-apollo-hooks/commit/0c4459b))
* update React peer dependency ([768d851](https://github.com/trojanowski/react-apollo-hooks/commit/768d851))


### Features

* remove deprecated methods ([a601691](https://github.com/trojanowski/react-apollo-hooks/commit/a601691))


### BREAKING CHANGES

* minimum supported (and tested) version of React is now 16.7.0-alpha.2
* `useApolloQuery` and `useApolloMutation` are removed. Please use `useQuery` and `useMutation` instead.



<a name="0.1.8"></a>
## [0.1.8](https://github.com/trojanowski/react-apollo-hooks/compare/v0.1.7...v0.1.8) (2018-11-29)


### Bug Fixes

* **typescript:** parametrize `update` option of `useMutation` hook ([f8d6c26](https://github.com/trojanowski/react-apollo-hooks/commit/f8d6c26))



<a name="0.1.7"></a>
## [0.1.7](https://github.com/trojanowski/react-apollo-hooks/compare/v0.1.6...v0.1.7) (2018-11-27)


### Features

* add more ObservableQuery functions to useQuery ([b0a3923](https://github.com/trojanowski/react-apollo-hooks/commit/b0a3923)), closes [#24](https://github.com/trojanowski/react-apollo-hooks/issues/24)



<a name="0.1.6"></a>
## [0.1.6](https://github.com/trojanowski/react-apollo-hooks/compare/v0.1.5...v0.1.6) (2018-11-13)


### Features

* **typescript:** add `notifyOnNetworkStatusChange` and `pollInterval` to `useQuery` options in TypeScript definitions ([f2db5b3](https://github.com/trojanowski/react-apollo-hooks/commit/f2db5b3)), closes [#18](https://github.com/trojanowski/react-apollo-hooks/issues/18)



<a name="0.1.5"></a>
## [0.1.5](https://github.com/trojanowski/react-apollo-hooks/compare/v0.1.4...v0.1.5) (2018-11-10)


### Bug Fixes

* **typescript:** make `suspend` option of `useQuery` hook optional ([7e776a6](https://github.com/trojanowski/react-apollo-hooks/commit/7e776a6))



<a name="0.1.4"></a>
## [0.1.4](https://github.com/trojanowski/react-apollo-hooks/compare/v0.1.3...v0.1.4) (2018-11-10)


### Features

* allow to use `useQuery` hook without suspense ([db119e5](https://github.com/trojanowski/react-apollo-hooks/commit/db119e5))



<a name="0.1.3"></a>
## [0.1.3](https://github.com/trojanowski/react-apollo-hooks/compare/v0.1.2...v0.1.3) (2018-11-08)


### Features

* add useQuery and useMutation hooks; deprecate useApolloQuery and useApolloMutation ([e769f94](https://github.com/trojanowski/react-apollo-hooks/commit/e769f94)), closes [#6](https://github.com/trojanowski/react-apollo-hooks/issues/6) [#9](https://github.com/trojanowski/react-apollo-hooks/issues/9)



<a name="0.1.2"></a>
## [0.1.2](https://github.com/trojanowski/react-apollo-hooks/compare/v0.1.1...v0.1.2) (2018-11-07)


### Features

* **ts:** allow to specify a TypeScript result type of mutations ([7ff3647](https://github.com/trojanowski/react-apollo-hooks/commit/7ff3647)), closes [#10](https://github.com/trojanowski/react-apollo-hooks/issues/10)
