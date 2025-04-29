export interface Blog {
	id: number;
	author: string;
	header: string;
	image: string;
	description: string;
	likes: number;
	views: number;
	date: Date;
	tag: string;
}

export const DummyBlog: Blog = {
	id: 1,
	author: 'gueh',
	header: 'pitra baka',
	image: 'file://',
	description: 'Lu mah enak',
	likes: 999,
	views: 999,
	date: new Date(),
	tag: 'JadiGini'
};
