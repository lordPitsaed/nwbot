import { getRandInt } from "./getRandInt";

export interface TLocationResponse {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  class: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  address: Address;
  extratags: any;
  boundingbox: string[];
}

export interface Address {
  road: string;
  village: string;
  county: string;
  "ISO3166-2-lvl6": string;
  state: string;
  "ISO3166-2-lvl4": string;
  country: string;
  country_code: string;
}

export const getRndGeogssrImage = async () => {
  const getHintRegExp = (key: number) =>
    new RegExp('<div id="info-box-gallery' + key + '" class="info-box-gallery">(?<hint>.+)<\\/div><\\/div>', "gim");
  const imageIdRegExp =
    /<button id="download-submit-gallery(?<key>\d)" class="download-button-gallery download-submit-gallery btn tip" data-sid="(?<imageId>\d+_.+)" title="Download this/gim;
  const coordsRegExp =
    /<meta property="og:image" content="https:\/\/maps\.googleapis\.com\/maps\/api\/streetview\?size=600x300&location=(?<coords>-?\d+.\d+,-?\d+.\d+)/gim;
  const fetchMarkup = async (offset: number) =>
    fetch(`https://www.mapcrunch.com/gallery?offset=${offset}`).then((resp) => resp.text());
  const fetchMapData = async (id: string) => fetch(`http://www.mapcrunch.com/s/${id}`).then((resp) => resp.text());

  const getLocation = async (lat: string, lon: string, lang: "ru" | "en") =>
    lang === "ru"
      ? fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&extratags=1&accept-language=ru_RU,ru;q=0.5&zoom=3`
        ).then((res) => res.json() as Promise<TLocationResponse>)
      : fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&extratags=1&accept-language=en_US,en;q=0.5&zoom=3`
        ).then((res) => res.json() as Promise<TLocationResponse>);

  const maxPage = +[...(await fetchMarkup(999999999)).matchAll(/\<a class="static"\>\d+/gm)][0]?.[0].replace(
    /\D/gm,
    ""
  );

  if (!Number.isNaN(maxPage)) {
    const randomOffset = await getRandInt(0, maxPage * 20);
    const randomPage = await fetchMarkup(randomOffset);

    const imageIdsArray = [...randomPage.matchAll(imageIdRegExp)].map((match) => match.groups?.imageId);

    const randomImage = imageIdsArray[await getRandInt(0, imageIdsArray.length - 1, true)];

    const mapData = [...(await fetchMapData(randomImage || "")).matchAll(coordsRegExp)]
      .map((match) => match.groups?.coords)[0]
      ?.split(",");

    const locationRu = await getLocation(mapData?.[0] || "0.0", mapData?.[1] || "0.0", "ru");
    const locationEn = await getLocation(mapData?.[0] || "0.0", mapData?.[1] || "0.0", "en");

    return {
      url: `https://www.mapcrunch.com/imghd/${randomImage}.jpg`,
      lat: mapData?.[0],
      lon: mapData?.[1],
      locationRu,
      locationEn,
    };
  }
};
