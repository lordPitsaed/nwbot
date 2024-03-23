import fs from 'fs';
import { Data, ISiGamePacksResponse } from './ISiGamePacksResponse';

const REQUIRED_FILE = './data_files/sigame_packs.txt';
let MAX_PAGE = 338;

export const getSiGamePacks = async () => {
  try {
    fs.readFileSync(REQUIRED_FILE);
  } catch {
    fs.writeFileSync(REQUIRED_FILE, '{}');
  }

  const data = fs.readFileSync(REQUIRED_FILE, { encoding: 'utf-8' });
  if (data.length >= 2) {
    console.log('[INFO] Getting all packs from file. Got ' + (JSON.parse(data) as Data).count);
    const parsedData = JSON.parse(data);
    MAX_PAGE = parsedData.count;

    return parsedData as Data;
  } else {
    const page = Math.random() * (MAX_PAGE - 1) + 1;
    console.log('[INFO] Getting all packs from SIGamePacks. Page:', page);
    try {
      const { data } = await fetch('https://sigame.ru/api/packs?page=' + page).then((res) => {
        if (!res.ok) {
          throw new Error('[WARN] SIGame responded with an error' + res);
        }
        return res.json() as Promise<ISiGamePacksResponse>;
      });
      fs.writeFileSync('./data_files/sigame_packs.txt', JSON.stringify(data));
      console.log(`[INFO] Saved ${data.count}. Page ${page}`);
      return data;
    } catch (error) {
      console.log(error);
    }
  }
};
