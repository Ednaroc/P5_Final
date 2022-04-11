/**
 * The following program contains the source code for the confirmation.html page.
 * It displays the order number.
 */

const orderNumber = document.getElementById('orderId');

function getOrderId() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const orderId = urlParams.get('id');
    return orderId;
}

orderNumber.textContent = getOrderId();