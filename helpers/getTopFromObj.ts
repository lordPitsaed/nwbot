import { sortObj } from "./sortObj";

    export const getTopFromObj = (obj: {[x: string]: number}, message) => {
      let resMessage = message + '\n';
      let iter = 1;
      const sortedObj = sortObj(obj);

      console.log(sortedObj)

      for (const user in sortedObj) {
        resMessage += `${iter}. ${user}: ${sortedObj[user]} \n`;
        iter++;
      }

      return resMessage
    }