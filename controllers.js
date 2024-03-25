const { graphql, buildSchema } = require('graphql')
//import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';

//import { graphql, buildSchema} from 'graphql'

//import model from 'model'
const model = require('./model') //Database

let DB

model.getDB().then(db => {DB = db})

//Notifications
const sse  = require('./utils/notifications')
sse.start()


const schema = buildSchema(`
  type Query {
    hello: String
    users: [User]
    blogs: [Blog]
    searchBlog(q:String!):[Blog]
    posts(blogId:ID!):[Post]
    searchPost(blogId:ID!, q:String!):[Post]
  }
  type Mutation {
    addUser(name:String!):User!
    addBlog(title:String!,creator:ID!):Blog!
    addPost(title:String!,content:String!,authorId:ID!,blogId:ID!):Post
  }
  type User{
	  name: String
  }

  type Post{
	  title: String
	  content: String
	  author: User
	  blog: Blog
  }
  type Blog{
	  creator: User
	  title: String
  }
`)


const rootValue = {

     hello: () => "Hello World!",

     users: () => DB.objects('User'),
     
     blogs: () => DB.objects('Blog'),
     
     searchBlog: ({ q }) => {
       q = q.toLowerCase()
       return DB.objects('Blog').filter(x => x.title.toLowerCase().includes(q))
     },
     
     posts: ({ blogId }) => {
       return DB.objects('Post').filter(x => x.blog.title == blogId)
     },

     addUser: ({name}) => {

       let usr = DB.objectForPrimaryKey('User', name)

       if (!usr){
         
         let data = {name: name, passwd: 'xxxx'}

         DB.write( () => { 
            usr = DB.create('User', data)
         })

         return data
       }

       return null

     },
     
     addPost: ({title, content, authorId, blogId}) => {

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
}

exports.root   = rootValue
exports.schema = schema
exports.sse    = sse
