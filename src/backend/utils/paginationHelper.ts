export function paginationHelper_<T extends { nextPageToken?: string }, U>(
  request: (pageToken: string | undefined) => T,
  transform: (response: T) => Array<U>,
): Array<U> {
  let ret: Array<U> = [];
  let pageToken: string | undefined = undefined;
  do {
    const response = request(pageToken);
    pageToken = response.nextPageToken;
    ret = ret.concat(transform(response));
  } while (pageToken !== undefined);
  return ret;
}
