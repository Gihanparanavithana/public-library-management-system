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
    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to load members.');
    }

    return data;
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

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to fetch member details.');
    }

    return data;
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

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to add member.');
    }

    return data;
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

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update member.');
    }

    return data;
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

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to suspend member.');
    }

    return data;
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

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to restore member.');
    }

    return data;
}