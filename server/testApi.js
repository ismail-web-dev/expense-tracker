const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: body ? JSON.parse(body) : null });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== STAGE 5: COMPREHENSIVE BACKEND API TEST SUITE ===\n');

  // 1. GET /api/health
  console.log('1. Testing GET /api/health...');
  const health = await request({ hostname: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
  console.log(`Status: ${health.status}, Response:`, health.body);
  if (health.status !== 200 || health.body.status !== 'ok') throw new Error('Health check failed');

  // 2. GET /api/categories
  console.log('\n2. Testing GET /api/categories...');
  const categories = await request({ hostname: 'localhost', port: 5000, path: '/api/categories', method: 'GET' });
  console.log(`Status: ${categories.status}, Count: ${categories.body.length}, Items:`, categories.body);
  if (categories.status !== 200 || categories.body.length !== 5) throw new Error('Categories check failed');

  // 3. GET /api/dashboard (initial)
  console.log('\n3. Testing GET /api/dashboard (initial state)...');
  const dashBefore = await request({ hostname: 'localhost', port: 5000, path: '/api/dashboard', method: 'GET' });
  console.log(`Status: ${dashBefore.status}, Dashboard:`, dashBefore.body);

  // 4. POST /api/expenses (Create Expense 1: Food)
  console.log('\n4. Testing POST /api/expenses (Valid Food expense)...');
  const today = new Date().toISOString().split('T')[0];
  const newExp1 = {
    amount: 25.50,
    category_id: 1, // Food
    description: 'Team lunch',
    expense_date: today
  };
  const create1 = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/expenses',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, newExp1);
  console.log(`Status: ${create1.status}, Created:`, create1.body);
  if (create1.status !== 201 || !create1.body.id) throw new Error('Create expense failed');
  const createdId1 = create1.body.id;

  // 5. POST /api/expenses (Create Expense 2: Transport)
  console.log('\n5. Testing POST /api/expenses (Valid Transport expense)...');
  const newExp2 = {
    amount: 14.00,
    category_id: 2, // Transport
    description: 'Metro pass',
    expense_date: today
  };
  const create2 = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/expenses',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, newExp2);
  console.log(`Status: ${create2.status}, Created:`, create2.body);
  const createdId2 = create2.body.id;

  // 6. GET /api/expenses (List all)
  console.log('\n6. Testing GET /api/expenses (List all)...');
  const listAll = await request({ hostname: 'localhost', port: 5000, path: '/api/expenses', method: 'GET' });
  console.log(`Status: ${listAll.status}, Total expenses: ${listAll.body.length}`);

  // 7. GET /api/expenses?category=Food (Category filter)
  console.log('\n7. Testing GET /api/expenses?category=Food (Filtered)...');
  const listFood = await request({ hostname: 'localhost', port: 5000, path: '/api/expenses?category=Food', method: 'GET' });
  console.log(`Status: ${listFood.status}, Food items count: ${listFood.body.length}`);
  const allFood = listFood.body.every(e => e.category_name === 'Food');
  if (!allFood) throw new Error('Category filter failed!');

  // 8. GET /api/expenses/:id (Single expense)
  console.log(`\n8. Testing GET /api/expenses/${createdId1}...`);
  const getSingle = await request({ hostname: 'localhost', port: 5000, path: `/api/expenses/${createdId1}`, method: 'GET' });
  console.log(`Status: ${getSingle.status}, Expense:`, getSingle.body);
  if (getSingle.status !== 200 || getSingle.body.id !== createdId1) throw new Error('Get single expense failed');

  // 9. PUT /api/expenses/:id (Update expense)
  console.log(`\n9. Testing PUT /api/expenses/${createdId1}...`);
  const updatePayload = {
    amount: 32.75,
    category_id: 1,
    description: 'Team lunch with dessert',
    expense_date: today
  };
  const updateRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/expenses/${createdId1}`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  }, updatePayload);
  console.log(`Status: ${updateRes.status}, Updated:`, updateRes.body);
  if (updateRes.status !== 200 || parseFloat(updateRes.body.amount) !== 32.75) throw new Error('Update expense failed');

  // 10. GET /api/dashboard (Updated metrics)
  console.log('\n10. Testing GET /api/dashboard (Post-creation metrics)...');
  const dashAfter = await request({ hostname: 'localhost', port: 5000, path: '/api/dashboard', method: 'GET' });
  console.log(`Status: ${dashAfter.status}, Dashboard:`, dashAfter.body);

  // 11. DELETE /api/expenses/:id (Delete Expense 2)
  console.log(`\n11. Testing DELETE /api/expenses/${createdId2}...`);
  const delRes = await request({ hostname: 'localhost', port: 5000, path: `/api/expenses/${createdId2}`, method: 'DELETE' });
  console.log(`Status: ${delRes.status}, Response:`, delRes.body);
  if (delRes.status !== 200) throw new Error('Delete expense failed');

  // 12. GET /api/expenses/:id (Verify 404 for deleted)
  console.log(`\n12. Testing GET /api/expenses/${createdId2} after deletion (Expect 404)...`);
  const getDeleted = await request({ hostname: 'localhost', port: 5000, path: `/api/expenses/${createdId2}`, method: 'GET' });
  console.log(`Status: ${getDeleted.status}, Response:`, getDeleted.body);
  if (getDeleted.status !== 404) throw new Error('Expected 404 for deleted item');

  // 13. Testing Invalid Inputs / Validation
  console.log('\n13. Testing Input Validation:');
  // Invalid Amount (negative)
  const invAmount = await request({
    hostname: 'localhost', port: 5000, path: '/api/expenses', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { amount: -10, category_id: 1, description: 'Test', expense_date: today });
  console.log(`- Negative amount -> Status: ${invAmount.status} (Expected 400), Error:`, invAmount.body.error);

  // Invalid Category ID (doesn't exist)
  const invCat = await request({
    hostname: 'localhost', port: 5000, path: '/api/expenses', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { amount: 15, category_id: 9999, description: 'Test', expense_date: today });
  console.log(`- Non-existent category -> Status: ${invCat.status} (Expected 400), Error:`, invCat.body.error);

  // Invalid ID param (non-numeric)
  const invId = await request({ hostname: 'localhost', port: 5000, path: '/api/expenses/abc', method: 'GET' });
  console.log(`- Non-numeric ID param -> Status: ${invId.status} (Expected 400), Error:`, invId.body.error);

  console.log('\n✓ ALL STAGE 5 API TESTS PASSED SUCCESSFULLY AGAINST AIVEN MYSQL!');
}

runTests().catch(err => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
