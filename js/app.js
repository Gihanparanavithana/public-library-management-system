const app = document.getElementById('app');
const state = {
    user: null,
    query: '',
    page: location.hash.replace('#', '') || 'login'
};

const branches = [
    'Colombo Central',
    'Kandy Branch',
    'Galle Branch',
    'Jaffna Branch',
    'Matara Branch',
    'Kurunegala Branch',
    'Anuradhapura Branch',
    'Badulla Branch'
];

const categories = [
    'Fiction',
    'Science',
    'Classic Literature',
    'History',
    'Psychology',
    'Memoir',
    'Biography',
    'Self-Help',
    'Technology'
];

/* 
   THEME
 */

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';

    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    render();
}

function getThemeBtnHtml() {
    const isDark = document.documentElement.classList.contains('dark');

    return `
        <button class="theme-toggle-btn" onclick="toggleTheme()">
            ${isDark ? '☀️ Light' : '🌙 Dark'}
        </button>
    `;
}

initTheme();

/* 
   HELPERS
 */

function esc(v = '') {
    return String(v).replace(
        /[&<>'"]/g,
        c => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[c])
    );
}

function go(page) {
    state.page = page;
    location.hash = page;
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    render();
}

function initials(name = 'User') {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(x => x[0])
        .join('')
        .toUpperCase() || 'U';
}

function badge(text, cls = text.toLowerCase()) {
    return `<span class="badge ${cls}">${esc(text)}</span>`;
}

function empty(message) {
    return `
        <div class="empty-state">
            <strong>${esc(message)}</strong>
            <div class="muted" style="margin-top:7px">
                Data will appear here after it is added through the system.
            </div>
        </div>
    `;
}

/* 
   PUBLIC NAVIGATION
 */

function publicNav() {

    return `
        <header class="topnav">
            <div
                class="container"
                style="display:flex;align-items:center;width:100%"
            >

                <button
                    class="brand"
                    style="border:0;background:none"
                    onclick="go('home')"
                >
                    <span class="brand-mark">▣</span>

                    <span>
                        Lanka Library
                        <small class="brand-sub">
                            PUBLIC BRANCH NETWORK
                        </small>
                    </span>
                </button>

                <nav class="navlinks">

                    <button
                        class="navlink ${state.page === 'home' ? 'active' : ''}"
                        onclick="go('home')"
                    >
                        Home
                    </button>

                    <button
                        class="navlink ${state.page === 'catalogue' ? 'active' : ''}"
                        onclick="go('catalogue')"
                    >
                        Book Catalogue
                    </button>

                    <button
                        class="navlink ${state.page === 'member' ? 'active' : ''}"
                        onclick="go('member')"
                    >
                        My Account
                    </button>

                </nav>

                <div class="topnav-actions">

                    ${getThemeBtnHtml()}

                    <button
                        class="btn btn-ghost"
                        onclick="go('catalogue')"
                    >
                        ⌕
                    </button>

                    ${
                        state.user
                        ?
                        `
                        <button
                            class="btn btn-ghost"
                            onclick="go('member')"
                        >
                            <span class="avatar">
                                ${initials(state.user.full_name)}
                            </span>

                            ${esc(state.user.full_name)}
                        </button>

                        <button
                            class="btn btn-outline"
                            onclick="logout()"
                        >
                            Logout
                        </button>
                        `
                        :
                        `
                        <button
                            class="btn btn-primary"
                            onclick="go('login')"
                        >
                            Sign In
                        </button>
                        `
                    }

                </div>

            </div>
        </header>
    `;
}

/* 
   AUTH
 */

function authShell(mode = 'login') {

    const reg = mode === 'register';

    return `
        <div class="auth">

            <section class="auth-brand">

                <div class="brand">
                    <span
                        class="brand-mark"
                        style="background:var(--gold);color:var(--navy)"
                    >
                        ▣
                    </span>

                    <span>
                        Lanka Library Network

                        <small
                            class="brand-sub"
                            style="display:block;color:rgba(255,255,255,.35)"
                        >
                            PUBLIC BRANCH NETWORK · SRI LANKA
                        </small>
                    </span>
                </div>

                <div class="auth-copy">

                    <div class="eyebrow">
                        ${reg ? 'Member Registration' : 'Member Portal'}
                    </div>

                    <h1>
                        ${
                            reg
                            ? 'Create your member account'
                            : 'Knowledge without boundaries.'
                        }
                    </h1>

                    <p>
                        ${
                            reg
                            ?
                            'Register to reserve books, manage borrowing activity and access participating public library branches.'
                            :
                            'Sign in to manage reservations, view borrowing history and browse the library catalogue.'
                        }
                    </p>

                    <div class="feature">
                        <span class="check">✓</span>
                        Centralised member account
                    </div>

                    <div class="feature">
                        <span class="check">✓</span>
                        Book reservation management
                    </div>

                    <div class="feature">
                        <span class="check">✓</span>
                        Branch-aware catalogue
                    </div>

                    <div class="feature">
                        <span class="check">✓</span>
                        Borrowing history and notices
                    </div>

                </div>

                <div class="testimonial">
                    Your library account keeps reservations, borrowing records and branch services in one place.
                </div>

            </section>

            <section class="auth-form-wrap">

                <div class="auth-form">

                    <div
                        style="display:flex;justify-content:space-between;align-items:center"
                    >
                        <div class="eyebrow">
                            ${reg ? 'Step 1 of 1' : 'Member Sign In'}
                        </div>

                        ${getThemeBtnHtml()}
                    </div>

                    <h2>
                        ${reg ? 'Create account' : 'Welcome back'}
                    </h2>

                    ${reg ? registerForm() : loginForm()}

                    <div class="auth-switch">
                        ${
                            reg
                            ? 'Already have an account?'
                            : 'No account yet?'
                        }

                        <button
                            onclick="go('${reg ? 'login' : 'register'}')"
                        >
                            ${reg ? 'Sign in' : 'Register free'}
                        </button>
                    </div>

                    <div class="staff-entry">
                        <button onclick="go('admin-login')">
                            ⚙ Staff / Librarian Login
                        </button>
                    </div>

                </div>

            </section>

        </div>
    `;
}

function loginForm() {

    return `
        <form onsubmit="login(event)">

            <div class="form-group">

                <label class="label">
                    Email Address
                </label>

                <input
                    id="login-email"
                    class="field"
                    type="email"
                    required
                    placeholder="your@email.com"
                >

            </div>

            <div class="form-group">

                <label class="label">
                    Password
                </label>

                <div class="password-wrap">

                    <input
                        id="login-password"
                        class="field"
                        type="password"
                        required
                        placeholder="Password"
                    >

                    <button
                        type="button"
                        class="toggle"
                        onclick="togglePassword('login-password')"
                    >
                        Show
                    </button>

                </div>

            </div>

            <div id="login-error" class="error"></div>

            <button
                class="btn btn-primary"
                style="width:100%;padding:14px"
            >
                Sign In to Account
            </button>

        </form>
    `;
}

function registerForm() {

    return `
        <form onsubmit="register(event)">

            <div class="form-group">
                <label class="label">Full Name</label>

                <input
                    id="reg-name"
                    class="field"
                    required
                    placeholder="Full name"
                >
            </div>

            <div class="form-group">
                <label class="label">Email Address</label>

                <input
                    id="reg-email"
                    class="field"
                    type="email"
                    required
                    placeholder="your@email.com"
                >
            </div>

            <div class="modal-grid">

                <div class="form-group">

                    <label class="label">
                        NIC Number
                    </label>

                    <input
                        id="reg-nic"
                        class="field"
                        placeholder="NIC number"
                    >

                </div>

                <div class="form-group">

                    <label class="label">
                        Phone
                    </label>

                    <input
                        id="reg-phone"
                        class="field"
                        placeholder="Phone number"
                    >

                </div>

            </div>

            <div class="form-group">

                <label class="label">
                    Home Branch
                </label>

                <select
                    id="reg-branch"
                    class="field"
                    required
                >
                    <option value="">
                        Select branch
                    </option>

                    ${branches.map(
                        b => `<option>${esc(b)}</option>`
                    ).join('')}

                </select>

            </div>

            <div class="form-group">

                <label class="label">
                    Password
                </label>

                <input
                    id="reg-password"
                    class="field"
                    type="password"
                    minlength="8"
                    required
                    placeholder="Minimum 8 characters"
                >

            </div>

            <div class="form-group">

                <label class="label">
                    Confirm Password
                </label>

                <input
                    id="reg-confirm"
                    class="field"
                    type="password"
                    minlength="8"
                    required
                    placeholder="Repeat password"
                >

            </div>

            <label
                style="display:flex;gap:8px;font-size:12px;color:var(--muted);margin-bottom:16px"
            >
                <input type="checkbox" required>
                I agree to the Terms of Service and Privacy Policy.
            </label>

            <div id="register-error" class="error"></div>

            <button
                class="btn btn-primary"
                style="width:100%;padding:14px"
            >
                Create Account
            </button>

        </form>
    `;
}

/* 
   HOME
 */

function home() {

    return `
        ${publicNav()}

        <main>

            <section class="hero">

                <div class="container hero-grid">

                    <div>

                        <div class="eyebrow">
                            Sri Lanka Public Library Network
                        </div>

                        <h1>
                            Knowledge Without
                            <span>Boundaries</span>
                        </h1>

                        <p>
                            Search, reserve and borrow books through the public library network.
                            Catalogue information is loaded from the library database.
                        </p>

                        <form
                            class="searchbar"
                            onsubmit="searchHome(event)"
                        >

                            <input
                                id="home-search"
                                placeholder="Title, author, ISBN or category..."
                            >

                            <button>
                                Search
                            </button>

                        </form>

                        <div class="hero-stats">

                            <div class="hero-stat">
                                <strong>—</strong>
                                <span>BOOKS</span>
                            </div>

                            <div class="hero-stat">
                                <strong>8</strong>
                                <span>BRANCHES</span>
                            </div>

                            <div class="hero-stat">
                                <strong>—</strong>
                                <span>MEMBERS</span>
                            </div>

                            <div class="hero-stat">
                                <strong>FREE</strong>
                                <span>ACCESS</span>
                            </div>

                        </div>

                    </div>

                    <div class="hero-book">

                        <div style="text-align:center">

                            <div style="font-size:40px">
                                ▣
                            </div>

                            <div>
                                Catalogue cover images are loaded from the database.
                            </div>

                        </div>

                    </div>

                </div>

            </section>

            <section class="section">

                <div class="container">

                    <div class="section-head">

                        <div>

                            <div class="eyebrow">
                                Explore
                            </div>

                            <h2>
                                Browse by Category
                            </h2>

                        </div>

                        <button
                            class="btn btn-outline"
                            onclick="go('catalogue')"
                        >
                            All categories →
                        </button>

                    </div>

                    <div class="categories">

                        ${categories.map(
                            c =>
                            `
                            <button
                                class="category"
                                onclick="catalogueByCategory('${esc(c)}')"
                            >
                                ▣<br>
                                <strong>${esc(c)}</strong>
                            </button>
                            `
                        ).join('')}

                    </div>

                </div>

            </section>

            <section
                class="section"
                style="padding-top:0"
            >

                <div class="container">

                    <div class="section-head">

                        <div>

                            <div class="eyebrow">
                                Recently Added
                            </div>

                            <h2>
                                New Arrivals
                            </h2>

                        </div>

                        <button
                            class="btn btn-outline"
                            onclick="go('catalogue')"
                        >
                            Browse All →
                        </button>

                    </div>

                    ${empty('No books have been added yet.')}

                </div>

            </section>

            <section class="section dark-section">

                <div class="container">

                    <div class="section-head">

                        <div>

                            <div class="eyebrow">
                                Locations
                            </div>

                            <h2 style="color:#fff">
                                8 Branches Across Sri Lanka
                            </h2>

                        </div>

                    </div>

                    <div class="branch-grid">

                        ${branches.map(
                                                      b =>
                            `
                            <div class="branch">
                                ⌖ ${esc(b)}
                            </div>
                            `
                        ).join('')}

                    </div>

                </div>

            </section>

        </main>

        <footer class="footer">

            <div class="container">
                Lanka Library Network · Public Branch Network ·
                Connect the catalogue, reservations and member services through the central system.
            </div>

        </footer>
    `;
}

/* 
   PUBLIC CATALOGUE
 */

function catalogue() {

    return `
        ${publicNav()}

        <main class="section">

            <div class="container">

                <div class="section-head">
                    <div>
                        <div class="eyebrow">
                            Explore
                        </div>

                        <h1
                            style="font:700 34px Lora,serif;color:var(--text);margin:5px 0"
                        >
                            Book Catalogue
                        </h1>

                        <p class="muted">
                            Search the live library catalogue.
                        </p>
                    </div>
                </div>

                <div
                    class="card"
                    style="padding:16px;margin-bottom:18px"
                >
                    <form
                        class="searchbar"
                        style="max-width:none;margin:0;background:var(--paper)"
                        onsubmit="searchCatalogue(event)"
                    >
                        <input
                            id="catalogue-search"
                            value="${esc(state.query)}"
                            placeholder="Search title, author, ISBN..."
                        >

                        <button>
                            Search
                        </button>
                    </form>
                </div>

                <div id="public-catalogue-list">
                    <div class="panel">
                        Loading books...
                    </div>
                </div>

            </div>

        </main>
    `;
}


/*
   LOAD PUBLIC CATALOGUE
 */

async function loadPublicCatalogue() {

    const container = document.getElementById(
        'public-catalogue-list'
    );

    if (!container) {
        return;
    }

    try {

        const books = await getBooks(state.query || '');

        if (!books.length) {

            container.innerHTML = `
                <div class="panel">
                    ${empty(
                        'No books are currently available in the catalogue.'
                    )}
                </div>
            `;

            return;
        }

        container.innerHTML = `
            <div class="categories">
                ${books.map(book => {

                    const available =
                        Number(book.available_copies) || 0;

                    const total =
                        Number(book.total_copies) || 0;

                    return `
                        <div class="panel">

                            <h3>
                                ${esc(book.title)}
                            </h3>

                            <p class="muted">
                                ${esc(book.author || 'Unknown author')}
                            </p>

                            <div style="margin-top:12px;font-size:13px;line-height:1.8">

                                <div>
                                    <strong>ISBN:</strong>
                                    ${esc(book.isbn || '-')}
                                </div>

                                <div>
                                    <strong>Category:</strong>
                                    ${esc(book.category || '-')}
                                </div>

                                <div>
                                    <strong>Copies:</strong>
                                    ${available} / ${total}
                                </div>

                                <div style="margin-top:8px">
                                    ${
                                        available > 0
                                            ? badge('Available', 'available')
                                            : badge('Unavailable', 'unavailable')
                                    }
                                </div>

                            </div>

                        </div>
                    `;

                }).join('')}
            </div>
        `;

    } catch (error) {

        console.error(
            'Public catalogue error:',
            error
        );

        container.innerHTML = `
            <div class="panel">
                Failed to load catalogue.
                <br>
                <small>${esc(error.message)}</small>
            </div>
        `;
    }
}

/* 
   MEMBER
 */

function member() {

    if (!state.user) {
        return authShell('login');
    }

    return `
        ${publicNav()}

        <section class="dashboard-hero">

            <div class="container">

                <div class="dashboard-header">

                    <div class="dashboard-title">

                        <span class="avatar">
                            ${initials(state.user.full_name)}
                        </span>

                        <div>

                            <div class="eyebrow">
                                Member Dashboard
                            </div>

                            <h1>
                                ${esc(state.user.full_name)}
                            </h1>

                            <p>
                                ${esc(state.user.email)}
                                · Member account
                            </p>

                        </div>

                    </div>

                    <button
                        class="btn btn-gold"
                        onclick="go('catalogue')"
                    >
                        ⌕ Browse Catalogue
                    </button>

                </div>

            </div>

        </section>

        <main class="section">

            <div class="container">

                <div class="stats">

                    <div class="stat">
                        <strong>0</strong>
                        <span>Total Borrowed</span>
                    </div>

                    <div class="stat">
                        <strong>0</strong>
                        <span>Active Reservations</span>
                    </div>

                    <div class="stat">
                        <strong>0</strong>
                        <span>Overdue Books</span>
                    </div>

                    <div class="stat">
                        <strong>0</strong>
                        <span>Books This Month</span>
                    </div>

                </div>

                <div class="main-grid">

                    <section>

                        <div class="panel">

                            <h3>
                                Active Reservations
                            </h3>

                            ${empty('No active reservations.')}

                        </div>

                        <div
                            class="panel"
                            style="margin-top:20px"
                        >

                            <h3>
                                Reading Activity
                            </h3>

                            ${empty('No borrowing activity yet.')}

                        </div>

                    </section>

                    <aside>

                        <div class="panel">

                            <h3>
                                Favourite Genres
                            </h3>

                            ${categories.slice(0, 4).map(
                                c =>
                                `
                                <div style="margin:14px 0">

                                    <div
                                        style="display:flex;justify-content:space-between;font-size:12px"
                                    >
                                        <span>${esc(c)}</span>
                                        <span>0%</span>
                                    </div>

                                    <div
                                        class="progress"
                                        style="margin-top:6px"
                                    >
                                        <i style="width:0"></i>
                                    </div>

                                </div>
                                `
                            ).join('')}

                        </div>

                        <div
                            class="panel"
                            style="margin-top:20px"
                        >

                            <h3>
                                Quick Actions
                            </h3>

                            <div class="quick-list">

                                <button onclick="go('catalogue')">
                                    ▣ Browse Catalogue →
                                </button>

                                <button>
                                    🔖 View Reservations →
                                </button>

                                <button>
                                    ◷ Borrowing History →
                                </button>

                                <button>
                                    ♙ Edit Profile →
                                </button>

                            </div>

                        </div>

                    </aside>

                </div>

            </div>

        </main>
    `;
}

/*
   ADMIN LOGIN
 */

function adminLogin() {

    return `
        <div class="auth">

            <section class="auth-brand">

                <div class="brand">

                    <span
                        class="brand-mark"
                        style="background:var(--gold);color:var(--navy)"
                    >
                        ▣
                    </span>

                    <span>

                        Lanka Library Network

                        <small
                            class="brand-sub"
                            style="display:block;color:rgba(255,255,255,.35)"
                        >
                            LIBRARIAN PANEL
                        </small>

                    </span>

                </div>

                <div class="auth-copy">

                    <div class="eyebrow">
                        Staff Access
                    </div>

                    <h1>
                        Librarian control panel.
                    </h1>

                    <p>
                        Manage catalogue records, members, reservations and library operations from the administrative interface.
                    </p>

                </div>

                <div class="testimonial">
                    Staff authentication is separated from the member portal.
                </div>

            </section>

            <section class="auth-form-wrap">

                <div class="auth-form">

                    <div
                        style="display:flex;justify-content:space-between;align-items:center"
                    >

                        <div class="eyebrow">
                            Staff Login
                        </div>

                        ${getThemeBtnHtml()}

                    </div>

                    <h2>
                        Welcome, Librarian
                    </h2>

                    <form onsubmit="adminLoginSubmit(event)">

                        <div class="form-group">

                            <label class="label">
                                Email Address
                            </label>

                            <input
                                id="admin-email"
                                class="field"
                                type="email"
                                required
                                placeholder="staff@email.com"
                            >

                        </div>

                        <div class="form-group">

                            <label class="label">
                                Password
                            </label>

                            <input
                                id="admin-password"
                                class="field"
                                type="password"
                                required
                                placeholder="Password"
                            >

                        </div>

                        <div
                            id="admin-error"
                            class="error"
                        ></div>

                        <button
                            class="btn btn-primary"
                            style="width:100%;padding:14px"
                        >
                            Sign In
                        </button>

                    </form>

                    <div class="auth-switch">

                        <button onclick="go('login')">
                            ← Back to member login
                        </button>

                    </div>

                </div>

            </section>

        </div>
    `;
}

/* 
   ADMIN SHELL
 */

function admin() {

    return `
        <div class="admin-shell">

            <header class="admin-top">

                <button
                    class="brand"
                    style="border:0;background:none;color:#fff"
                    onclick="go('admin')"
                >

                    <span
                        class="brand-mark"
                        style="background:var(--gold);color:var(--navy)"
                    >
                        ▣
                    </span>

                    <span>

                        Lanka Library

                        <small
                            class="brand-sub"
                            style="display:block;color:rgba(255,255,255,.35)"
                        >
                            LIBRARIAN PANEL
                        </small>

                    </span>

                </button>

                <nav class="admin-top navlinks">

                    <button
                        class="navlink"
                        style="color:#fff"
                        onclick="adminSection('overview')"
                    >
                        Overview
                    </button>

                    <button
                        class="navlink"
                        style="color:#fff"
                        onclick="adminSection('reservations')"
                    >
                        Reservations
                    </button>

                    <button
                        class="navlink"
                        style="color:#fff"
                        onclick="adminSection('books')"
                    >
                        Books
                    </button>

                    <button
                        class="navlink"
                        style="color:#fff"
                        onclick="adminSection('members')"
                    >
                        Members
                    </button>

                </nav>

                <div
                    style="margin-left:auto;display:flex;gap:10px;align-items:center"
                >

                    ${getThemeBtnHtml()}

                    <span
                        style="font-size:12px;align-self:center"
                    >
                        Librarian
                    </span>

                    <button
                        class="btn btn-outline"
                        style="color:#fff;border-color:#fff"
                        onclick="logout()"
                    >
                        Logout
                    </button>

                </div>

            </header>

            <div class="admin-body">

                <aside class="sidebar">

                    <div class="side-profile">

                        <strong>
                            Library Staff
                        </strong>

                        <br>

                        <span class="muted">
                            Authenticated staff
                        </span>

                    </div>

                    <button
                        class="side-link"
                        onclick="adminSection('overview')"
                    >
                        ⌂ Overview
                    </button>

                    <button
                        class="side-link"
                        onclick="adminSection('reservations')"
                    >
                        🔖 Reservations
                    </button>

                    <button
                        class="side-link"
                        onclick="adminSection('books')"
                    >
                        ▣ Book Catalogue
                    </button>

                    <button
                        class="side-link"
                        onclick="adminSection('add-book')"
                    >
                        ＋ Add New Book
                    </button>

                    <button
                        class="side-link"
                        onclick="adminSection('members')"
                    >
                        ♙ Members
                    </button>

                    <div style="margin-top:auto">

                        <button
                            class="side-link"
                            onclick="go('login')"
                        >
                            ↩ Back to Site
                        </button>

                    </div>

                </aside>

                <main
                    class="admin-content"
                    id="admin-content"
                ></main>

            </div>

        </div>
    `;
}

/* 
   ADMIN
 */

let adminPage = 'overview';

function adminSection(section) {

    adminPage = section;

    if (state.page !== 'admin') {
        state.page = 'admin';
        location.hash = 'admin';
    }

    render();
}

function adminContent() {

    if (adminPage === 'overview') {

        return `
            <div class="admin-heading">

                <div>

                    <div class="eyebrow">
                        ${new Date().toLocaleDateString(
                            'en-GB',
                            {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                            }
                        )}
                    </div>

                    <h1>
                        Library Overview
                    </h1>

                </div>

            </div>

            <div class="admin-cards">

                <div class="admin-card">
                    <strong>0</strong>
                    <span>Total Books</span>
                </div>

                <div class="admin-card">
                    <strong>0</strong>
                    <span>Active Members</span>
                </div>

                <div class="admin-card">
                    <strong>0</strong>
                    <span>Pending Reservations</span>
                </div>

                <div class="admin-card">
                    <strong>0</strong>
                    <span>Overdue Books</span>
                </div>

            </div>

            <div class="main-grid">

                <section>

                    <div class="panel">

                        <div
                            style="display:flex;justify-content:space-between;align-items:center"
                        >

                            <h3>
                                Recent Reservations
                            </h3>

                            <button
                                class="btn btn-outline"
                                onclick="adminSection('reservations')"
                            >
                                View All
                            </button>

                        </div>

                        ${empty('No reservations yet.')}

                    </div>

                </section>

                <aside>

                    <div class="panel">

                        <h3>
                            Quick Actions
                        </h3>

                        <div class="quick-list">

                            <button
                                onclick="adminSection('add-book')"
                            >
                                ＋ Add New Book →
                            </button>

                            <button
                                onclick="adminSection('books')"
                            >
                                ▣ Manage Books →
                            </button>

                            <button
                                onclick="adminSection('members')"
                            >
                                ♙ Manage Members →
                            </button>

                            <button
                                onclick="adminSection('reservations')"
                            >
                                🔖 Manage Reservations →
                            </button>

                        </div>

                    </div>

                </aside>

            </div>
        `;
    }

    if (adminPage === 'books') {
        return adminBooks();
    }

    if (adminPage === 'add-book') {
        return adminAddBook();
    }

    if (adminPage === 'members') {
        return adminMembers();
    }

    if (adminPage === 'reservations') {
        return adminReservations();
    }

    return '';
}

/* 
   ADMIN BOOKS
 */

function adminBooks() {

    return `
        <div class="admin-heading">

            <div>

                <div class="eyebrow">
                    Catalogue
                </div>

                <h1>
                    Book Catalogue
                </h1>

                <p class="muted">
                    Search, edit and manage books in the library database.
                </p>

            </div>

            <button
                class="btn btn-primary"
                onclick="adminSection('add-book')"
            >
                ＋ Add New Book
            </button>

        </div>

        <div class="panel">

            <div
                style="
                    display:flex;
                    gap:12px;
                    align-items:center;
                    flex-wrap:wrap;
                    margin-bottom:18px;
                "
            >

                <input
                    id="admin-book-search"
                    class="field"
                    style="flex:1;min-width:240px"
                    placeholder="Search books..."
                    oninput="filterAdminBooks()"
                >

                <select
                    id="admin-book-category"
                    class="field"
                    style="width:180px"
                    onchange="filterAdminBooks()"
                >

                    <option value="">
                        All Categories
                    </option>

                    ${categories.map(
                        c =>
                        `<option value="${esc(c)}">${esc(c)}</option>`
                    ).join('')}

                </select>

                <select
                    id="admin-book-status"
                    class="field"
                    style="width:150px"
                    onchange="filterAdminBooks()"
                >

                    <option value="">
                        All Status
                    </option>

                    <option value="available">
                        Available
                    </option>

                    <option value="unavailable">
                        Unavailable
                    </option>

                </select>

            </div>

            <div id="admin-books-list">
                Loading books...
            </div>

        </div>
    `;
}

/* 
   ADMIN ADD BOOK
 */

function adminAddBook() {

    return `
        <div class="admin-heading">

            <div>

                <div class="eyebrow">
                    Catalogue
                </div>

                <h1>
                    Add New Book
                </h1>

                <p class="muted">
                    Add a new book to the central library catalogue.
                </p>

            </div>

            <button
                class="btn btn-outline"
                onclick="adminSection('books')"
            >
                ← Back to Books
            </button>

        </div>

        <div class="panel">

            <form
                id="add-book-form"
                onsubmit="addBook(event)"
            >

                <div class="modal-grid">

                    <div class="form-group">

                        <label class="label">
                            Book Title *
                        </label>

                        <input
                            id="book-title"
                            class="field"
                            required
                            placeholder="Book title"
                        >

                    </div>

                    <div class="form-group">

                        <label class="label">
                            Author *
                        </label>

                        <input
                            id="book-author"
                            class="field"
                            required
                            placeholder="Author name"
                        >

                    </div>

                </div>

                <div class="modal-grid">

                    <div class="form-group">

                        <label class="label">
                            ISBN
                        </label>

                        <input
                            id="book-isbn"
                            class="field"
                            placeholder="ISBN"
                        >

                    </div>

                    <div class="form-group">

                        <label class="label">
                            Publisher
                        </label>

                        <input
                            id="book-publisher"
                            class="field"
                            placeholder="Publisher"
                        >

                    </div>

                </div>

                <div class="modal-grid">

                    <div class="form-group">

                        <label class="label">
                            Category
                        </label>

                        <select
                            id="book-category"
                            class="field"
                        >

                            <option value="">
                                Select category
                            </option>

                            ${categories.map(
                                c =>
                                `<option value="${esc(c)}">${esc(c)}</option>`
                            ).join('')}

                        </select>

                    </div>

                    <div class="form-group">

                        <label class="label">
                            Year Published
                        </label>

                        <input
                            id="book-year"
                            class="field"
                            type="number"
                            min="0"
                            placeholder="2026"
                        >

                    </div>

                </div>

                <div class="modal-grid">

                    <div class="form-group">

                        <label class="label">
                            Pages
                        </label>

                        <input
                            id="book-pages"
                            class="field"
                            type="number"
                            min="0"
                            placeholder="Number of pages"
                        >

                    </div>

                    <div class="form-group">

                        <label class="label">
                            Total Copies *
                        </label>

                        <input
                            id="book-copies"
                            class="field"
                            type="number"
                            min="1"
                            required
                            placeholder="Number of copies"
                        >

                    </div>

                </div>

                <div class="form-group">

                    <label class="label">
                        Synopsis
                    </label>

                    <textarea
                        id="book-synopsis"
                        class="field"
                        rows="5"
                        placeholder="Short description of the book"
                    ></textarea>

                </div>

                <div id="book-add-error" class="error"></div>

                <div
                    style="
                        display:flex;
                        justify-content:flex-end;
                        gap:10px;
                        margin-top:18px;
                    "
                >

                    <button
                        type="button"
                        class="btn btn-outline"
                        onclick="adminSection('books')"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        class="btn btn-primary"
                    >
                        Add Book
                    </button>

                </div>

            </form>

        </div>
    `;
}

function adminMembers() {

    return `
        <div class="admin-heading">

            <div>

                <div class="eyebrow">
                    Members
                </div>

                <h1>
                    Members
                </h1>

                <p class="muted">
                    View member activity, account status, and borrowing records.
                </p>

            </div>

            <button class="btn btn-primary">
                ＋ Register Member
            </button>

        </div>

        <div class="panel">

            <div
                style="
                    display:flex;
                    gap:12px;
                    align-items:center;
                    flex-wrap:wrap;
                    margin-bottom:18px;
                "
            >

                <input
                    class="field"
                    style="flex:1;min-width:240px"
                    placeholder="Search members..."
                >

            </div>

            <div id="admin-members-list">
                ${empty('No members registered yet.')}
            </div>

        </div>
    `;
}

function adminReservations() {

    return `
        <div class="admin-heading">

            <div>

                <div class="eyebrow">
                    Reservations
                </div>

                <h1>
                    Reservations
                </h1>

                <p class="muted">
                    Review and respond to reservation requests from members.
                </p>

            </div>

            <button class="btn btn-outline">
                ⇩ Export CSV
            </button>

        </div>

        <div class="panel">

            <div
                style="
                    display:flex;
                    gap:10px;
                    align-items:center;
                    flex-wrap:wrap;
                    margin-bottom:18px;
                "
            >

                <button class="btn btn-primary">
                    Pending
                </button>

                <button class="btn btn-outline">
                    Approved
                </button>

                <button class="btn btn-outline">
                    Declined
                </button>

            </div>

            <div id="admin-reservations-list">
                ${empty('No reservations found.')}
            </div>

        </div>
    `;
}

/* 
   LOAD ADMIN BOOKS
 */

async function loadAdminBooks() {

    const tbody = document.getElementById('admin-books-list');

    if (!tbody) {
        return;
    }

    const searchInput = document.getElementById('admin-book-search');
    const categorySelect = document.getElementById('admin-book-category');
    const statusSelect = document.getElementById('admin-book-status');

    const query = searchInput ? searchInput.value.trim() : '';
    const category = categorySelect ? categorySelect.value : '';
    const status = statusSelect ? statusSelect.value : '';

    tbody.innerHTML = `
        <tr>
            <td colspan="6">Loading books...</td>
        </tr>
    `;

    try {

        let books = await getBooks(query, category);

        if (status === 'available') {
            books = books.filter(
                book => Number(book.available_copies) > 0
            );
        } else if (status === 'unavailable') {
            books = books.filter(
                book => Number(book.available_copies) <= 0
            );
        }

        if (!books.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6">No books found.</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = books.map(book => {

            const available = Number(book.available_copies) || 0;
            const total = Number(book.total_copies) || 0;
            const statusText = available > 0 ? 'Available' : 'Unavailable';

            return `
                <tr>
                    <td>
                        <strong>${esc(book.title)}</strong>
                        <br>
                        <small>${esc(book.author || '')}</small>
                    </td>

                    <td>${esc(book.isbn || '-')}</td>

                    <td>${esc(book.category || '-')}</td>

                    <td>${available} / ${total}</td>

                    <td>
                        ${badge(
                            statusText,
                            available > 0 ? 'available' : 'unavailable'
                        )}
                    </td>

                    <td>
                        <button
                            class="btn btn-outline"
                            type="button"
                            onclick="editBook(${Number(book.id)})"
                        >
                            Edit
                        </button>

                        <button
                            class="btn btn-outline"
                            type="button"
                            onclick="deleteBook(${Number(book.id)})"
                        >
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (error) {

        console.error('Book loading error:', error);

        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    Failed to load books.
                    <br>
                    <small>${esc(error.message)}</small>
                </td>
            </tr>
        `;
    }
}

/* 
   RENDER
 */

function render() {

    // Only authenticated admin users can access the admin panel.
    if (
        state.page === 'admin' &&
        (!state.user || state.user.role !== 'admin')
    ) {
        state.page = state.user ? 'member' : 'login';
        location.hash = state.page;
        return;
    }

    if (state.page === 'admin') {

        app.innerHTML = admin();

        document.getElementById(
            'admin-content'
        ).innerHTML = adminContent();

        if (adminPage === 'books') {
            loadAdminBooks();
        }

        return;
    }

    if (state.page === 'login') {
        app.innerHTML = authShell('login');
        return;
    }

    if (state.page === 'register') {
        app.innerHTML = authShell('register');
        return;
    }

    if (state.page === 'admin-login') {
        app.innerHTML = adminLogin();
        return;
    }

    if (state.page === 'home') {
        app.innerHTML = home();
        return;
    }

    if (state.page === 'catalogue') {
        app.innerHTML = catalogue();
        loadPublicCatalogue();
        return;
    }

    if (state.page === 'member') {
        app.innerHTML = member();
        return;
    }

    app.innerHTML = home();
}

/* 
   ADMIN BOOK SEARCH / FILTER EVENTS
 */

document.addEventListener(
    'input',
    function (event) {

        if (
            event.target &&
            event.target.id === 'admin-book-search'
        ) {

            loadAdminBooks();
        }
    }
);

document.addEventListener(
    'change',
    function (event) {

        if (
            event.target &&
            (
                event.target.id === 'admin-book-category' ||
                event.target.id === 'admin-book-status'
            )
        ) {
            loadAdminBooks();
        }
    }
);

/* 
   LOGIN
 */

async function login(e) {

    e.preventDefault();

    const err =
        document.getElementById('login-error');

    err.textContent = '';

    try {

        const r = await fetch(
            'backend/auth/login.php',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email:
                        document.getElementById(
                            'login-email'
                        ).value,

                    password:
                        document.getElementById(
                            'login-password'
                        ).value
                })
            }
        );

        const d = await r.json();

        if (!d.success) {

            err.textContent =
                d.message || 'Login failed.';

            return;
        }

        state.user = d.user;

        sessionStorage.setItem(
            'library_user',
            JSON.stringify(d.user)
        );

        go(
            d.user.role === 'admin'
                ? 'admin'
                : 'home'
        );

    } catch (x) {

        err.textContent =
            'Backend is not connected yet. Start Apache/PHP and check the API path.';
    }
}

/* 
   REGISTER
 */

async function register(e) {

    e.preventDefault();

    const err =
        document.getElementById(
            'register-error'
        );

    err.textContent = '';

    const p =
        document.getElementById(
            'reg-password'
        ).value;

    const confirm =
        document.getElementById(
            'reg-confirm'
        ).value;

    if (p !== confirm) {

        err.textContent =
            'Passwords do not match.';

        return;
    }

    try {

        const r = await fetch(
            'backend/auth/register.php',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({

                    full_name:
                        document.getElementById(
                            'reg-name'
                        ).value,

                    email:
                        document.getElementById(
                            'reg-email'
                        ).value,

                    nic:
                        document.getElementById(
                            'reg-nic'
                        ).value,

                    phone:
                        document.getElementById(
                            'reg-phone'
                        ).value,

                    branch:
                        document.getElementById(
                            'reg-branch'
                        ).value,

                    password: p

                })
            }
        );

        const d = await r.json();

        if (!d.success) {

            err.textContent =
                d.message ||
                'Registration failed.';

            return;
        }

        state.user = d.user;

        sessionStorage.setItem(
            'library_user',
            JSON.stringify(d.user)
        );

        go('home');

    } catch (x) {

        err.textContent =
            'Backend is not connected yet. Start Apache/PHP and check the API path.';
    }
}

/* 
   ADMIN LOGIN
*/

async function adminLoginSubmit(e) {

    e.preventDefault();

    const err =
        document.getElementById(
            'admin-error'
        );

    err.textContent = '';

    try {

        const r = await fetch(
            'backend/auth/login.php',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({

                    email:
                        document.getElementById(
                            'admin-email'
                        ).value,

                    password:
                        document.getElementById(
                            'admin-password'
                        ).value

                })
            }
        );

        const d = await r.json();

        if (
            !d.success ||
            d.user.role !== 'admin'
        ) {

            err.textContent =
                'Invalid staff credentials.';

            return;
        }

        state.user = d.user;

        sessionStorage.setItem(
            'library_user',
            JSON.stringify(d.user)
        );

        go('admin');

    } catch (x) {

        err.textContent =
            'Backend is not connected yet. Start Apache/PHP and check the API path.';
    }
}

/* 
   LOGOUT
 */

async function logout() {

    try {

        await fetch(
            'backend/auth/logout.php',
            {
                method: 'POST'
            }
        );

    } catch (e) {}

    sessionStorage.removeItem(
        'library_user'
    );

    state.user = null;

    go('login');
}

/* 
   OTHER FUNCTIONS
 */

function togglePassword(id) {

    const x =
        document.getElementById(id);

    if (!x) return;

    x.type =
        x.type === 'password'
        ? 'text'
        : 'password';
}

/* 
   RESTORE SERVER SESSION
 */

async function restoreSession() {

    try {

        const response = await fetch(
            'backend/auth/session.php',
            {
                method: 'GET',
                credentials: 'same-origin'
            }
        );

        const data = await response.json();

        if (
            response.ok &&
            data.success &&
            data.authenticated
        ) {

            state.user = data.user;

            sessionStorage.setItem(
                'library_user',
                JSON.stringify(data.user)
            );

            return true;
        }

    } catch (error) {

        console.error(
            'Session restore failed:',
            error
        );
    }

    sessionStorage.removeItem('library_user');

    state.user = null;

    return false;
}

function searchHome(e) {

    e.preventDefault();

    state.query =
        document.getElementById(
            'home-search'
        ).value;

    go('catalogue');
}

function searchCatalogue(e) {

    e.preventDefault();

    state.query =
        document.getElementById(
            'catalogue-search'
        ).value;

    render();
}

function catalogueByCategory(c) {

    state.query = c;

    go('catalogue');
}

/* 
   ADD BOOK
 */

async function addBook(e) {

    e.preventDefault();

    const book = {
        title: document.getElementById('book-title').value.trim(),
        author: document.getElementById('book-author').value.trim(),
        isbn: document.getElementById('book-isbn').value.trim(),
        publisher: document.getElementById('book-publisher').value.trim(),
        category: document.getElementById('book-category').value,
        year_published: document.getElementById('book-year').value,
        pages: document.getElementById('book-pages').value,
        copies: document.getElementById('book-copies').value,
        synopsis: document.getElementById('book-synopsis').value.trim()
    };

    try {

        const response = await fetch(
            'backend/books/add-book.php',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(book)
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || 'Failed to add book.'
            );
        }

        alert('Book added successfully.');

        adminSection('books');

    } catch (error) {

        console.error(
            'Add book error:',
            error
        );

        alert(error.message);
    }
}

/* 
   UPDATE BOOK
 */

async function updateBook(book) {

    const response = await fetch(
        'backend/books/update-book.php',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(book)
        }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(
            data.message || 'Failed to update book.'
        );
    }

    return data;
}

/* 
   EDIT BOOK
 */

async function editBook(bookId) {

    try {

        const books = await getBooks();

        const book = books.find(
            item => Number(item.id) === Number(bookId)
        );

        if (!book) {
            alert('Book not found.');
            return;
        }

        const title = prompt(
            'Book Title:',
            book.title || ''
        );

        if (title === null) {
            return;
        }

        if (!title.trim()) {
            alert('Book title is required.');
            return;
        }

        const author = prompt(
            'Author:',
            book.author || ''
        );

        if (author === null) {
            return;
        }

        if (!author.trim()) {
            alert('Author is required.');
            return;
        }

        const isbn = prompt(
            'ISBN:',
            book.isbn || ''
        );

        if (isbn === null) {
            return;
        }

        const publisher = prompt(
            'Publisher:',
            book.publisher || ''
        );

        if (publisher === null) {
            return;
        }

        const category = prompt(
            'Category:',
            book.category || ''
        );

        if (category === null) {
            return;
        }

        const yearPublished = prompt(
            'Year Published:',
            book.year_published || ''
        );

        if (yearPublished === null) {
            return;
        }

        const pages = prompt(
            'Pages:',
            book.pages || ''
        );

        if (pages === null) {
            return;
        }

        const synopsis = prompt(
            'Synopsis:',
            book.synopsis || ''
        );

        if (synopsis === null) {
            return;
        }

        await updateBook({

            id: Number(book.id),

            title: title.trim(),

            author: author.trim(),

            isbn: isbn.trim(),

            publisher: publisher.trim(),

            category: category.trim(),

            year_published: yearPublished.trim(),

            pages: pages.trim(),

            synopsis: synopsis.trim()
        });

        alert('Book updated successfully.');

        loadAdminBooks();

    } catch (error) {

        console.error(
            'Update book error:',
            error
        );

        alert(error.message);
    }
}

/* 
   DELETE BOOK
 */

async function deleteBook(bookId) {

    const confirmed = confirm(
        'Are you sure you want to delete this book?'
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(
            'backend/books/delete-book.php',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: Number(bookId)
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || 'Failed to delete book.'
            );
        }

        alert('Book deleted successfully.');

        loadAdminBooks();

    } catch (error) {

        console.error(
            'Delete book error:',
            error
        );

        alert(error.message);
    }
}

/* 
   GET BOOKS
 */

async function getBooks(query = '', category = '') {

    const params = new URLSearchParams();

    if (query) {
        params.set('search', query);
    }

    if (category) {
        params.set('category', category);
    }

    const url =
        'backend/books/get-books.php' +
        (params.toString()
            ? '?' + params.toString()
            : '');

    const response = await fetch(url);

    const data = await response.json();

    if (!response.ok) {

        throw new Error(
            data.message || 'Failed to load books.'
        );
    }

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data.books)) {
        return data.books;
    }

    if (
        data.success &&
        Array.isArray(data.data)
    ) {
        return data.data;
    }

    if (
        data.success &&
        Array.isArray(data.books)
    ) {
        return data.books;
    }

    return [];
}

/* 
   HASH NAVIGATION + APPLICATION INITIALIZATION
 */

window.addEventListener(
    'hashchange',
    () => {

        state.page =
            location.hash.replace('#', '') || 'login';

        render();
    }
);

(async function initApplication() {

    const storedUser =
        sessionStorage.getItem('library_user');

    if (storedUser) {

        try {

            state.user =
                JSON.parse(storedUser);

        } catch (error) {

            state.user = null;
        }
    }

    await restoreSession();

    render();

})

();