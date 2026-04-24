type WsUser = {
	moodleUserId: number;
	email: string;
	name: string;
};

export async function core_enrol_get_users_courses(_params: FormData, _user: WsUser) {
	void _params;
	void _user;

	return [];
}
