/*
|--------------------------------------------------------------------------
| MEMBER API
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


/*
|--------------------------------------------------------------------------
| MEMBER HELPERS
|--------------------------------------------------------------------------
*/

function memberStatusClass(status = '') {

    return String(status).toLowerCase() === 'active'
        ? 'success'
        : 'danger';
}


function formatMemberDate(date = '') {

    if (!date) {
        return '-';
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return esc(date);
    }

    return parsed.toLocaleDateString(
        'en-GB',
        {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }
    );
}


function memberErrorMessage(
    response,
    fallback = 'Something went wrong.'
) {

    if (!response) {
        return fallback;
    }

    if (typeof response === 'string') {
        return response;
    }

    return response.message ||
           response.error ||
           fallback;
}


/*
|--------------------------------------------------------------------------
| LOAD MEMBER LIST
|--------------------------------------------------------------------------
*/

async function loadAdminMembers(
    search = '',
    status = ''
) {

    const container =
        document.getElementById(
            'admin-members-list'
        );

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="empty-state">

            <strong>
                Loading members...
            </strong>

            <div
                class="muted"
                style="margin-top:7px"
            >
                Please wait while member records are loaded.
            </div>

        </div>
    `;

    try {

        const response =
            await getMembers(
                search,
                status
            );

        if (
            !response ||
            response.success === false
        ) {

            container.innerHTML =
                empty(
                    memberErrorMessage(
                        response,
                        'Unable to load members.'
                    )
                );

            return;
        }

        const members =
            Array.isArray(response.data)
                ? response.data
                : Array.isArray(response.members)
                    ? response.members
                    : Array.isArray(response)
                        ? response
                        : [];

        renderAdminMembers(members);

    } catch (error) {

        console.error(
            'Load members error:',
            error
        );

        container.innerHTML =
            empty(
                'Unable to connect to the member service.'
            );
    }
}


/*
|--------------------------------------------------------------------------
| RENDER MEMBER TABLE
|--------------------------------------------------------------------------
*/

function renderAdminMembers(
    members = []
) {

    const container =
        document.getElementById(
            'admin-members-list'
        );

    if (!container) {
        return;
    }

    if (!members.length) {

        container.innerHTML =
            empty(
                'No members found.'
            );

        return;
    }

    container.innerHTML = `

        <div class="table-wrap">

            <table class="table">

                <thead>

                    <tr>

                        <th>
                            Member ID
                        </th>

                        <th>
                            Name
                        </th>

                        <th>
                            Email
                        </th>

                        <th>
                            Phone
                        </th>

                        <th>
                            Branch
                        </th>

                        <th>
                            Status
                        </th>

                        <th>
                            Borrowed
                        </th>

                        <th>
                            Actions
                        </th>

                    </tr>

                </thead>

                <tbody>

                    ${members.map(member => `

                        <tr>

                            <td>
                                ${esc(
                                    member.member_id || '-'
                                )}
                            </td>

                            <td>
                                ${esc(
                                    member.full_name || '-'
                                )}
                            </td>

                            <td>
                                ${esc(
                                    member.email || '-'
                                )}
                            </td>

                            <td>
                                ${esc(
                                    member.phone || '-'
                                )}
                            </td>

                            <td>
                                ${esc(
                                    member.branch || '-'
                                )}
                            </td>

                            <td>

                                ${badge(
                                    member.status || 'Unknown',
                                    memberStatusClass(
                                        member.status
                                    )
                                )}

                            </td>

                            <td>
                                ${esc(
                                    member.borrowed_count ?? 0
                                )}
                            </td>

                            <td>

                                <div class="actions">

                                    <button
                                        class="btn btn-ghost"
                                        type="button"
                                        onclick="viewAdminMember('${esc(
                                            member.member_id ||
                                            member.id
                                        )}')"
                                    >
                                        View
                                    </button>

                                    <button
                                        class="btn btn-outline"
                                        type="button"
                                        onclick="editAdminMember('${esc(
                                            member.member_id ||
                                            member.id
                                        )}')"
                                    >
                                        Edit
                                    </button>

                                    ${
                                        String(
                                            member.status
                                        ).toLowerCase() === 'active'

                                        ? `

                                            <button
                                                class="btn btn-danger"
                                                type="button"
                                                onclick="handleSuspendMember('${esc(
                                                    member.member_id ||
                                                    member.id
                                                )}')"
                                            >
                                                Suspend
                                            </button>

                                        `

                                        : `

                                            <button
                                                class="btn btn-primary"
                                                type="button"
                                                onclick="handleRestoreMember('${esc(
                                                    member.member_id ||
                                                    member.id
                                                )}')"
                                            >
                                                Restore
                                            </button>

                                        `
                                    }

                                </div>

                            </td>

                        </tr>

                    `).join('')}

                </tbody>

            </table>

        </div>
    `;
}


/*
|--------------------------------------------------------------------------
| SEARCH / FILTER
|--------------------------------------------------------------------------
*/

function searchAdminMembers() {

    const searchInput =
        document.getElementById(
            'member-search'
        );

    const statusSelect =
        document.getElementById(
            'member-status-filter'
        );

    loadAdminMembers(
        searchInput
            ? searchInput.value.trim()
            : '',

        statusSelect
            ? statusSelect.value
            : ''
    );
}


/*
|--------------------------------------------------------------------------
| MEMBER MODAL
|--------------------------------------------------------------------------
*/

function closeMemberModal() {

    const modal =
        document.getElementById(
            'member-modal'
        );

    if (modal) {
        modal.remove();
    }
}


function memberModal(content) {

    closeMemberModal();

    document.body.insertAdjacentHTML(
        'beforeend',

        `

        <div
            class="modal"
            id="member-modal"
            onclick="if(event.target === this) closeMemberModal()"
        >

            <div class="modal-card">

                ${content}

            </div>

        </div>

        `
    );
}


/*
|--------------------------------------------------------------------------
| ADD MEMBER
|--------------------------------------------------------------------------
*/

function showAddMemberModal() {

    memberModal(`

        <h2>
            Register Member
        </h2>

        <form
            id="add-member-form"
            onsubmit="submitAddMember(event)"
        >

            <div class="modal-grid">

                <div class="form-group">

                    <label class="label">
                        Full Name *
                    </label>

                    <input
                        id="member-full-name"
                        class="field"
                        required
                    >

                </div>


                <div class="form-group">

                    <label class="label">
                        Email *
                    </label>

                    <input
                        id="member-email"
                        class="field"
                        type="email"
                        required
                    >

                </div>


                <div class="form-group">

                    <label class="label">
                        Password *
                    </label>

                    <input
                        id="member-password"
                        class="field"
                        type="password"
                        minlength="6"
                        required
                    >

                </div>


                <div class="form-group">

                    <label class="label">
                        NIC *
                    </label>

                    <input
                        id="member-nic"
                        class="field"
                        required
                    >

                </div>


                <div class="form-group">

                    <label class="label">
                        Phone *
                    </label>

                    <input
                        id="member-phone"
                        class="field"
                        required
                    >

                </div>


                <div class="form-group">

                    <label class="label">
                        Branch *
                    </label>

                    <select
                        id="member-branch"
                        class="field"
                        required
                    >

                        <option value="">
                            Select branch
                        </option>

                        ${branches.map(
                            branch => `

                            <option
                                value="${esc(branch)}"
                            >
                                ${esc(branch)}
                            </option>

                        `
                        ).join('')}

                    </select>

                </div>

            </div>


            <div
                id="member-form-error"
                class="error"
            ></div>


            <div class="modal-actions">

                <button
                    type="button"
                    class="btn btn-outline"
                    onclick="closeMemberModal()"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    class="btn btn-primary"
                >
                    Register Member
                </button>

            </div>

        </form>

    `);
}


async function submitAddMember(event) {

    event.preventDefault();

    const errorBox =
        document.getElementById(
            'member-form-error'
        );

    const memberData = {

        full_name:
            document.getElementById(
                'member-full-name'
            ).value.trim(),

        email:
            document.getElementById(
                'member-email'
            ).value.trim(),

        password:
            document.getElementById(
                'member-password'
            ).value,

        nic:
            document.getElementById(
                'member-nic'
            ).value.trim(),

        phone:
            document.getElementById(
                'member-phone'
            ).value.trim(),

        branch:
            document.getElementById(
                'member-branch'
            ).value
    };

    errorBox.textContent = '';

    try {

        const response =
            await addMember(
                memberData
            );

        if (
            !response ||
            response.success === false
        ) {

            errorBox.textContent =
                memberErrorMessage(
                    response,
                    'Unable to register member.'
                );

            return;
        }

        closeMemberModal();

        await loadAdminMembers();

        alert(
            'Member registered successfully.'
        );

    } catch (error) {

        console.error(
            'Add member error:',
            error
        );

        errorBox.textContent =
            'Unable to connect to the server.';
    }
}


/*
|--------------------------------------------------------------------------
| VIEW MEMBER
|--------------------------------------------------------------------------
*/

async function viewAdminMember(memberId) {

    memberModal(`

        <h2>
            Member Details
        </h2>

        <div
            class="empty-state"
            style="padding:30px 10px"
        >

            <strong>
                Loading...
            </strong>

        </div>

    `);

    try {

        const response =
            await getMember(
                memberId
            );

        if (
            !response ||
            response.success === false
        ) {

            memberModal(`

                <h2>
                    Member Details
                </h2>

                <div class="error">
                    ${esc(
                        memberErrorMessage(
                            response,
                            'Unable to load member details.'
                        )
                    )}
                </div>

                <div class="modal-actions">

                    <button
                        class="btn btn-outline"
                        onclick="closeMemberModal()"
                    >
                        Close
                    </button>

                </div>

            `);

            return;
        }

        const member =
            response.data ||
            response.member ||
            response;

        memberModal(`

            <h2>
                Member Details
            </h2>

            <div class="modal-grid">

                <div>

                    <div class="label">
                        Member ID
                    </div>

                    <div>
                        ${esc(
                            member.member_id || '-'
                        )}
                    </div>

                </div>


                <div>

                    <div class="label">
                        Full Name
                    </div>

                    <div>
                        ${esc(
                            member.full_name || '-'
                        )}
                    </div>

                </div>


                <div>

                    <div class="label">
                        Email
                    </div>

                    <div>
                        ${esc(
                            member.email || '-'
                        )}
                    </div>

                </div>


                <div>

                    <div class="label">
                        NIC
                    </div>

                    <div>
                        ${esc(
                            member.nic || '-'
                        )}
                    </div>

                </div>


                <div>

                    <div class="label">
                        Phone
                    </div>

                    <div>
                        ${esc(
                            member.phone || '-'
                        )}
                    </div>

                </div>


                <div>

                    <div class="label">
                        Branch
                    </div>

                    <div>
                        ${esc(
                            member.branch || '-'
                        )}
                    </div>

                </div>


                <div>

                    <div class="label">
                        Joined Date
                    </div>

                    <div>
                        ${formatMemberDate(
                            member.joined_date
                        )}
                    </div>

                </div>


                <div>

                    <div class="label">
                        Borrowed Books
                    </div>

                    <div>
                        ${esc(
                            member.borrowed_count ?? 0
                        )}
                    </div>

                </div>


                <div>

                    <div class="label">
                        Status
                    </div>

                    <div>

                        ${badge(
                            member.status || 'Unknown',
                            memberStatusClass(
                                member.status
                            )
                        )}

                    </div>

                </div>

            </div>


            <div class="modal-actions">

                <button
                    class="btn btn-outline"
                    onclick="closeMemberModal()"
                >
                    Close
                </button>

                <button
                    class="btn btn-primary"
                    onclick="closeMemberModal(); editAdminMember('${esc(
                        member.member_id ||
                        member.id
                    )}')"
                >
                    Edit Member
                </button>

            </div>

        `);

    } catch (error) {

        console.error(
            'View member error:',
            error
        );

        memberModal(`

            <h2>
                Member Details
            </h2>

            <div class="error">
                Unable to connect to the server.
            </div>

            <div class="modal-actions">

                <button
                    class="btn btn-outline"
                    onclick="closeMemberModal()"
                >
                    Close
                </button>

            </div>

        `);
    }
}


/*
|--------------------------------------------------------------------------
| EDIT MEMBER
|--------------------------------------------------------------------------
*/

async function editAdminMember(memberId) {

    memberModal(`

        <h2>
            Edit Member
        </h2>

        <div
            class="empty-state"
            style="padding:30px 10px"
        >

            <strong>
                Loading...
            </strong>

        </div>

    `);

    try {

        const response =
            await getMember(
                memberId
            );

        if (
            !response ||
            response.success === false
        ) {

            memberModal(`

                <h2>
                    Edit Member
                </h2>

                <div class="error">
                    ${esc(
                        memberErrorMessage(
                            response,
                            'Unable to load member.'
                        )
                    )}
                </div>

                <div class="modal-actions">

                    <button
                        class="btn btn-outline"
                        onclick="closeMemberModal()"
                    >
                        Close
                    </button>

                </div>

            `);

            return;
        }

        const member =
            response.data ||
            response.member ||
            response;

        memberModal(`

            <h2>
                Edit Member
            </h2>

            <form
                id="edit-member-form"
                onsubmit="submitEditMember(
                    event,
                    '${esc(
                        member.member_id ||
                        member.id
                    )}'
                )"
            >

                <div class="modal-grid">

                    <div class="form-group">

                        <label class="label">
                            Full Name *
                        </label>

                        <input
                            id="edit-member-full-name"
                            class="field"
                            value="${esc(
                                member.full_name || ''
                            )}"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label class="label">
                            Email *
                        </label>

                        <input
                            id="edit-member-email"
                            class="field"
                            type="email"
                            value="${esc(
                                member.email || ''
                            )}"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label class="label">
                            NIC *
                        </label>

                        <input
                            id="edit-member-nic"
                            class="field"
                            value="${esc(
                                member.nic || ''
                            )}"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label class="label">
                            Phone *
                        </label>

                        <input
                            id="edit-member-phone"
                            class="field"
                            value="${esc(
                                member.phone || ''
                            )}"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label class="label">
                            Branch *
                        </label>

                        <select
                            id="edit-member-branch"
                            class="field"
                            required
                        >

                            ${branches.map(
                                branch => `

                                <option
                                    value="${esc(branch)}"
                                    ${
                                        member.branch === branch
                                            ? 'selected'
                                            : ''
                                    }
                                >
                                    ${esc(branch)}
                                </option>

                            `
                            ).join('')}

                        </select>

                    </div>


                    <div class="form-group">

                        <label class="label">
                            Status
                        </label>

                        <input
                            class="field"
                            value="${esc(
                                member.status || ''
                            )}"
                            disabled
                        >

                    </div>

                </div>


                <div
                    id="edit-member-error"
                    class="error"
                ></div>


                <div class="modal-actions">

                    <button
                        type="button"
                        class="btn btn-outline"
                        onclick="closeMemberModal()"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        class="btn btn-primary"
                    >
                        Save Changes
                    </button>

                </div>

            </form>

        `);

    } catch (error) {

        console.error(
            'Edit member load error:',
            error
        );

        memberModal(`

            <h2>
                Edit Member
            </h2>

            <div class="error">
                Unable to connect to the server.
            </div>

            <div class="modal-actions">

                <button
                    class="btn btn-outline"
                    onclick="closeMemberModal()"
                >
                    Close
                </button>

            </div>

        `);
    }
}


async function submitEditMember(
    event,
    memberId
) {

    event.preventDefault();

    const errorBox =
        document.getElementById(
            'edit-member-error'
        );

    errorBox.textContent = '';

    const memberData = {

        member_id: memberId,

        full_name:
            document.getElementById(
                'edit-member-full-name'
            ).value.trim(),

        email:
            document.getElementById(
                'edit-member-email'
            ).value.trim(),

        nic:
            document.getElementById(
                'edit-member-nic'
            ).value.trim(),

        phone:
            document.getElementById(
                'edit-member-phone'
            ).value.trim(),

        branch:
            document.getElementById(
                'edit-member-branch'
            ).value
    };

    try {

        const response =
            await updateMember(
                memberData
            );

        if (
            !response ||
            response.success === false
        ) {

            errorBox.textContent =
                memberErrorMessage(
                    response,
                    'Unable to update member.'
                );

            return;
        }

        closeMemberModal();

        await loadAdminMembers();

        alert(
            'Member updated successfully.'
        );

    } catch (error) {

        console.error(
            'Update member error:',
            error
        );

        errorBox.textContent =
            'Unable to connect to the server.';
    }
}


/*
|--------------------------------------------------------------------------
| SUSPEND MEMBER
|--------------------------------------------------------------------------
*/

async function handleSuspendMember(
    memberId
) {

    const confirmed =
        confirm(
            'Are you sure you want to suspend this member?'
        );

    if (!confirmed) {
        return;
    }

    try {

        const response =
            await suspendMember(
                memberId
            );

        if (
            !response ||
            response.success === false
        ) {

            alert(
                memberErrorMessage(
                    response,
                    'Unable to suspend member.'
                )
            );

            return;
        }

        await loadAdminMembers();

        alert(
            'Member suspended successfully.'
        );

    } catch (error) {

        console.error(
            'Suspend member error:',
            error
        );

        alert(
            'Unable to connect to the server.'
        );
    }
}


/*
|--------------------------------------------------------------------------
| RESTORE MEMBER
|--------------------------------------------------------------------------
*/

async function handleRestoreMember(
    memberId
) {

    const confirmed =
        confirm(
            'Are you sure you want to restore this member?'
        );

    if (!confirmed) {
        return;
    }

    try {

        const response =
            await restoreMember(
                memberId
            );

        if (
            !response ||
            response.success === false
        ) {

            alert(
                memberErrorMessage(
                    response,
                    'Unable to restore member.'
                )
            );

            return;
        }

        await loadAdminMembers();

        alert(
            'Member restored successfully.'
        );

    } catch (error) {

        console.error(
            'Restore member error:',
            error
        );

        alert(
            'Unable to connect to the server.'
        );
    }
}