const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CORETAX API Documentation',
      version: '1.0.0',
      description: 'API Documentation untuk sistem informasi RT-RW CORETAX',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Path ke file-file route tempat JSDoc ditulis
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsDoc(options);

module.exports = specs;
