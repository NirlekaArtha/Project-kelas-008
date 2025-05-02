export interface Blog {
	id: number;
	author: number;
	header: string;
	image: string;
	description: string;
	likes: number;
	views: number;
	updated_at: Date;
	created_at: Date;
	tag: string;
}

export const DummyBlog: Blog = {
	id: 1,
	author: 1,
	header: 'pitra baka',
	image: 'file://',
	description: 'Lu mah enak',
	likes: 999,
	views: 999,
	updated_at: new Date(),
	created_at: new Date(),
	tag: 'JadiGini'
};
