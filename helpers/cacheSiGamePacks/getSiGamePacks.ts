import fs from "fs";
import { Data, ISiGamePacksResponse } from "./ISiGamePacksResponse";
import { envVars } from "../../constants";

let MAX_PAGE = 338;

export const getSiGamePacks = async (refetch?: boolean) => {
  const data = fs.readFileSync(envVars.SIGAME_PACKS, { encoding: "utf-8" });
  if (!refetch && data.length > 2) {
    console.log(
      "[INFO] Getting all packs from file. Got " +
        (JSON.parse(data) as Data).count
    );
    const parsedData = JSON.parse(data);
    MAX_PAGE = parsedData.count;

    return parsedData as Data;
  } else {
    const page = Math.floor(Math.random() * (MAX_PAGE - 1) + 1);
    console.log("[INFO] Getting all packs from SIGamePacks. Page:", page);
    try {
      const { data } = await fetch(
        "https://sigame.ru/api/packs?page=" + page
      ).then((res) => {
        if (!res.ok) {
          throw new Error("[WARN] SIGame responded with an error" + res);
        }
        return res.json() as Promise<ISiGamePacksResponse>;
      });
      fs.writeFileSync(envVars.SIGAME_PACKS, JSON.stringify(data));
      console.log(`[INFO] Saved ${data.count}. Page ${page}`);
      return data;
    } catch (error) {
      console.log(error);
    }
  }
};
