import requests

def test_get_products_success_response():
    base_url = "http://localhost:5050"
    endpoint = "/api/products"
    url = f"{base_url}{endpoint}"
    timeout = 30

    try:
        response = requests.get(url, timeout=timeout)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

    try:
        products = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(products, list), "Response is not an array"

    # Optionally, check that items in the array are objects (dict)
    for product in products:
        assert isinstance(product, dict), "Product item is not an object"

test_get_products_success_response()