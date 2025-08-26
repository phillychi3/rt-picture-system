import { MongoClient, ObjectId } from 'mongodb';
import { MONGODB_URI } from '$env/static/private';

let client: MongoClient;
let db: any;

export async function getDb() {
	if (!client) {
		client = new MongoClient(MONGODB_URI);
		await client.connect();
		db = client.db('rtimage');
	}
	return db;
}

export function parseId(id: string) {
	try {
		return new ObjectId(id);
	} catch (e) {
		return id;
	}
}

export async function getShareById(id: string, userId?: string) {
	const db = await getDb();
	const shareId = parseId(id);

	const query: any = { _id: shareId };

	if (userId) {
		query.creatorId = userId;
	}

	const shareDoc = await db.collection('shares').findOne(query);

	if (shareDoc) {
		return serializeShare(shareDoc);
	}

	return null;
}

export async function getAllShares(userId?: string, isAdmin: boolean = false) {
	const db = await getDb();

	const query: any = {};

	if (userId && !isAdmin) {
		query.creatorId = userId;
	}

	const shares = await db.collection('shares').find(query).toArray();

	return shares.map(serializeShare);
}

function serializeShare(doc: any) {
	return {
		id: doc._id.toString(),
		title: doc.title || '',
		name: doc.name || '',
		description: doc.description || '',
		images: [...(doc.images || [])],
		creatorId: doc.creatorId || '',
		createdAt: doc.createdAt || new Date(),
		updatedAt: doc.updatedAt || undefined
	};
}

export async function createShare(shareData: any, userId: string) {
	const db = await getDb();
	const result = await db.collection('shares').insertOne({
		...shareData,
		creatorId: userId,
		createdAt: new Date()
	});

	return {
		id: result.insertedId.toString(),
		...shareData,
		creatorId: userId,
		createdAt: new Date()
	};
}

export async function updateShare(
	id: string,
	shareData: any,
	userId: string,
	isAdmin: boolean = false
) {
	const db = await getDb();
	const shareId = parseId(id);

	const existingShare = await db.collection('shares').findOne({
		_id: shareId,
		...(isAdmin ? {} : { creatorId: userId })
	});

	if (!existingShare) {
		throw new Error('分享不存在或您沒有權限編輯此分享');
	}

	await db
		.collection('shares')
		.updateOne({ _id: shareId }, { $set: { ...shareData, updatedAt: new Date() } });

	return getShareById(id);
}

export async function deleteShare(id: string, userId: string, isAdmin: boolean = false) {
	const db = await getDb();
	const shareId = parseId(id);

	const existingShare = await db.collection('shares').findOne({
		_id: shareId,
		...(isAdmin ? {} : { creatorId: userId })
	});

	if (!existingShare) {
		throw new Error('分享不存在或您沒有權限刪除此分享');
	}

	return db.collection('shares').deleteOne({ _id: shareId });
}
