export interface Query {
  options: any[];
  params: any[];
}

export interface _id {
  $oid: string;
}

export interface ISiGamePackInfo {
  authors: string[];
}

export interface Theme {
  name: string;
}

export interface ISiGamePackRound {
  name: string;
  themes: Theme[];
}

export interface Q_distr {
  text: number;
  say: number;
  image: number;
  voice: number;
  video: number;
  image_answer: number;
  voice_answer: number;
  video_answer: number;
  all: number;
  unknown: number;
  unknown_answer: number;
}

export interface ISiGamePackage {
  name: string;
  version: number;
  date: string;
  difficulty: number;
  tags: string[];
  info: ISiGamePackInfo;
  rounds: ISiGamePackRound[];
  q_distr: Q_distr;
}

export interface ISiGamePackInfo {
  post_id: number;
  downloads_count: number;
  from: number;
  date: number;
  comment: string;
  url: string;
  size: number;
}

export interface ISiGamePack {
  _id: _id;
  package: ISiGamePackage;
  info: ISiGamePackInfo;
}

export interface Data {
  packs: ISiGamePack[];
  count: number;
  pages: number;
}

export interface ISiGamePacksResponse {
  status: string;
  query: Query;
  data: Data;
}
