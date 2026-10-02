/**
 * YouTube stores the cover plus three auto-captured frames (maxres1-3, taken at
 * roughly 25/50/75% of the video). Using different frames keeps the same video
 * from showing the same picture twice on the page.
 */
export type YtFrame = 'maxresdefault' | 'maxres1' | 'maxres2' | 'maxres3' | 'hqdefault';

export const ytImage = (id: string, frame: YtFrame = 'maxresdefault') => `https://i.ytimg.com/vi/${id}/${frame}.jpg`;
