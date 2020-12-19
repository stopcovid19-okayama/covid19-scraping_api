import dayjs from "dayjs";

class ResponseBuilder<T> {
  constructor(
    private responseData: T,
    private updatedAt: dayjs.Dayjs,
    private revision: number,
    private moreResults: ResponseBuilder.MoreResultStatus,
    private endCursor: string
  ) {}

  build() {
    return [
      this.responseData,
      {
        moreResults: this.moreResults,
        updated: this.updatedAt.toISOString(),
        revision: this.revision,
        endCursor: this.endCursor,
      },
    ];
  }
}

namespace ResponseBuilder {
  export enum MoreResultStatus {
    MORE_RESULTS_AFTER_LIMIT = "MORE_RESULTS_AFTER_LIMIT",
    NO_MORE_RESULTS = "NO_MORE_RESULTS",
  }
}

export { ResponseBuilder };
