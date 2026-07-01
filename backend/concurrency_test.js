const API_URL = 'http://localhost:5050/api';

async function runConcurrencyTest() {
  console.log('Starting concurrency test...');
  
  // 1. Create a dummy user and login (or just get products if we don't need auth to view)
  const productsResponse = await fetch(`${API_URL}/products?limit=1`);
  const productsData = await productsResponse.json();
  const products = productsData.data;
  
  if (!products || products.length === 0) {
    console.log('No products found to test concurrency.');
    return;
  }
  
  const product = products[0];
  console.log(`Found product: ${product.name} with stock: ${product.stock}`);
  
  // 2. We can try to fire 20 requests at the same time to see if the server crashes
  console.log('Firing 20 concurrent product requests...');
  
  const requests = [];
  for (let i = 0; i < 20; i++) {
    requests.push(
      fetch(`${API_URL}/products/${product.slug}`)
        .then(res => {
          if (!res.ok) console.error(`Req ${i} failed: ${res.status}`);
          return res.status;
        })
        .catch(err => {
          console.error(`Req ${i} error:`, err);
          return 500;
        })
    );
  }
  
  const results = await Promise.all(requests);
  const successCount = results.filter(status => status === 200).length;
  console.log(`Successful requests: ${successCount} / 20`);
  
  if (successCount === 20) {
    console.log('Concurrency read test passed!');
  } else {
    console.error('Concurrency read test failed!');
  }
}

runConcurrencyTest().catch(console.error);
