/*
|--------------------------------------------------------------------------
| Get Members
|--------------------------------------------------------------------------
*/

async function getMembers(search = '', status = '') {

    const params = new URLSearchParams();

    if (search) {
        params.append('search', search);
    }

    if (status) {
        params.append('status', status);
    }

    const queryString = params.toString();

    const url =
        'backend/members/get-members.php' +
        (queryString ? '?' + queryString : '');

    const response = await fetch(url);

    return await response.json();
}


/*
|--------------------------------------------------------------------------
| Get single member
|--------------------------------------------------------------------------
*/

async function getMember(memberId) {

    const response = await fetch(
        'backend/members/get-member.php?id=' +
        encodeURIComponent(memberId)
    );

    return await response.json();
}


/*
|--------------------------------------------------------------------------
| Add member
|--------------------------------------------------------------------------
*/

async function addMember(memberData) {

    const response = await fetch(
        'backend/members/add-member.php',
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(memberData)
        }
    );

    return await response.json();
}


/*
|--------------------------------------------------------------------------
| Update member
|--------------------------------------------------------------------------
*/

async function updateMember(memberData) {

    const response = await fetch(
        'backend/members/update-member.php',
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(memberData)
        }
    );

    return await response.json();
}


/*
|--------------------------------------------------------------------------
| Suspend member
|--------------------------------------------------------------------------
*/

async function suspendMember(memberId) {

    const response = await fetch(
        'backend/members/suspend-member.php',
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                member_id: memberId
            })
        }
    );

    return await response.json();
}


/*
|--------------------------------------------------------------------------
| Restore member
|--------------------------------------------------------------------------
*/

async function restoreMember(memberId) {

    const response = await fetch(
        'backend/members/restore-member.php',
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                member_id: memberId
            })
        }
    );

    return await response.json();
}
