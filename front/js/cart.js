/**
 * The following program contains the source code for the cart.html page.
 * It displays a recap table of purchases,
 * it deals with any modifications or removals of products,
 * it confirms the order.
 */

// Get DOM elements
const sectionItems = document.getElementById('cart__items');
const totalCartQuantity = document.getElementById('totalQuantity');
const totalCartPrice = document.getElementById('totalPrice');

/**
 * This function creates the HTML text to insert the elements on the cart page.
 * @param {*} product - A single product object from the promise repsonse.
 * @returns - HTML content
 */
function createCartHtml(product) {
    let html = 
    `<article class="cart__item" data-id="${product.productId}" data-color="${product.productColor}">
        <div class="cart__item__img">
            <img src="${product.imageUrl}" alt="${product.altTxt}">
        </div>
        <div class="cart__item__content">
            <div class="cart__item__content__description">
                <h2>${product.productName}</h2>
                <p>${product.productColor}</p>
                <p>€${product.productPrice}</p>
            </div>
            <div class="cart__item__content__settings">
                <div class="cart__item__content__settings__quantity">
                    <p>Qtity: </p>
                    <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${product.productQtity}">
                </div>
                <div class="cart__item__content__settings__delete">
                    <p class="deleteItem">Delete</p>
                </div>
            </div>
        </div>
    </article>`;
    return html;
}

/**
 * Function to calculate the total number of items in the cart and the total price.
 * This function is called in other functions when the cart is updated.
 */
function calculateCartTotalCost() {
    const inputQuantity = document.getElementsByClassName('itemQuantity');
    const inputPrice = document.querySelectorAll('p + p');
    let totalQuantity = 0;
    let totalPrice = 0;
    for (let i=0; i<inputQuantity.length; i++) {
        totalQuantity += Number(inputQuantity[i].value);
        totalPrice += inputQuantity[i].value * Number(inputPrice[i].textContent.substring(1));
    }
    totalCartQuantity.textContent = totalQuantity;
    totalCartPrice.textContent = totalPrice;
}

/**
 * Function to display the cart's contents on the cart page.
 * 
 */
const tempCart = JSON.parse(localStorage.getItem('cart'));

async function mycart() {

    let finalHtml =``;
    for (i in tempCart) { 
        const productId = tempCart[i].id;
        try {
            const productPromise = makeRequest('GET', api + '/' + productId);
            const productResponse = await productPromise;
            let cartProduct = {
                productId: tempCart[i].id,
                imageUrl: productResponse.imageUrl,
                altTxt: productResponse.altTxt,
                productName: productResponse.name,
                productColor: tempCart[i].color,
                productPrice: productResponse.price,
                productQtity: tempCart[i].quantity
            };
            finalHtml += createCartHtml(cartProduct);
        } catch (error) {
            alert(error.error);
        }
    }

    sectionItems.innerHTML = finalHtml;
    calculateCartTotalCost();
    
    // Product quantity event listeners and consequently cart update
    const inputQuantity = document.getElementsByClassName('itemQuantity');
    for (let i=0; i<inputQuantity.length; i++) {
        inputQuantity[i].addEventListener('change', ($event) => {
            const tempCart = JSON.parse(localStorage.getItem('cart'));
            tempCart[i].quantity = Number($event.target.value);
            const cartString = JSON.stringify(tempCart);
            localStorage.setItem('cart', cartString);
            calculateCartTotalCost();
        });
    }

    // Product deletion and consequently cart update
    let deleteProduct = document.querySelectorAll('.deleteItem');

    deleteProduct.forEach((element) => {
        element.addEventListener('click', ($event) => {
            // delete the item from the DOM tree
            let tagg = $event.currentTarget.closest('article');
            let taggId = tagg.dataset.id;
            let taggColor = tagg.dataset.color;
            let removedNode = sectionItems.removeChild(tagg);

            // delete the item from the local storage
            const tempCart = JSON.parse(localStorage.getItem('cart'));
            let filteredCart = tempCart.filter((el) => {
                if (el.Id !== taggId && el.color !== taggColor) {
                    return el;
                }
            });
            const cartString = JSON.stringify(filteredCart);
            localStorage.setItem('cart', cartString);
            
            // update the cart's total price
            calculateCartTotalCost();
        });
    });
}

if (tempCart) {
    mycart();
}

// ---------------------------------------------------------------------------------------------------------------
/**
 * This part of the code controls the form inputs.
 * It adds an event listener to each of them and calls a validation function to check the inputs.
 */
// Get DOM elements related to the form
const formInputs = document.querySelectorAll('.cart__order__form__question > input');
const formErrorMsg = document.querySelectorAll('.cart__order__form__question > p');

function validateEmailInput(email, errorMsg) {
    const pattern = /\S+@\S+\.\S+/g;
    if (!pattern.test(email.value)) {
        errorMsg.style.display = 'inline';
        errorMsg.textContent = 'Please enter your email address in the format: something@something.something'
    } else {
        errorMsg.style.display = 'none';
    }
}

function validateTextInput(input, errorMsg) {
    const string = input.value;
    const characterExemption = /[^a-zA-Z '-]/;
    if (characterExemption.test(string)) {    
        errorMsg.style.display = 'inline';
        errorMsg.textContent = 'Please do not use numbers or special characters.';
    } else {
        errorMsg.style.display = 'none'; 
    }
}

function checkformInput(item, index, arr) {
    item.addEventListener('blur', () => {
        switch(arr[index].name){
            case 'email': validateEmailInput(item, formErrorMsg[index]); break;
            case 'firstName': case 'lastName': case 'city': validateTextInput(item, formErrorMsg[index]); break;
        }
    });
}

formInputs.forEach(checkformInput);

//SUBMIT THE ORDER
const orderButton = document.getElementById('order');

async function submitOrder(dataPost) {
    try {
        const postPromise = makeRequest('POST', api + '/order', dataPost);
        const postResponse = await postPromise;
        const orderId = postResponse.orderId;
        window.location.href = "./confirmation.html?id=" + orderId;
        localStorage.clear('cart');
    } catch (errorResponse) {
        alert(errorResponse.error);
    }
}

orderButton.addEventListener('click', ($event) => {
    $event.preventDefault();
    let flag = false;
    const finalCart = JSON.parse(localStorage.getItem('cart'));
    if (!finalCart) {
        alert("Your cart is empty! You can't pass any order.");
        flag = true;
    } else if (finalCart.length == 0) {
        alert("Your cart is empty! You can't pass any order.");
        flag = true;
    }

    // Check first that all form inputs are filled.
    formInputs.forEach((element) =>{
        let inputErrorMsg = element.nextElementSibling;
        if (!element.value) {
            inputErrorMsg.style.display = 'inline';
            inputErrorMsg.textContent = 'This field is required.';
            flag = true;
        } else if (inputErrorMsg.style.display == 'inline') {
            flag = true;
        }
    })

    // Finally create and submit the POST request
    if (flag == false) {
        // Create the contact object for the POST request
        const contact = {
            firstName: formInputs[0].value,
            lastName: formInputs[1].value,
            address: formInputs[2].value,
            city: formInputs[3].value,
            email: formInputs[4].value,
        };
        
        // Create the product table for the POST request
        const products = [];
        finalCart.forEach((item) => products.push(item.id));
        
        // Create the final data sent with the POST request
        const dataPost = {contact: contact, products: products};
        submitOrder(dataPost);
    }
});
 

