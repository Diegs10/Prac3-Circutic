const Realm = require('realm')

let DeviceSchema = {
  name: 'Device',
  properties: {
    id: 'string',
    name: 'string',
    description: 'string',
    price: 'float',
    seller: 'User',
    status: 'string',
    type: 'string'
  }
}

let UserSchema = {
  name: 'User',
  properties: {
    id: 'string',
    name: 'string',
    email: 'string',
    password: 'string',
    sales: 'string', // cambiar Device[]
    ratings: 'string' // cambiar Rating[]
  }
}

let RatingSchema = {
  name: 'Rating',
  properties: {
    id: 'string',
    title: 'string',
    comment: 'string',
    author: 'User',
    seller: 'User',
    device: 'Device'
  }
}

let PurchaseSchema = {
  name: 'Purchase',
  properties: {
    id: 'string',
    price: 'float',
    status: 'bool',
    dateOfPurchase: 'string',
    deadline: 'string',
    buyer: 'User',
    seller: 'User',
    device: 'Device'
  }
}


// // // MODULE EXPORTS

let config = {path: './data/blogs.realm', schema: [DeviceSchema, UserSchema, RatingSchema, PurchaseSchema]}

exports.getDB = async () => await Realm.open(config)

// // // // // 

if (process.argv[1] == __filename){ //TESTING PART

  if (process.argv.includes("--create")){ //crear la BD

      Realm.deleteFile({path: './data/blogs.realm'}) //borramos base de datos si existe

      // Creamos la base de datos Realm con nuestros esquemas
      let DB = new Realm({
        path: './data/blogs.realm',
        schema: [DeviceSchema, UserSchema, RatingSchema, PurchaseSchema]
      })
     
      // Esto de aqui funciona para hacer inserts en la base de datos
      // Primero le decimos el tipo y luego ponemos sus propiedades
      DB.write(() => {
        // UserSchema
        let user0 = DB.create('User', { id: 'u1',
                                        name: 'Jon Comida',
                                        email: 'john@example.com',
                                        password: '1234',
                                        sales: "null", // cambiar
                                        ratings: "null"// cambiar
                                      })


        let user1 = DB.create('User', { id: 'u2',
                                        name: 'Alberto Martinez',
                                        email: 'mAl@example.com',
                                        password: '12345',
                                        sales: "null",// cambiar
                                        ratings: "null"// cambiar
                                      })

        // DeviceSchema
        let device0 = DB.create('Device', {
          id: 'd1',
          name: 'iPhone 12',
          description: 'en perfecto estado ;)',
          price: 777.99,
          seller: user0,
          status: 'available',
          type: 'smartphone'
        })

        // PurchaseSchema
        let purchase0 = DB.create('Purchase', {id:'purchase0',
                                              price: 23.99,
                                              status: true,
                                              dateOfPurchase: 'ahir',
                                              deadline: 'dema',
                                              buyer: user1,
                                              seller: user0,
                                              device: device0
                                              })

        // RatingSchema
        let rating0 = DB.create('Rating', {id:'r0',
                                          title: 'Primer rating',
                                          comment: 'Bona compra',
                                          author: user1,
                                          seller: user0,
                                          device: device0
                                        })

        console.log('Inserted objects', user0, user1, device0, purchase0, rating0)
      })
      DB.close()
      process.exit()
  }
  else { //consultar la BD

      Realm.open({ path: './data/blogs.realm' , schema: [DeviceSchema, UserSchema, RatingSchema, PurchaseSchema] }).then(DB => {
        let users = DB.objects('User')
        users.forEach(x => console.log(x.name))
        /*let blog = DB.objectForPrimaryKey('Blog', 'Todo Motos')
        if (blog)
           console.log(blog.title, 'by', blog.creator.name)*/
        DB.close()
        process.exit()
      })
  }
}
