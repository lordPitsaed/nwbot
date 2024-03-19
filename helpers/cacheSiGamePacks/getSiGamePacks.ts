import fs from 'fs';
import { Data, ISiGamePacksResponse } from './ISiGamePacksResponse';

const REQUIRED_FILE = './data_files/sigame_packs.txt';

export const getSiGamePacks = async () => {
  try {
    fs.readFileSync(REQUIRED_FILE);
  } catch {
    fs.writeFileSync(REQUIRED_FILE, '{}');
  }

  const data = fs.readFileSync(REQUIRED_FILE, { encoding: 'utf-8' });
  if (data.length >= 2) {
    console.log('[INFO] Getting all packs from file. Got ' + (JSON.parse(data) as Data).count);
    return JSON.parse(data) as Data;
  } else {
    console.log('[INFO] Getting all packs from SIGamePacks');
    try {
      const { data } = await fetch('https://sigame.ru/api/packs').then((res) => {
        if (!res.ok) {
          throw new Error('[WARN] SIGame responded with an error' + res);
        }
        return res.json() as Promise<ISiGamePacksResponse>;
      });
      fs.writeFileSync('./data_files/sigame_packs.txt', JSON.stringify(data));
      console.log(`[INFO] Saved ${data.count}`);
      return data;
    } catch (error) {
      console.log(error);
    }
  }
};
