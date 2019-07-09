# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.5.0"></a>
# [0.5.0](https://github.com/trojanowski/react-apollo-hooks/compare/v0.4.5...v0.5.0) (2019-07-09)


### Features

* **useQuery:** returns `stale` as a part of `useQuery`. ([682be73](https://github.com/trojanowski/react-apollo-hooks/commit/682be73)), closes [#91](https://github.com/trojanowski/react-apollo-hooks/issues/91)
* useMutation returns tuple with result ([e0d05fd](https://github.com/trojanowski/react-apollo-hooks/commit/e0d05fd))


* Allow `cache-and-network` in apollo-client@^2.6.0 (#169) ([74cce42](https://github.com/trojanowski/react-apollo-hooks/commit/74cce42)), closes [#169](https://github.com/trojanowski/react-apollo-hooks/issues/169)


### BREAKING CHANGES

* useMutation returns tuple with result instead of just returning a mutating function
* now Apollo Client >= 2.6.0 is required to use this library



<a name="0.4.5"></a>
## [0.4.5](https://github.com/trojanowski/react-apollo-hooks/compare/v0.4.4...v0.4.5) (2019-04-06)


### Performance Improvements

* **useQuery:** memoize helper functions ([#126](https://github.com/trojanowski/react-apollo-hooks/issues/126)) ([6bf25a9](https://github.com/trojanowski/react-apollo-hooks/commit/6bf25a9)), closes [#125](https://github.com/trojanowski/react-apollo-hooks/issues/125)



<a name="0.4.4"></a>
## [0.4.4](https://github.com/trojanowski/react-apollo-hooks/compare/v0.4.3...v0.4.4) (2019-03-25)


### Bug Fixes

* when there is an error the query returns with the previous data instead of empty data ([#100](https://github.com/trojanowski/react-apollo-hooks/issues/100)) ([583da31](https://github.com/trojanowski/react-apollo-hooks/commit/583da31))



<a name="0.4.3"></a>
## [0.4.3](https://github.com/trojanowski/react-apollo-hooks/compare/v0.4.2...v0.4.3) (2019-03-01)


### Features

* **useQuery, useMutation:** accept client option ([#95](https://github.com/trojanowski/react-apollo-hooks/issues/95)) ([0ba17aa](https://github.com/trojanowski/react-apollo-hooks/commit/0ba17aa))



<a name="0.4.2"></a>
## [0.4.2](https://github.com/trojanowski/react-apollo-hooks/compare/v0.4.1...v0.4.2) (2019-02-27)


### Features

* **useSubscription:** add skip option ([#98](https://github.com/trojanowski/react-apollo-hooks/issues/98)) ([8670f7f](https://github.com/trojanowski/react-apollo-hooks/commit/8670f7f))



<a name="0.4.1"></a>
## [0.4.1](https://github.com/trojanowski/react-apollo-hooks/compare/v0.4.0...v0.4.1) (2019-02-22)


### Features

* implement useSubscription ([#37](https://github.com/trojanowski/react-apollo-hooks/issues/37)) ([12f363b](https://github.com/trojanowski/react-apollo-hooks/commit/12f363b))



<a name="0.4.0"></a>
# [0.4.0](https://github.com/trojanowski/react-apollo-hooks/compare/v0.3.1...v0.4.0) (2019-02-13)


### Bug Fixes

* compact watchQueryOptions ([#77](https://github.com/trojanowski/react-apollo-hooks/issues/77)) ([39f59eb](https://github.com/trojanowski/react-apollo-hooks/commit/39f59eb))


### Chores

* update React peer dependency to ^16.8.0 ([#78](https://github.com/trojanowski/react-apollo-hooks/issues/78)) ([56abacc](https://github.com/trojanowski/react-apollo-hooks/commit/56abacc))


### Features

* **getMarkupFromTree:** add `onBeforeRender` handler ([#64](https://github.com/trojanowski/react-apollo-hooks/issues/64)) ([ba2af83](https://github.com/trojanowski/react-apollo-hooks/commit/ba2af83))
* **useQuery:** change default value for the `suspend` option to `false` ([#80](https://github.com/trojanowski/react-apollo-hooks/issues/80)) ([8e34e01](https://github.com/trojanowski/react-apollo-hooks/commit/8e34e01))
* **useQuery:** combine GraphQL errors in single ApolloError ([#58](https://github.com/trojanowski/react-apollo-hooks/issues/58)) ([18afba5](https://github.com/trojanowski/react-apollo-hooks/commit/18afba5))
* **useQuery:** forward `networkStatus` for queries not using suspense ([fb22d06](https://github.com/trojanowski/react-apollo-hooks/commit/fb22d06))


### BREAKING CHANGES

* **useQuery:** The default for the `suspend` option of `useQuery` is changed to `false`, and that hook no longer uses suspense by default. Suspense for data fetching is not recommended yet for production code. Please look at the [issue #69](https://github.com/trojanowski/react-apollo-hooks/issues/69) for details.
* minimum supported (and tested) version of React is now 16.8.0
* **useQuery:** if there are GraphQL errors in the response, you'll also have `error` property in the object returned by `useQuery`. It may be breaking for you if you use the presence of it to differentiate between network and GraphQL errors.



<a name="0.3.1"></a>
## [0.3.1](https://github.com/trojanowski/react-apollo-hooks/compare/v0.3.0...v0.3.1) (2019-01-25)


### Bug Fixes


* notifyOnNetworkStatusChange defaults to false ([#61](https://github.com/trojanowski/react-apollo-hooks/issues/61)) ([4da7d2d](https://github.com/trojanowski/react-apollo-hooks/commit/4da7d2d)), closes [#59](https://github.com/trojanowski/react-apollo-hooks/issues/59)



<a name="0.3.0"></a>
# [0.3.0](https://github.com/trojanowski/react-apollo-hooks/compare/v0.2.1...v0.3.0) (2019-01-16)


### Bug Fixes

* update React peer dependency ([51b3435](https://github.com/trojanowski/react-apollo-hooks/commit/51b3435))


### Code Refactoring

* Rewrite in TypeScript. ([#39](https://github.com/trojanowski/react-apollo-hooks/issues/39)) ([055f0e2](https://github.com/trojanowski/react-apollo-hooks/commit/055f0e2))


### Features

* **useQuery:** implement `skip` ([#42](https://github.com/trojanowski/react-apollo-hooks/issues/42)) ([873e7de](https://github.com/trojanowski/react-apollo-hooks/commit/873e7de))
* **useQuery:** use Apollo client state as the main source of truth ([#47](https://github.com/trojanowski/react-apollo-hooks/issues/47)) ([5ed243d](https://github.com/trojanowski/react-apollo-hooks/commit/5ed243d))
* implement SSR ([#44](https://github.com/trojanowski/react-apollo-hooks/issues/44)) ([664edc2](https://github.com/trojanowski/react-apollo-hooks/commit/664edc2))


### BREAKING CHANGES

* minimum supported (and tested) version of React is now 16.8.0-alpha.1
* `useApolloClient` throws if the client is not available in the context instead of returning null



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
