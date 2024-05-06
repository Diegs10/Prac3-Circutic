const Realm = require('realm');

// Definir los esquemas de datos
const UserSchema = {
  name: 'User',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    email: 'string',
    address: 'string',
    password: 'string'
  }
};

const DeviceSchema = {
  name: 'Device',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    type: 'string',
    brand: 'string',
    ownerId: 'string',
    price: 'float',
    description: 'string',
    status: 'string',
  }
};

const PurchaseSchema = {
  name: 'Purchase',
  primaryKey: 'id',
  properties: {
    id: 'string',
    buyerId: 'string',
    deviceId: 'string',
    timestamp: 'string',
    amount: 'float',
  }
};

const RatingSchema = {
  name: 'Rating',
  primaryKey: 'id',
  properties: {
    id: 'string',
    giverId: 'string',
    receiverId: 'string',
    rating: 'float',
    comment: 'string',
  }
};

let config = { path: './data/blogs.realm', schema: [UserSchema, DeviceSchema, PurchaseSchema, RatingSchema] };

exports.getDB = async () => await Realm.open(config);

// Parte de pruebas
if (process.argv[1] == __filename) {
  if (process.argv.includes("--create")) {
    Realm.deleteFile({ path: './data/blogs.realm' }); // Borra la base de datos si existe

    // Creamos la base de datos Realm con nuestros esquemas
    let DB = new Realm({
      path: './data/blogs.realm',
      schema: [DeviceSchema, UserSchema, RatingSchema, PurchaseSchema]
    });

    // Insertamos objetos en la base de datos
    DB.write(() => {
      let user0 = DB.create('User', {
        id: 'u1',
        name: 'Jon Comida',
        email: 'john@example.com',
        address: 'Calle Barrachina, 18',
        password: '1234'
      });

      let device0 = DB.create('Device', {
        id: 'd1',
        name: 'iPhone 12',
        type: "smartphone",
        brand: "Apple",
        ownerId: user0.id,
        price: 777,
        description: 'en perfecto estado ;)',
        status: 'available'
      });

      let purchase0 = DB.create('Purchase', {
        id: 'purchase0',
        buyerId: user0.id,
        deviceId: device0.id,
        timestamp: '10/04/2024',
        amount: 750
      });

      let rating0 = DB.create('Rating', {
        id: 'r0',
        giverId: user0.id,
        receiverId: user0.id,
        rating: 4.5,
        comment: 'Bona compra'
      });

      console.log('Inserted objects:', user0, device0, purchase0, rating0);
    });

    DB.close();
    process.exit();
  } else { // Consultar la BD
    Realm.open({ path: './data/blogs.realm', schema: [DeviceSchema, UserSchema, RatingSchema, PurchaseSchema] }).then(DB => {
      let users = DB.objects('User');
      users.forEach(x => console.log(x.name));
      DB.close();
      process.exit();
    });
  }
}
