type TRandomOrgSuccessResponse = {
  jsonrpc: string;
  result: {
    random: {
      data: number | number[];
    };
  };
  id: number;
};
type TRandomOrgErrorResponse = {
  jsonrpc: string;
  error: {
    code: number;
    message: string;
    data: null | string;
  };
  id: number;
};

export const getRandInt = (min = 1, max = 100) =>
  fetch('https://api.random.org/json-rpc/4/invoke', {
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'generateIntegers',
      params: {
        apiKey: '44b4bb7b-93c4-4667-ae44-5f9cbb768f3d',
        n: 1,
        min: min,
        max: max,
      },
      id: 18197,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
    .then((res) => {
      return res.json() as Promise<TRandomOrgSuccessResponse | TRandomOrgErrorResponse>;
    })
    .then((data) => {
      if ((data as TRandomOrgErrorResponse).error) {
        throw new Error('[ERROR] RandomOrg responded with an error: ' + JSON.stringify(data));
      } else {
        return (data as TRandomOrgSuccessResponse).result.random.data;
      }
    })
    .catch((err) => console.warn(err));
