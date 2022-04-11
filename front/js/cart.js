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

function createCartHtml(productId, imageUrl, altTxt, productName, productColor, productPrice, productQtity) {
    let html = 
    `<article class="cart__item" data-id="${productId}" data-color="${productColor}">
        <div class="cart__item__img">
            <img src="${imageUrl}" alt="${altTxt}">
        </div>
        <div class="cart__item__content">
            <div class="cart__item__content__description">
                <h2>${productName}</h2>
                <p>${productColor}</p>
                <p>€${productPrice}</p>
            </div>
            <div class="cart__item__content__settings">
                <div class="cart__item__content__settings__quantity">
                    <p>Qtity: </p>
                    <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${productQtity}">
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
function totalCart2() {
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
            finalHtml += createCartHtml(tempCart[i].id, productResponse.imageUrl, productResponse.altTxt, productResponse.name, tempCart[i].color, productResponse.price, tempCart[i].quantity);
        } catch (error) {
            alert(error.error);
        }
    }
    sectionItems.innerHTML = finalHtml;
    totalCart2();
    
    // Product quantity event listeners and consequently cart update
    const inputQuantity = document.getElementsByClassName('itemQuantity');
    for (let i=0; i<inputQuantity.length; i++) {
        inputQuantity[i].addEventListener('change', ($event) => {
            const tempCart = JSON.parse(localStorage.getItem('cart'));
            tempCart[i].quantity = Number($event.target.value);
            const cartString = JSON.stringify(tempCart);
            localStorage.setItem('cart', cartString);
            totalCart2();
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
            totalCart2();
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
    } catch (errorResponse) {
        alert(errorResponse.error);
    }
}

orderButton.addEventListener('click', ($event) => {
    $event.preventDefault();
    // Check first that all form inputs are filled.
    let flag = false;
    formInputs.forEach((element) =>{
        let inputErrorMsg = element.nextElementSibling;
        if (!element.value) {
            inputErrorMsg.style.display = 'inline';
            inputErrorMsg.textContent = 'This field is required.';
            flag = true;
        } else {
            inputErrorMsg.style.display = 'none'; 
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
        const finalCart = JSON.parse(localStorage.getItem('cart'));
        finalCart.forEach((item) => products.push(item.id));
        
        // Create the final data sent with the POST request
        const dataPost = {contact: contact, products: products};

        submitOrder(dataPost);
        // $event.stopPropagation();
    }
});
 

