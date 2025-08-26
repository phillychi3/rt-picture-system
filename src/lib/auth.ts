import { getDb, parseId } from './db';
import bcrypt from 'bcrypt';
import { dev } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

const JWT_EXPIRES_IN = '7d';

export type User = {
	id: string;
	username: string;
	role: 'admin' | 'user';
	password?: string;
	createdAt: Date;
	updatedAt?: Date;
};

export function createToken(user: { id: string; username: string; role: string }) {
	return jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, {
		expiresIn: JWT_EXPIRES_IN
	});
}

export function verifyToken(token: string) {
	try {
		return jwt.verify(token, JWT_SECRET) as {
			id: string;
			username: string;
			role: string;
		};
	} catch (err) {
		console.error(err);
		return null;
	}
}

export async function createUser(userData: Omit<User, 'id' | 'createdAt'>) {
	const db = await getDb();

	const existingUser = await db.collection('users').findOne({ username: userData.username });
	if (existingUser) {
		throw new Error('用戶名已存在');
	}

	const hashedPassword = await bcrypt.hash(userData.password || '', 10);

	const newUser = {
		username: userData.username,
		password: hashedPassword,
		role: userData.role || 'user',
		createdAt: new Date()
	};

	const result = await db.collection('users').insertOne(newUser);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { password, ...userWithoutPassword } = newUser;
	return {
		id: result.insertedId.toString(),
		...userWithoutPassword
	};
}

export async function updateUser(id: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>) {
	const db = await getDb();
	const userId = parseId(id);

	const updateData: Partial<User> = {
		updatedAt: new Date()
	};

	if (userData.username) {
		const existingUser = await db.collection('users').findOne({
			username: userData.username,
			_id: { $ne: userId }
		});

		if (existingUser) {
			throw new Error('用戶名已被其他用戶使用');
		}

		updateData.username = userData.username;
	}

	if (userData.password) {
		updateData.password = await bcrypt.hash(userData.password, 10);
	}

	if (userData.role) {
		updateData.role = userData.role;
	}

	await db.collection('users').updateOne({ _id: userId }, { $set: updateData });

	return getUserById(id);
}

export async function getUserById(id: string): Promise<User | null> {
	const db = await getDb();
	const userId = parseId(id);

	const user = await db.collection('users').findOne({ _id: userId });

	if (!user) return null;

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { password, ...userWithoutPassword } = user;

	return {
		id: user._id.toString(),
		...userWithoutPassword
	} as User;
}

export async function getAllUsers(): Promise<User[]> {
	const db = await getDb();

	const users = await db.collection('users').find({}).toArray();

	return users.map((user) => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...userWithoutPassword } = user;

		return {
			id: user._id.toString(),
			...userWithoutPassword
		} as User;
	});
}

export async function validateCredentials(
	username: string,
	password: string
): Promise<User | null> {
	const db = await getDb();

	const user = await db.collection('users').findOne({ username });

	if (!user) return null;

	const passwordMatch = await bcrypt.compare(password, user.password);

	if (!passwordMatch) return null;

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { password: _, ...userWithoutPassword } = user;

	return {
		id: user._id.toString(),
		...userWithoutPassword
	} as User;
}

export async function deleteUser(id: string) {
	const db = await getDb();
	const userId = parseId(id);

	return db.collection('users').deleteOne({ _id: userId });
}

export async function requireAuth(locals: App.Locals) {
	if (!locals.user) {
		throw redirect(302, '/admin/login');
	}
	return locals.user;
}

export async function requireAdmin(locals: App.Locals) {
	const user = await requireAuth(locals);
	if (user.role !== 'admin') {
		throw redirect(302, '/admin');
	}
	return user;
}

export async function initializeRootAdmin() {
	if (!dev) return;

	const db = await getDb();

	const adminCount = await db.collection('users').countDocuments({ role: 'admin' });

	if (adminCount === 0) {
		await createUser({
			username: 'admin',
			password: 'admin123',
			role: 'admin'
		});

		console.log('已創建初始管理員賬號: admin / admin123');
	}
}
