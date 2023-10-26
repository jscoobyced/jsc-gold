const GoldApi = () => {
  const GOLDAPI_API_KEYS = [""];  // use dotenv to load
  const GOLDAPI_URL = "https://www.goldapi.io/api/XAU/";

  const myHeaders = new Headers();
  myHeaders.append(
    "x-access-token",
    GOLDAPI_API_KEYS[GOLDAPI_API_KEYS.length - 1]
  );
  myHeaders.append("Content-Type", "application/json");

  const requestOptions: RequestInit = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  type ApiResponse = {
    timestamp: number;
    metal: string;
    currency: string;
    exchange: string;
    symbol: string;
    prev_close_price: number;
    open_price: number;
    low_price: number;
    high_price: number;
    open_time: number;
    price: number;
    ch: number;
    chp: number;
    price_gram_24k: number;
    price_gram_22k: number;
    price_gram_21k: number;
    price_gram_20k: number;
    price_gram_18k: number;
    price_gram_16k: number;
    price_gram_14k: number;
    price_gram_10k: number;
  };

  type ErrorResponse = { error: string };

  type UnknownResponse = ApiResponse | ErrorResponse;

  const main = async (currency: string) => {
    const rawResponse = await fetch(
      `${GOLDAPI_URL}${currency}`,
      requestOptions
    );
    const jsonResponse: UnknownResponse =
      (await rawResponse.json()) as UnknownResponse;

    if ("error" in jsonResponse) {
      const errorResponse = jsonResponse as ErrorResponse;
      console.log(errorResponse.error);
      return;
    }
    if ("timestamp" in jsonResponse) {
      const apiResponse = jsonResponse as ApiResponse;
      const date = new Date().toISOString().split("T")[0];
      const pricePerGram = apiResponse.price_gram_24k;
      const curreny = apiResponse.currency;
      console.log(`${date}, ${pricePerGram}, ${curreny}`);
    }
  };

  return {
    main,
  };
};

export default GoldApi;
