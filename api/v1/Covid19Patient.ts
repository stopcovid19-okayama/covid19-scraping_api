import { NowRequest, NowResponse } from "@vercel/node";
import * as yup from "yup";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

import { ScrapingData } from "../../classes/scraping_data";
import { ResponseBuilder } from "../../classes/response_builder";

interface Patient {
  リリース日: Date;
  居住地: string;
  年代: string;
  性別: string;
  退院: string;
  date: string;
}

const schema = yup.object().shape({
  from: yup.date(),
  till: yup.date().default(() => new Date()),
  limit: yup.number().integer().min(0).max(1000).default(1000),
  cursor: yup.number().default(0), // 本家はstringだけど利便上numberにしてる
});

export default async (request: NowRequest, response: NowResponse) => {
  const query = await schema.validate(request.query);

  const scrapingData = await new ScrapingData().fetch<{
    date: string;
    data: Patient[];
  }>("patients");

  const firstDataDate = dayjs(scrapingData.data[0].リリース日);

  const result: Patient[] = [];
  let moreResultStatus = ResponseBuilder.MoreResultStatus.NO_MORE_RESULTS;
  let endCursor = 0;

  scrapingData.data.reverse()

  for (let i = query.cursor + 1; i < scrapingData.data.length; i++) {
    const data = scrapingData.data[i];

    const releaseDate = dayjs(data.リリース日);

    if (releaseDate.isBetween(query.from || firstDataDate, query.till)) {
      if (result.length === query.limit) {
        moreResultStatus =
          ResponseBuilder.MoreResultStatus.MORE_RESULTS_AFTER_LIMIT;

        break;
      }

      result.push(data);
      endCursor = i;
    }
  }

  const resData = new ResponseBuilder(
    result,
    dayjs(scrapingData.data[0].リリース日),
    1,
    moreResultStatus,
    String(endCursor)
  ).build();
  response.json(resData);
};
