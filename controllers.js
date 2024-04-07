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

     hello: () => "Hello World!",
     getUser: async (_, { id }) => {
      // Buscar el usuario por su ID en la base de datos Realm
      const user = await DB.objects('User').filtered(`id = "${id}"`);

      // Verificar si el usuario existe
      if (user.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      // Devolver el usuario encontrado
      return user[0];
    }
  ,

     user: () => DB.objects('User'),
     
     blogs: () => DB.objects('Device'),
     
     /*searchBlog: ({ q }) => {
       q = q.toLowerCase()
       return DB.objects('Blog').filter(x => x.title.toLowerCase().includes(q))
     },
     
     posts: ({ blogId }) => {
       return DB.objects('Post').filter(x => x.blog.title == blogId)
     }, */

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
