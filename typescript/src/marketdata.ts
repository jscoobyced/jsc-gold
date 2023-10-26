import { GoldResult } from "./models";

const MarketData = (exchange: string, isMetal: boolean = false) => {
  const TROYOUNCE_TO_GRAM = 31.1035;
  const MARKETDATA_API_KEY = ""; // use dotenv to load

  const MARKETDATA_URL = "https://marketdata.tradermade.com/api/v1/";
  const MARKETDATA_LIVE_URL_PREFIX = `live?currency=${exchange}`;

  const MARKETDATA_HISTORICAL_URL_PREFIX = `historical?currency=${exchange}`;
  const MARKETDATA_HISTORICAL_URL_DATE = "&date=";
  const MARKETDATA_URL_SUFFIX = `&api_key=${MARKETDATA_API_KEY}`;

  const divider = isMetal ? TROYOUNCE_TO_GRAM : 1;

  const requestOptions: RequestInit = {
    method: "GET",
    redirect: "follow",
  };

  type HistoricalResponse = {
    date: string;
    endpoint: string;
    request_time: string;
    quotes: [
      {
        base_currency: string;
        close: number;
        high: number;
        low: number;
        open: number;
        quote_currency: string;
      }
    ];
  };

  type LiveResponse = {
    requested_time: string;
    endpoint: string;
    quotes: [
      {
        base_currency: string;
        ask: number;
        bid: number;
        mid: number;
        quote_currency: string;
      }
    ];
  };

  const historical = async (
    currency: string,
    historicalDate: string
  ): Promise<GoldResult> => {
    const url = `${MARKETDATA_URL}${MARKETDATA_HISTORICAL_URL_PREFIX}${currency}${MARKETDATA_HISTORICAL_URL_DATE}${historicalDate}${MARKETDATA_URL_SUFFIX}`;
    const goldResult = await fetchData(url);
    return goldResult;
  };

  const live = async (currency: string): Promise<GoldResult> => {
    const url = `${MARKETDATA_URL}${MARKETDATA_LIVE_URL_PREFIX}${currency}${MARKETDATA_URL_SUFFIX}`;
    const goldResult = await fetchData(url);
    return goldResult;
  };

  const fetchData = async (url: string): Promise<GoldResult> => {
    const rawResponse = await fetch(url, requestOptions);
    const jsonResponse: HistoricalResponse =
      (await rawResponse.json()) as HistoricalResponse;

    if ("request_time" in jsonResponse) {
      const apiResponse = jsonResponse as HistoricalResponse;
      const date = apiResponse.date;
      const value = apiResponse.quotes[0].close / divider;
      const currency = apiResponse.quotes[0].quote_currency;
      const goldResult: GoldResult = {
        date,
        value,
        currency,
      };
      return goldResult;
    }
    const apiResponse = jsonResponse as LiveResponse;
    const date = new Date(apiResponse.requested_time)
      .toISOString()
      .split("T")[0];
    const value = apiResponse.quotes[0].mid / TROYOUNCE_TO_GRAM;
    const currency = apiResponse.quotes[0].quote_currency;
    const goldResult: GoldResult = {
      date,
      value,
      currency,
    };
    return goldResult;
  };

  return {
    historical,
    live,
  };
};

export default MarketData;
