/**
 * The following code contains functions used in different pages of the website.
 */


// API URL of the sofa catalogue
const api = 'http://localhost:3000/api/products';

/**
 * This function handles the requests to the API.
 * It uses promises and can generate GET and POST requests.
 * @param {string} method - The type of the request, accepts only GET or POST.
 * @param {string} url - The URL of the API.
 * @param {*} data - The data object for the POST reques. Should contain a contact object and a product table.
 * @returns - A response.
 */

function makeRequest(method, url, data) {
    return new Promise((resolve, reject) => {
        if (method === 'POST' && !data) {
            reject({error: 'Please input a data object when creating a POST request.'});
        }
        if (method !== 'POST' && method !== 'GET') {
            reject({error: 'Please input a valid request method: either GET or POST.'});
        }
        let request = new XMLHttpRequest();
        request.open(method, url);
        request.onreadystatechange = () => {
            if (request.readyState === 4) {
                if (request.status === 200 || request.status === 201) {
                resolve(JSON.parse(request.response));
                } else {
                reject(JSON.parse(request.response));
                }
            }
        };
        if (method === 'POST') {
            request.setRequestHeader('Content-type', 'application/json');
            request.send(JSON.stringify(data));
        } else {
            request.send();
        } 
    });
}