

async function createReservation(bookId, reservationDate = null) {

    const response = await fetch(
        'backend/reservations/create-reservation.php',
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                book_id: bookId,
                reservation_date:
                    reservationDate ||
                    new Date().toISOString().split('T')[0]
            })
        }
    );

    return await response.json();
}


/*
|--------------------------------------------------------------------------
| Get reservations
|--------------------------------------------------------------------------
*/

async function getReservations(status = '') {

    let url =
        'backend/reservations/get-reservations.php';

    if (status) {
        url += '?status=' + encodeURIComponent(status);
    }

    const response = await fetch(url);

    return await response.json();
}


/*
|--------------------------------------------------------------------------
| Get single reservation
|--------------------------------------------------------------------------
*/

async function getReservation(reservationId) {

    const response = await fetch(
        'backend/reservations/get-reservation.php?id=' +
        encodeURIComponent(reservationId)
    );

    return await response.json();
}


/*
|--------------------------------------------------------------------------
| Approve reservation
|--------------------------------------------------------------------------
*/

async function approveReservation(reservationId) {

    const response = await fetch(
        'backend/reservations/approve-reservation.php',
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                reservation_id: reservationId
            })
        }
    );

    return await response.json();
}


/*
|--------------------------------------------------------------------------
| Decline reservation
|--------------------------------------------------------------------------
*/

async function declineReservation(reservationId) {

    const response = await fetch(
        'backend/reservations/decline-reservation.php',
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                reservation_id: reservationId
            })
        }
    );

    return await response.json();
}


/*
|--------------------------------------------------------------------------
| Borrow book
|--------------------------------------------------------------------------
*/

async function borrowBook(
    bookId,
    memberId = null,
    reservationId = null
) {

    const response = await fetch(
        'backend/borrowings/borrow.php',
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                book_id: bookId,
                member_id: memberId,
                reservation_id: reservationId
            })
        }
    );

    return await response.json();
}


/*
|--------------------------------------------------------------------------
| Return book
|--------------------------------------------------------------------------
*/

async function returnBook(borrowingId) {

    const response = await fetch(
        'backend/borrowings/return.php',
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                borrowing_id: borrowingId
            })
        }
    );

    return await response.json();
}


/*
|--------------------------------------------------------------------------
| Get active borrowings
|--------------------------------------------------------------------------
*/

async function getBorrowings() {

    const response = await fetch(
        'backend/borrowings/get-borrowings.php'
    );

    return await response.json();
}


/*
|--------------------------------------------------------------------------
| Get borrowing history
|--------------------------------------------------------------------------
*/

async function getBorrowingHistory() {

    const response = await fetch(
        'backend/borrowings/get-history.php'
    );

    return await response.json();
}