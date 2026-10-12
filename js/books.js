async function getBooks(query = '', category = '') {

    const params = new URLSearchParams();

    if (query) {
        params.set('q', query);
    }

    if (category) {
        params.set('category', category);
    }

    const response = await fetch(
        `backend/books/get-books.php?${params.toString()}`
    );

    const data = await response.json();

    if (!response.ok) {

        throw new Error(
            data.message || 'Unable to load books.'
        );
    }

    return data;
}

//ADD BOOK FUNCTION

async function createBook(book) {

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

    if (!response.ok) {

        throw new Error(
            data.message || 'Unable to add book.'
        );
    }

    return data;
}


//UPDATE BOOK FUNCTION

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

    if (!response.ok) {

        throw new Error(
            data.message || 'Unable to update book.'
        );
    }

    return data;
}


//DELETE BOOK FUNCTION

async function deleteBook(bookId) {

    const response = await fetch(
        'backend/books/delete-book.php',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: bookId
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {

        throw new Error(
            data.message || 'Unable to delete book.'
        );
    }

    return data;
}



/*Database
   ↓
get-books.php
   ↓
books.js
   ↓
Admin Books table*/



async function getBooks(query = '', category = '') {
    const params = new URLSearchParams();

    if (query) params.append('q', query);
    if (category) params.append('category', category);

    const response = await fetch(
        `backend/books/get-books.php?${params.toString()}`
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load books');
    }

    return data.books;
}