import axios from "axios";

export class ScrapingData {
  static readonly globalBaseURL: string =
    "https://stopcovid19-okayama.github.io/covid19-scraping"; // 最後にスラッシュ付けないこと
  private overrideBaseUrl: string | null = null;

  constructor(option: { baseURL?: string | null } = {}) {
    if (option.baseURL) this.baseURL = option.baseURL;
  }

  set baseURL(baseURL: string | null) {
    this.overrideBaseUrl = baseURL.replace(/\/$/, "");
  }

  get baseURL() {
    return this.overrideBaseUrl || ScrapingData.globalBaseURL;
  }

  async fetch<Result = { [k: string]: string }>(fileName: string) {
    return axios
      .get<Result>(`${this.baseURL}/${fileName}.json`, { responseType: "json" })
      .then((res) => res.data);
  }
}
