import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { getAllUsers, createUser, deleteUser } from '$lib/auth';

export const load: PageServerLoad = async () => {
	try {
		const users = await getAllUsers();

		return {
			users: users.map((user) => ({
				id: user.id,
				username: user.username,
				role: user.role,
				createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : undefined
			}))
		};
	} catch (err) {
		console.error('獲取用戶列表失敗:', err);
		throw error(500, '獲取用戶列表失敗');
	}
};

export const actions: Actions = {
	// 創建新用戶
	createUser: async ({ request }) => {
		const formData = await request.formData();
		const username = formData.get('username') as string;
		const password = formData.get('password') as string;
		const role = formData.get('role') as 'admin' | 'user';

		if (!username || !password) {
			return fail(400, {
				createError: '用戶名和密碼為必填項',
				username,
				role
			});
		}

		if (role !== 'admin' && role !== 'user') {
			return fail(400, {
				createError: '角色無效',
				username,
				role
			});
		}

		try {
			await createUser({
				username,
				password,
				role
			});

			return { success: true };
		} catch (err) {
			console.error('創建用戶失敗:', err);
			return fail(500, {
				createError: err instanceof Error ? err.message : '創建用戶失敗',
				username,
				role
			});
		}
	},

	deleteUser: async ({ request, locals }) => {
		const formData = await request.formData();
		const userId = formData.get('userId') as string;

		if (!userId) {
			return fail(400, {
				deleteError: '未提供用戶ID'
			});
		}

		// 不能刪除自己
		if (userId === locals.user?.id) {
			return fail(400, {
				deleteError: '不能刪除當前登入的用戶'
			});
		}

		try {
			await deleteUser(userId);
			return { deleteSuccess: true };
		} catch (err) {
			console.error('刪除用戶失敗:', err);
			return fail(500, {
				deleteError: '刪除用戶失敗'
			});
		}
	}
};
