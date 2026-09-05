const https = require('https');
const http = require('http');

function request(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https:');
    const client = isHttps ? https : http;
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = client.request(options, (res) => {
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

async function testRenderLive(baseUrl) {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  console.log(`\n=== TESTING LIVE RENDER BACKEND: ${cleanBase} ===\n`);

  // 1. Health
  console.log('1. Testing GET /api/health...');
  const health = await request(`${cleanBase}/api/health`);
  console.log(`Status: ${health.status}, Response:`, health.body);
  if (health.status !== 200 || health.body?.status !== 'ok') {
    throw new Error('Health check failed on Render');
  }

  // 2. Categories
  console.log('\n2. Testing GET /api/categories...');
  const cat = await request(`${cleanBase}/api/categories`);
  console.log(`Status: ${cat.status}, Categories:`, cat.body);
  if (cat.status !== 200 || !Array.isArray(cat.body) || cat.body.length !== 5) {
    throw new Error('Categories check failed on Render');
  }

  // 3. Initial Expenses
  console.log('\n3. Testing GET /api/expenses...');
  const initialExp = await request(`${cleanBase}/api/expenses`);
  console.log(`Status: ${initialExp.status}, Expenses Count: ${initialExp.body.length}`);

  // 4. Initial Dashboard
  console.log('\n4. Testing GET /api/dashboard...');
  const initialDash = await request(`${cleanBase}/api/dashboard`);
  console.log(`Status: ${initialDash.status}, Dashboard:`, initialDash.body);

  // 5. Create Expense
  console.log('\n5. Testing POST /api/expenses (Live creation)...');
  const today = new Date().toISOString().split('T')[0];
  const createPayload = {
    amount: 19.99,
    category_id: 1, // Food
    description: 'Render Live Test Coffee',
    expense_date: today
  };
  const created = await request(`${cleanBase}/api/expenses`, 'POST', createPayload);
  console.log(`Status: ${created.status}, Created:`, created.body);
  if (created.status !== 201 || !created.body?.id) {
    throw new Error('POST /api/expenses failed on Render');
  }
  const expenseId = created.body.id;

  // 6. Filter by category
  console.log('\n6. Testing GET /api/expenses?category=Food...');
  const foodExp = await request(`${cleanBase}/api/expenses?category=Food`);
  console.log(`Status: ${foodExp.status}, Found ${foodExp.body.length} Food expenses.`);
  const containsCreated = foodExp.body.some(e => e.id === expenseId);
  if (!containsCreated) {
    throw new Error('Filter did not return the newly created expense');
  }

  // 7. Update Expense
  console.log(`\n7. Testing PUT /api/expenses/${expenseId}...`);
  const updatePayload = {
    amount: 24.99,
    category_id: 1,
    description: 'Render Live Test Coffee & Pastry',
    expense_date: today
  };
  const updated = await request(`${cleanBase}/api/expenses/${expenseId}`, 'PUT', updatePayload);
  console.log(`Status: ${updated.status}, Updated:`, updated.body);
  if (updated.status !== 200 || parseFloat(updated.body.amount) !== 24.99) {
    throw new Error('PUT /api/expenses failed on Render');
  }

  // 8. Verify Dashboard updated
  console.log('\n8. Testing GET /api/dashboard (Updated)...');
  const updatedDash = await request(`${cleanBase}/api/dashboard`);
  console.log(`Status: ${updatedDash.status}, Dashboard:`, updatedDash.body);

  // 9. Delete Expense
  console.log(`\n9. Testing DELETE /api/expenses/${expenseId}...`);
  const deleted = await request(`${cleanBase}/api/expenses/${expenseId}`, 'DELETE');
  console.log(`Status: ${deleted.status}, Response:`, deleted.body);
  if (deleted.status !== 200) {
    throw new Error('DELETE /api/expenses failed on Render');
  }

  // 10. Verify 404 for deleted
  console.log(`\n10. Testing GET /api/expenses/${expenseId} (Expect 404)...`);
  const verifyDeleted = await request(`${cleanBase}/api/expenses/${expenseId}`);
  console.log(`Status: ${verifyDeleted.status}, Response:`, verifyDeleted.body);
  if (verifyDeleted.status !== 404) {
    throw new Error('Expected 404 for deleted expense');
  }

  console.log('\n✓ ALL LIVE RENDER API AND AIVEN MYSQL CRUD TESTS PASSED SUCCESSFULLY!');
}

const targetUrl = process.argv[2];
if (!targetUrl) {
  console.error('Usage: node testRender.js <RENDER_URL>');
  process.exit(1);
}

testRenderLive(targetUrl).catch(err => {
  console.error('\n❌ Live Render test failed:', err);
  process.exit(1);
});
