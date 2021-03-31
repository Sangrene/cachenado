import chai from "chai";
import spies from "chai-spies";
chai.use(spies);
const expect = chai.expect;
import { createCache, timeCacheResult, CACHE_DURATION } from ".";

describe("Cachenado", () => {
  let myVariableStore = {
    applicationUserList: [],
  };
  let functionNameToObservableNameMapping: { [key: string]: keyof typeof myVariableStore } = {
    getUserList: "applicationUserList",
  };

  let cache = createCache(myVariableStore, functionNameToObservableNameMapping);

  beforeEach(() => {
    myVariableStore = {
      applicationUserList: [],
    };
    functionNameToObservableNameMapping = {
      getUserList: "applicationUserList",
    };
    cache = createCache(myVariableStore, functionNameToObservableNameMapping);
  });

  it("Doesn't call cached function multiples times for SAME ARGUMENTS and cache duration IS NOT expired", () => {
    let countCall = 0;
    const getUserList = (arg: string) => {
      countCall++;
      return [{ user: "Michel" }, { user: "Michoul" }];
    };
    const cachedGetUserList = timeCacheResult(cache, getUserList);
    cachedGetUserList("lala");
    cachedGetUserList("lala");
    expect(countCall).to.be.equal(1);
  });

  it("Does call cached function multiple times for DIFFERENT ARGUMENTS and cache duration IS NOT expired", () => {
    let countCall = 0;
    const getUserList = (arg: string) => {
      countCall++;
      return arg;
    };
    const cachedGetUserList = timeCacheResult(cache, getUserList);
    expect(cachedGetUserList("lala")).to.equal("lala");
    expect(cachedGetUserList("lolo")).to.equal("lolo");
    expect(countCall).to.be.equal(2);
  });

  it("Does call cached function multiples times for SAME ARGUMENTS and cache duration IS expired", () => {
    let countCall = 0;
    const getUserList = (arg: string) => {
      countCall++;
      return arg;
    };
    const cachedGetUserList = timeCacheResult(cache, getUserList, { cacheTime: 0 });
    cachedGetUserList("lala");
    cachedGetUserList("lala");
    expect(countCall).to.be.equal(2);
  });
});
