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
    type: 'string',
  },
};

let UserSchema = {
  name: 'User',
  properties: {
    id: 'string',
    name: 'string',
    email: 'string',
    password: 'string',
    sales: 'Device[]',
    ratings: 'Rating[]',
  },
};

let RatingSchema = {
  name: 'Rating',
  properties: {
    id: 'string',
    title: 'string',
    comment: 'string',
    author: 'User',
    seller: 'User',
    device: 'Device',
  },
};

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
    device: 'Device',
  },
};


// // // MODULE EXPORTS

let config = {path: './data/blogs.realm', schema: [DeviceSchema, UserSchema, RatingSchema, PurchaseSchema]}

exports.getDB = async () => await Realm.open(config)

// // // // // 

if (process.argv[1] == __filename){ //TESTING PART

  if (process.argv.includes("--create")){ //crear la BD

      Realm.deleteFile({path: './data/blogs.realm'}) //borramos base de datos si existe

      let DB = new Realm({
        path: './data/blogs.realm',
        schema: [PostSchema, UserSchema, BlogSchema]
      })
     
      DB.write(() => {
        let user = DB.create('User', {name:'user0', passwd:'xxx'})
        
        let blog = DB.create('Blog', {title:'Todo Motos', creator: user})
        
        let post = DB.create('Post', {
                                        title: 'prueba moto', 
                                        blog:blog, 
                                        content: 'esto es una prueba de motos',
                                        creator: user, 
                                        timestamp: new Date()})

        console.log('Inserted objects', user, blog, post)
      })
      DB.close()
      process.exit()
  }
  else { //consultar la BD

      Realm.open({ path: './data/blogs.realm' , schema: [PostSchema, UserSchema, BlogSchema] }).then(DB => {
        let users = DB.objects('User')
        users.forEach(x => console.log(x.name))
        let blog = DB.objectForPrimaryKey('Blog', 'Todo Motos')
        if (blog)
           console.log(blog.title, 'by', blog.creator.name)
        DB.close()
        process.exit()
      })
  }
}
