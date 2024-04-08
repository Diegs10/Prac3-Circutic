const { graphql, buildSchema } = require('graphql')
//


//import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';

//import { graphql, buildSchema} from 'graphql'

//import model from 'model'
const model = require('./model') //Database

let DB

model.getDB().then(db => {DB = db})

//Notifications
const sse  = require('./utils/notifications')
sse.start()

const fs = require('fs')
let gql = fs.readFileSync('esquema.gql').toString()
const schema = buildSchema(gql)

let id = 5

const rootValue = {

     listUsers: () => {
     let users = DB.objects('User');
     return users
     },
     
     getUser: async (_, { id }) => {
      // Buscar el usuario por su ID en la base de datos Realm
      let user = await DB.objects('User').filtered(`id = "${id}"`);

      // Verificar si el usuario existe
      if (user.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      // Devolver el usuario encontrado
      return user[0];
    }
  ,
    listDevices: () => {
    let devices = DB.objects('Device');
    return devices 
    },

    getDevice: async (_, { id }) => {
      // Buscar el usuario por su ID en la base de datos Realm
      let device = await DB.objects('Device').filtered(`id = "${id}"`);

      // Verificar si el usuario existe
      if (device.length === 0) {
        throw new Error('El dispositivo no se ha encontrado');
      }

      // Devolver el usuario encontrado
      return device[0];
    },

     createUser: ({ input }) => {
      let user = null;
      let data = {
        id: Realm.BSON.ObjectID().toString(), 
        name: input.name,
        email: input.email,
        password: input.password,
        sales: input.sales,
        ratings:input.ratings
      }
      DB.write(() => {
        user = DB.create('User', data);
      });

      sse.emitter.emit('nuevo-cliente',data)
      
      return user;
    },

    updateUser: async ({id, input}) => {
      const user = await DB.objects('User').filtered(`id = "${id}"`);
      if (user.length === 0) {
        throw new Error('El usuario no se ha encontrado');
      }
      DB.write(() => {
        if (input.name !== undefined) user[0].name = input.name;
        if (input.email !== undefined) user[0].email = input.email;
        if (input.password !== undefined) user[0].password = input.password;
      });

      return user[0];

    },

    deleteUser: async ({id}) => {
      const user = await DB.objects('User').filtered(`id = "${id}"`);
      if (user.length === 0) {
        throw new Error('El usuario no existe');
      }

      DB.write(() => {
        DB.delete(user);
      });

      return id

    },

    deviceDetails: async ({ id }) => {
      const device = await DB.objects('Device').filtered(`id = "${id}"`);
  
      if (device.length === 0) {
        throw new Error('Dispositivo no encontrado');
      }
  
      return device[0];
    },

    createDeviceAd: async ({ input }) => {
      const { deviceId, title, description, price } = input;
  
      // Verificar si el dispositivo existe
      const device = await DB.objects('Device').filtered(`id = "${deviceId}"`);
  
      if (device.length === 0) {
        throw new Error('Dispositivo no encontrado');
      }
  
      // Crear el anuncio para el dispositivo
      let ad = null;
      let data = {
        id: Realm.BSON.ObjectID().toString(),
        deviceId: deviceId,
        title: title,
        description: description,
        price: price
      };
  
      DB.write(() => {
        ad = DB.create('DeviceAd', data);
      });
  
      return data;
    }
  
    
    createDevice: ({ input }) => {
      let device = null;
      let data = {
        id: Realm.BSON.ObjectID().toString(), 
        name: input.name,
        description: input.description,
        price: input.price,
        seller: input.seller,
        status:input.status,
        type:input.type
      }
      DB.write(() => {
        device = DB.create('Device', data);
      });

      sse.emitter.emit('nuevo-dispositivo',data)
      
      return device;
    },
     
     /*addPost: ({title, content, authorId, blogId}) => {

       let blog = DB.objectForPrimaryKey('Blog', blogId)
       let auth = DB.objectForPrimaryKey('User', authorId)
       let post = DB.objectForPrimaryKey('Post', title)
       
       if (blog && auth && !post){

          let data = {
                       title: title,
                       content: content,
                       author: auth,
                       blog: blog,
                       timestamp: new Date()
                      }

          DB.write( () => { 
            post = DB.create('Post', data)
            // emit the post to all open blogs
            sse.emitter.emit('new-post', post)
          }) 
          
          return data
       }

       return null
     }
     */
}

exports.root   = rootValue
exports.schema = schema
exports.sse    = sse
