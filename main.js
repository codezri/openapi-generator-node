const fs = require('fs');
const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const app = express();
const port = 8080;

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'OpenAPI demo',
            version: '1.0.0',
        },
        servers: [{
            url: 'http://localhost:8080'
        }]
    },
    apis: ['main.js'],
    format: '.yaml'
};

const apiSpec = swaggerJsdoc(options);
fs.writeFileSync('openapi.yaml', apiSpec);
console.log('Wrote OpenAPI spec to openapi.yaml');

app.use(express.json());
app.use(cors());


let products = [];

/**
 * @openapi
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
*     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 */

/**
 * @openapi
 * /products:
 *   get:
 *     operationId: getProducts
 *     tags: 
 *       - product
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get('/products', (req, res) => {
    res.json(products);
});

/** 
 * @openapi
 * /products:
 *   post:
 *     operationId: createProduct
 *     tags: 
 *       - product
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *             required:
 *              - name
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product' 
 *       400:
 *         description: Invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error' 
*/
app.post('/products', (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Missing product name' });
    }

    const latestProduct = products.reduce((prev, cur) => cur.id > prev.id ? cur : prev, {id: 0});
    const product = { id: latestProduct.id + 1, name };

    products.push(product);
    res.status(201).json(product);
});

/**
 * @openapi
 * /products/{productId}:
 *   get:
 *     operationId: getProduct
 *     tags: 
 *       - product
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200: 
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/Product'
 */
app.get('/products/:productId', (req, res) => {
    const product = products.find((product) => product.id === parseInt(req.params.productId));

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
});

/**
 * @openapi
 * /products/{productId}:
 *   delete:
 *     operationId: deleteProduct
 *     tags: 
 *       - product
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
app.delete('/products/:productId', (req, res) => {
    const productId = products.findIndex((product) => product.id === parseInt(req.params.productId));

    if (productId == -1) {
        return res.status(404).json({ error: 'Product not found' });
    }
    products.splice(productId, 1);
    res.end();
});

app.listen(port, () => {
    console.log(`OpenAPI demo server listening on port ${port}`)
})