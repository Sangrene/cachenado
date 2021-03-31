[![npm version](https://badge.fury.io/js/cachenado.svg)](https://badge.fury.io/js/cachenado)
[![Build Status](https://travis-ci.com/Sangrene/cachenado.svg?branch=master)](https://travis-ci.com/Sangrene/cachenado)
[![Coverage Status](https://coveralls.io/repos/github/Sangrene/cachenado/badge.svg?branch=master)](https://coveralls.io/github/Sangrene/cachenado?branch=master)

# Cachenado

## What it is
Cachenado is a small caching utility which allows you to connect a store / stage manager and function results. There is no data cache included in this library. Instead Cachenado has an included mapping cache which references your store key with functions hash.

## What it is not
Cachenado will simply store a mapping between your store variable and a function name. __The storing of this function return value is still something you should do__, as you could transform this result before storing it.

## Install

`yarn add cachenado`

## How it works

### Get a cache

First, you need a cache. Cachenado provides a utility to create it as follow :

```typescript
// An object, the most basic store.
const myVariableStore = {
  applicationUserList: [],
};

// We map the "getUserList" function to the "applicationUserList" key in the store.
const funcNameToObservableNameMapping: { [key: string]: keyof typeof myVariableStore } = {
  getUserList: "applicationUserList",
};

// The cache know nows how to get the "getUserList" function return value from the store.
const cache = createCache(myVariableStore, funcNameToObservableNameMapping);
```

Or you can implement your own cache if you need to connect it to your store in a different way, it need to implements the following two functions :

```typescript
get: (key: string) => { value: any; until: number } | undefined;
set: (key: string, obj: { value: any; until: number }) => any;
```

_I plan to implement utility functions to createCache for Mobx or Redux stores but keep in mind that Cachenado is framework agnostic._

### Add caching to your function

```typescript
const getUserList = () => {
  return [{ name: "Michel" }, { name: "Michoul" }];
};

const memoizedGetUserList = timeCacheResult(cache, getUserList, {
  cacheTime: 5000, // In ms. Optionnal, default 10000
  nameToCache: "getMyUsers", // Optionnal, default is the cached function name
});
```

The second call to this function within 10 seconds and with the same arguments will instead use the get function provided by the cache to get the value stored. It will not call `getUserList` again.

# License

[MIT](https://github.com/Sangrene/cachenado/blob/master/LICENSE)
