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
/*
|--------------------------------------------------------------------------
| Render Members View & UI
|--------------------------------------------------------------------------
*/

async function renderMembersPage() {
    const container = document.getElementById('admin-content');
    if (!container) return;

    container.innerHTML = `
        <div class="members-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2>Member Management</h2>
            <button onclick="openAddMemberModal()" class="btn-primary" style="padding: 10px 16px; cursor: pointer;">+ Register Member</button>
        </div>

        <!-- Search & Filter Controls -->
        <div class="controls-bar" style="display: flex; gap: 15px; margin-bottom: 20px;">
            <input type="text" id="memberSearch" placeholder="Search members..." onkeyup="handleSearchFilter()" style="padding: 8px 12px; flex: 1;">
            <select id="statusFilter" onchange="handleSearchFilter()" style="padding: 8px 12px;">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
            </select>
        </div>

        <!-- Members Table -->
        <div class="table-responsive">
            <table class="members-table" style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="text-align: left; border-bottom: 2px solid #ddd;">
                        <th style="padding: 10px;">Member</th>
                        <th style="padding: 10px;">Member ID</th>
                        <th style="padding: 10px;">Branch</th>
                        <th style="padding: 10px;">Joined</th>
                        <th style="padding: 10px;">Borrowed</th>
                        <th style="padding: 10px;">Status</th>
                        <th style="padding: 10px;">Actions</th>
                    </tr>
                </thead>
                <tbody id="membersTableBody">
                    <tr>
                        <td colspan="7" style="padding: 15px; text-align: center;">Loading members...</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modals Container -->
        <div id="memberModalContainer"></div>
    `;

    // Table එකට data load කිරීම
    loadMembersTable();
}

async function loadMembersTable() {
    const searchInput = document.getElementById('memberSearch');
    const statusSelect = document.getElementById('statusFilter');
    const tbody = document.getElementById('membersTableBody');

    if (!tbody) return;

    const search = searchInput ? searchInput.value : '';
    const status = statusSelect ? statusSelect.value : '';

    try {
        const res = await getMembers(search, status);
        const members = res.members || [];

        if (members.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="padding: 15px; text-align: center;">No members found.</td></tr>`;
            return;
        }

        tbody.innerHTML = members.map(m => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px;">
                    <strong>${m.full_name}</strong><br>
                    <small style="color: #666;">${m.email}</small>
                </td>
                <td style="padding: 10px;">${m.member_id}</td>
                <td style="padding: 10px;">${m.branch}</td>
                <td style="padding: 10px;">${m.joined_date || '-'}</td>
                <td style="padding: 10px;">${m.borrowed_count || 0}</td>
                <td style="padding: 10px;">
                    <span class="badge ${m.status}" style="padding: 4px 8px; border-radius: 4px; font-size: 12px; background: ${m.status === 'active' ? '#e6fffa' : '#ffe6e6'}; color: ${m.status === 'active' ? '#007a5a' : '#c53030'};">
                        ${m.status}
                    </span>
                </td>
                <td style="padding: 10px;">
                    <button onclick="openEditMemberModal(${m.id})" style="margin-right: 5px; cursor: pointer;">Edit</button>
                    ${m.status === 'active' 
                        ? `<button onclick="handleSuspend(${m.id})" style="cursor: pointer;">Suspend</button>`
                        : `<button onclick="handleRestore(${m.id})" style="cursor: pointer;">Restore</button>`
                    }
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" style="padding: 15px; text-align: center; color: red;">Error: ${err.message}</td></tr>`;
    }
}

// Search/Filter change වෙනවිට run වෙන function එක
function handleSearchFilter() {
    loadMembersTable();
}
/*
|--------------------------------------------------------------------------
| Modals & Action Handlers (Add, Edit, Suspend, Restore)
|--------------------------------------------------------------------------
*/

// 1. Add Member Modal Open කිරීම
function openAddMemberModal() {
    const container = document.getElementById('memberModalContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
            <div class="modal-content" style="background: #fff; padding: 25px; border-radius: 8px; width: 400px; max-width: 90%;">
                <h3 style="margin-top: 0;">Add New Member</h3>
                <form id="addMemberForm" style="display: flex; flex-direction: column; gap: 12px;">
                    <div>
                        <label style="font-size: 12px; font-weight: bold;">Full Name *</label>
                        <input type="text" id="add_full_name" required style="width: 100%; padding: 8px; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="font-size: 12px; font-weight: bold;">Email *</label>
                        <input type="email" id="add_email" required style="width: 100%; padding: 8px; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="font-size: 12px; font-weight: bold;">Password (Min 8 characters) *</label>
                        <input type="password" id="add_password" required minlength="8" style="width: 100%; padding: 8px; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="font-size: 12px; font-weight: bold;">Branch *</label>
                        <input type="text" id="add_branch" required style="width: 100%; padding: 8px; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="font-size: 12px; font-weight: bold;">NIC</label>
                        <input type="text" id="add_nic" style="width: 100%; padding: 8px; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="font-size: 12px; font-weight: bold;">Phone</label>
                        <input type="text" id="add_phone" style="width: 100%; padding: 8px; box-sizing: border-box;">
                    </div>

                    <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 15px;">
                        <button type="button" onclick="closeMemberModal()" style="padding: 8px 16px; cursor: pointer;">Cancel</button>
                        <button type="submit" class="btn-primary" style="padding: 8px 16px; cursor: pointer;">Create Member</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('addMemberForm').onsubmit = async (e) => {
        e.preventDefault();
        try {
            await addMember({
                full_name: document.getElementById('add_full_name').value.trim(),
                email: document.getElementById('add_email').value.trim(),
                password: document.getElementById('add_password').value,
                branch: document.getElementById('add_branch').value.trim(),
                nic: document.getElementById('add_nic').value.trim(),
                phone: document.getElementById('add_phone').value.trim()
            });

            alert('Member created successfully.');
            closeMemberModal();
            loadMembersTable();
        } catch (err) {
            alert(err.message);
        }
    };
}


async function openEditMemberModal(memberId) {
    try {
        const res = await getMember(memberId);
        const member = res.member || res.data || res;

        const container = document.getElementById('memberModalContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
                <div class="modal-content" style="background: #fff; padding: 25px; border-radius: 8px; width: 400px; max-width: 90%;">
                    <h3 style="margin-top: 0;">Edit Member (${member.member_id || ''})</h3>
                    <form id="editMemberForm" style="display: flex; flex-direction: column; gap: 12px;">
                        <div>
                            <label style="font-size: 12px; font-weight: bold;">Full Name *</label>
                            <input type="text" id="edit_full_name" value="${member.full_name || ''}" required style="width: 100%; padding: 8px; box-sizing: border-box;">
                        </div>
                        <div>
                            <label style="font-size: 12px; font-weight: bold;">Email *</label>
                            <input type="email" id="edit_email" value="${member.email || ''}" required style="width: 100%; padding: 8px; box-sizing: border-box;">
                        </div>
                        <div>
                            <label style="font-size: 12px; font-weight: bold;">Branch *</label>
                            <input type="text" id="edit_branch" value="${member.branch || ''}" required style="width: 100%; padding: 8px; box-sizing: border-box;">
                        </div>
                        <div>
                            <label style="font-size: 12px; font-weight: bold;">NIC</label>
                            <input type="text" id="edit_nic" value="${member.nic || ''}" style="width: 100%; padding: 8px; box-sizing: border-box;">
                        </div>
                        <div>
                            <label style="font-size: 12px; font-weight: bold;">Phone</label>
                            <input type="text" id="edit_phone" value="${member.phone || ''}" style="width: 100%; padding: 8px; box-sizing: border-box;">
                        </div>

                        <div style="font-size: 12px; color: #666; margin-top: 5px;">
                            <p style="margin: 2px 0;"><strong>Joined:</strong> ${member.joined_date || '-'}</p>
                            <p style="margin: 2px 0;"><strong>Borrowed Books:</strong> ${member.borrowed_count || 0}</p>
                            <p style="margin: 2px 0;"><strong>Status:</strong> ${member.status || '-'}</p>
                        </div>

                        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 15px;">
                            <button type="button" onclick="closeMemberModal()" style="padding: 8px 16px; cursor: pointer;">Cancel</button>
                            <button type="submit" class="btn-primary" style="padding: 8px 16px; cursor: pointer;">Update Member</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('editMemberForm').onsubmit = async (e) => {
            e.preventDefault();
            try {
                await updateMember({
                    id: memberId,
                    full_name: document.getElementById('edit_full_name').value.trim(),
                    email: document.getElementById('edit_email').value.trim(),
                    branch: document.getElementById('edit_branch').value.trim(),
                    nic: document.getElementById('edit_nic').value.trim(),
                    phone: document.getElementById('edit_phone').value.trim()
                });

                alert('Member updated successfully.');
                closeMemberModal();
                loadMembersTable();
            } catch (err) {
                alert(err.message);
            }
        };
    } catch (err) {
        alert(err.message);
    }
}

// 3. Suspend Action Handler
async function handleSuspend(memberId) {
    if (confirm('Are you sure you want to suspend this member?')) {
        try {
            await suspendMember(memberId);
            alert('Member suspended successfully.');
            loadMembersTable();
        } catch (err) {
            alert(err.message);
        }
    }
}

// 4. Restore Action Handler
async function handleRestore(memberId) {
    try {
        await restoreMember(memberId);
        alert('Member restored successfully.');
        loadMembersTable();
    } catch (err) {
        alert(err.message);
    }
}


function closeMemberModal() {
    const container = document.getElementById('memberModalContainer');
    if (container) {
        container.innerHTML = '';
    }
}