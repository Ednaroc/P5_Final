/**
 * The following program contains the source code for the index.html page.
 * It makes a GET request to the API and then inserts all the products into the homepage.
 */

// Get DOM elements
const sectionItems = document.getElementById('items');

/**
 * This function displays dynamically all the products on the homepage.
 * @param {*} products - The objects products from the promise response array.
 */
const updateHomepage = (products) => { // accept all products as parameter
  let html = ``;
  products.forEach((element) => {
    const {_id: productId, name: productName, imageUrl, description: productDescription, altTxt} = element;
    html +=
      `<a href="./product.html?id=${productId}">
        <article>
          <img src="${imageUrl}" alt="${altTxt}">
          <h3 class="productName">${productName}</h3>
          <p class="productDescription">${productDescription}</p>
        </article>
      </a>`;
  })
  sectionItems.innerHTML = html;
}

/**
 * This function calls 2 functions:
 * 1. makeRequest: to create a GET request to ask for all the products from the API.
 * (it then wait to collect the response)
 * 2. displayAllProducts: to insert each product into the DOM.
 */
const displayAllProducts = async () => {
  try {
    const allProductsPromise = makeRequest('GET', api);
    const allProductsResponse = await allProductsPromise;
    updateHomepage(allProductsResponse);
  } catch (error) {
    alert(error.error);
  }
}

displayAllProducts();
