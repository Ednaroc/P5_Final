/**
 * The following program contains the source code for the product.html page.
 * First it collects the ID of the product to display and insert its details into the page.
 * The second part of the code focus on updating the shopping cart: adding even listeners to the 'add to cart' button.
 * The cart content is saved in LocalStorage.
 */


// Get DOM elements
const pageTitle = document.querySelector('title');
const productName = document.getElementById('title');
const productPrice = document.getElementById('price');
const productDescription = document.getElementById('description');
const productImageContainer = document.querySelector('.item__img');
const productColors = document.getElementById('colors');
const addButton = document.getElementById('addToCart');

/**
 * This function inserts a product and its details into the product page.
 * @param {*} product - A single product object from the promise repsonse.
 */
function updateProductPage(product) {
    const {name, imageUrl, description, altTxt, price, colors} = product;

    //Update the text content of the product
    pageTitle.textContent = name;
    productName.textContent = name;
    productPrice.textContent = price;
    productDescription.textContent = description;

    //Add the image of the product
    productImageContainer.innerHTML = `<img src="${imageUrl}" alt="${altTxt}">`;

    //Update the dropdown menu of color choices
    let html = `<option value="">--Please, select a color --</option>`;
    colors.forEach((color) => html += `<option value="${color}">${color}</option>`);
    productColors.innerHTML = html;
}

/**
 * This function collects the ID of the product to display using URLSearchParams.
 * The correct "a" tag and "href" property has been set up in the script.js file.
 * @returns the ID of the product to display.
 */
function getProductId() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const productId = urlParams.get('id');
    return productId;
}

/**
 * This function calls 2 functions:
 * 1. makeRequest: to create a GET request to ask for the details of the product with the ID productId.
 * (it then wait to collect the response)
 * 2. updateProductPage: to insert the product details into the page.
 * @param {*} productId 
 */
async function displayOneProduct(productId) {
    try {
        const productPromise = makeRequest('GET', api + '/' + productId);
        const productResponse = await productPromise;
        updateProductPage(productResponse);
    } catch (error) {
        alert(error.error);
    }
    
}

// To display the details of the product that was selected on the homepage.
const productId = getProductId();
displayOneProduct(productId);


/**
 * This part of the code controls the addition of products to the cart.
 * 
 */
addButton.addEventListener('click', ($event) => {
    const productQuantity = Number(document.querySelector('input[type=number]').value);

    // Do not add a product if any of this is true
    if (!productColors.value) {
        alert('Please select a product color!');
    } else if (productQuantity === 0) {
        alert('Please enter the number of items!');
    } else if (productQuantity > 100) {
        alert('Number of items can not exceed 100.');
    } else {
        // run the adding function
        addingProductToCart();
    }

    function addingProductToCart() {
        // initialization
        let flag = false;
        let cart = [];

        // check if a cart is already in local storage
        if (localStorage.getItem('cart')) {
            cart = JSON.parse(localStorage.getItem('cart'));
        }

        //Loop to check if the product in the specified color exists already
        for (i in cart) {
            if (productId == cart[i].id && productColors.value == cart[i].color) {
                cart[i].quantity += productQuantity;
                if (cart[i].quantity > 100) {
                    alert('You have reached the maximum quantity of items (100 items) you can order for this sofa and color combination.');
                    cart[i].quantity = 100;
                }
                flag = true;
                break;
            }
        }

        //Flag to add a new product to the cart
        if (flag == false) {
            cart.push({id: productId, color: productColors.value, quantity: productQuantity});
        }

        //Save the cart back to LocalStorage
        const cartString = JSON.stringify(cart);
        localStorage.setItem('cart', cartString);
    }
});


