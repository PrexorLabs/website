import * as v from 'valibot';
import { projects } from './projects';

// Posts written by people, through the API or /lab on Discord. Both languages are required.
export const PostText = v.object({
  en: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(500)),
  de: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(500)),
});

export const NewPost = v.object({
  kind: v.picklist(['post', 'teaser']),
  project: v.optional(v.nullable(v.picklist(projects.map((project) => project.id)))),
  text: PostText,
  url: v.optional(v.pipe(v.string(), v.url())),
});

export const PostChange = v.object({ text: v.optional(PostText), hidden: v.optional(v.boolean()) });
