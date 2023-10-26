import MarketData from "./marketdata";
import fs from "fs";
import { GoldResult } from "./models";

const marketdata = MarketData("USD");
const ONE_WEEK_MILLISECOND = 1 * 7 * 24 * 60 * 60 * 1000;
const goldFilePath = "historical_usd_thb.json";

const main = async () => {
  const startDate = new Date("2021-01-01");

  const delay = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
  const followingWeekData = async (
    dataDate: Date,
    dataStore: GoldResult[]
  ): Promise<GoldResult[]> => {
    const now = new Date().getTime();
    if (now < dataDate.getTime()) return dataStore;
    const historicalResult = await marketdata.historical(
      "THB",
      dataDate.toISOString().split("T")[0]
    );
    dataStore.push(historicalResult);
    await delay(500);
    return followingWeekData(
      new Date(dataDate.getTime() + ONE_WEEK_MILLISECOND),
      dataStore
    );
  };
  followingWeekData(startDate, []).then((result) => {
    fs.writeFileSync(goldFilePath, '{\n"data": [');
    result.forEach((goldResult, index) => {
      const comma = index === result.length - 1 ? "" : ",";
      const jsonResult = JSON.stringify(goldResult);
      fs.appendFileSync(goldFilePath, `\n${jsonResult}${comma}`);
    });
    fs.appendFileSync(goldFilePath, "\n]}");
  });
};

Promise.resolve(main());
