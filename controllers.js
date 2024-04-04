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

     users: () => DB.objects('User'),
     
     blogs: () => DB.objects('Device'),
     
     /*searchBlog: ({ q }) => {
       q = q.toLowerCase()
       return DB.objects('Blog').filter(x => x.title.toLowerCase().includes(q))
     },
     
     posts: ({ blogId }) => {
       return DB.objects('Post').filter(x => x.blog.title == blogId)
     }, */

     addUser: ({name}) => {

       let usr = DB.objectForPrimaryKey('User', name)

       if (!usr){
         
         let data = {id: id++, name: name, email: "", password: 'xxx', sales: "", ratings: ""}

         DB.write( () => { 
            usr = DB.create('User', data)
         })

         return data
       }

       return null

     }
     
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
