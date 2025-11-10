import { expect } from 'chai';
import supertest from 'supertest';
import app, { initDB } from '../app.js';
import Product from '../models/Product.js';

const request = supertest(app);
let authToken; // store admin token for authenticated requests
let createdProductId;

describe('Products API', () => {

  before(async () => {
    await initDB();

    // Login as admin to get token
    const res = await request.post('/api/users/login').send({
      email: 'admin@example.com',
      password: 'Admin1234'
    });

    authToken = res.body.token;
  });

  after(async () => {
    // Clean up test products
    await Product.deleteMany({ name: /Test Product/ });
  });

  it('GET /api/products should return all products', async () => {
    const res = await request.get('/api/products');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
  });

  it('POST /api/products should create a new product', async () => {
    const timestamp = Date.now();
    const newProduct = {
      code: `TEST-${timestamp}`,
      name: `Test Product ${timestamp}`,
      description: 'Test description',
      category: 'Test',
      price: 9.99,
      material: 'Test Material',
      weight: 1.5,
      stock: 10
    };

    const res = await request
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newProduct);

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('product');
    expect(res.body.product).to.have.property('_id');
    expect(res.body.product.name).to.equal(newProduct.name);

    createdProductId = res.body.product._id; // save ID for future tests
  });

  it('GET /api/products/:id should return the created product', async () => {
    const res = await request.get(`/api/products/${createdProductId}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('_id', createdProductId);
  });

  it('PUT /api/products/:id should update the product', async () => {
    const res = await request
      .put(`/api/products/${createdProductId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ price: 19.99 });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('product');
    expect(res.body.product.price).to.equal(19.99);
  });

  it('DELETE /api/products/:id should delete the product', async () => {
    const res = await request
      .delete(`/api/products/${createdProductId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('message').that.includes('deleted');
  });

});
