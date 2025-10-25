const http = require('http');

function req(method, path, data) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path,
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const r = http.request(options, (res) => {
      let buf = '';
      res.setEncoding('utf8');
      res.on('data', (c) => buf += c);
      res.on('end', () => {
        try {
          const parsed = buf ? JSON.parse(buf) : null;
          resolve({ status: res.statusCode, body: parsed });
        } catch (err) {
          resolve({ status: res.statusCode, body: buf });
        }
      });
    });
    r.on('error', reject);
    if (data) r.write(JSON.stringify(data));
    r.end();
  });
}

(async () => {
  try {
    console.log('POST /api/employeelist -> create');
    const create = await req('POST', '/api/employeelist', { name: 'SmokeUser', location: 'TestCity', position: 'Tester', salary: 11111 });
    console.log('create:', create.status, create.body);

    const id = create.body && create.body._id ? create.body._id : (create.body && create.body.id ? create.body.id : null);
    if (!id) {
      console.error('Could not get created id, aborting.');
      process.exit(1);
    }

    console.log('\nGET /api/employeelist');
    const list = await req('GET', '/api/employeelist');
    console.log('list:', list.status, Array.isArray(list.body) ? list.body.length + ' items' : list.body);

    console.log(`\nGET /api/employeelist/${id}`);
    const single = await req('GET', `/api/employeelist/${id}`);
    console.log('single:', single.status, single.body);

    console.log('\nPUT /api/employeelist -> update');
    const updated = await req('PUT', '/api/employeelist', { _id: id, name: 'SmokeUserUpdated', location: 'NewCity', position: 'Senior Tester', salary: 22222 });
    console.log('updated:', updated.status, updated.body);

    console.log(`\nDELETE /api/employeelist/${id}`);
    const deleted = await req('DELETE', `/api/employeelist/${id}`);
    console.log('deleted:', deleted.status, deleted.body);

    console.log('\nFinal GET /api/employeelist');
    const final = await req('GET', '/api/employeelist');
    console.log('final list:', final.status, Array.isArray(final.body) ? final.body.length + ' items' : final.body);

    process.exit(0);
  } catch (err) {
    console.error('Smoke test error:', err);
    process.exit(2);
  }
})();
