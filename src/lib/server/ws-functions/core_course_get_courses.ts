type WsUser = {
	moodleUserId: number;
	email: string;
	name: string;
};

export async function core_course_get_courses(_params: FormData, _user: WsUser) {
	void _params;
	void _user;

	return [
		{
			id: 1,
			shortname: 'SITE',
			fullname: 'CSET Learning Site',
			displayname: 'CSET Learning Site',
			enrolledusercount: 0,
			idnumber: '',
			visible: 1,
			summary: '',
			summaryformat: 1,
			format: 'site',
			showgrades: 1,
			lang: '',
			enablecompletion: false,
			completionhascriteria: false,
			completionusertracked: false,
			category: 0,
			progress: null,
			completed: false,
			startdate: 0,
			enddate: 0,
			marker: 0,
			lastaccess: 0,
			isfavourite: false,
			hidden: false,
			overviewfiles: [],
			timemodified: 0
		}
	];
}
