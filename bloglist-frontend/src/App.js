import React from 'react'
import { connect } from 'react-redux'
import Notification from './components/Notification'
import blogService from './services/blogs'
import userService from './services/users'
import loginService from './services/login'
import BlogList from './components/BlogList'
import UserList from './components/UserList'
import User from './components/User'
import {Route, Switch, NavLink, Link, BrowserRouter as Router} from 'react-router-dom'
import {addUsers} from './reducers/UserReducer'
import {addBlogs} from './reducers/BlogReducer'
import NavigationMenu from './components/NavigationMenu'
import Blog from './components/Blog'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      blogs: [],
      user: null,
      username: '',
      password: '', 
      title: '',
      author: '',
      url: '',
      notification: null
    }
  }

  componentWillMount() {
    blogService.getAll().then(blogs => {
      this.setState({ blogs })
      this.props.addBlogs( blogs );
    }).catch( err => {
      this.notify( 'Error connecting the server' )
    })

    userService.getAll().then(users => {
      console.log('userS:', users)
      console.log('props:', this.props)
      console.log('componentWillMount props:',this.props)
      this.props.addUsers( users );
    }).catch( err => {
      this.notify( 'Error connecting the server' )
    })  

    const loggedUserJSON = window.localStorage.getItem('loggedBlogAppUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      this.setState({ user })
      blogService.setToken(user.token)
      userService.setToken(user.token)
    }
  } 

  notify = (message, type = 'info') => {
    this.setState({
      notification: {
        message, type
      }
    })
    setTimeout(() => {
      this.setState({
        notification: null
      })     
    }, 10000)
  }

  likeBlog = (id) => async () => {
    const liked = this.state.blogs.find(b=>b.id===id)
    const updated = { ...liked, likes: liked.likes + 1 }
    await blogService.update(id, updated)
    this.notify(`you liked '${updated.title}' by ${updated.author}`)
    this.setState({
      blogs: this.state.blogs.map(b => b.id === id ? updated : b)
    })
  }

  removeBlog = (id) => async () => {
    const deleted = this.state.blogs.find(b => b.id === id)
    const ok = window.confirm(`remove blog '${deleted.title}' by ${deleted.author}?`)
    if ( ok===false) {
      return
    }

    await blogService.remove(id)
    this.notify(`blog '${deleted.title}' by ${deleted.author} removed`)
    this.setState({
      blogs: this.state.blogs.filter(b=>b.id!==id)
    })
  }

  addUser = async (event) => {
    //TODO:
    event.preventDefault()
  }

  addBlog = async (event) => {
    event.preventDefault()
    const blog = {
      title: this.state.title,
      author: this.state.author,
      url: this.state.url,
    }
    
    const result = await blogService.create(blog) 
    this.notify(`blog '${blog.title}' by ${blog.author} added`)
    this.setState({ 
      title: '', 
      url: '', 
      author: '',
      blogs: this.state.blogs.concat(result)
    })
  }

  logout = () => {
    window.localStorage.removeItem('loggedBlogAppUser')
    this.notify('logged out')
    this.setState({ user: null })
  }

  login = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({
        username: this.state.username,
        password: this.state.password
      })

      window.localStorage.setItem('loggedBlogAppUser', JSON.stringify(user))
      blogService.setToken(user.token)
      this.notify('welcome back!')
      this.setState({ username: '', password: '', user })
    } catch (exception) {
      this.notify('k�ytt�j�tunnus tai salasana virheellinen', 'error')
      setTimeout(() => {
        this.setState({ error: null })
      }, 5000)
    }
  }

  handleLoginChange = (event) => {
    this.setState({ [event.target.name]: event.target.value })
  }

  render() {
    console.log('--- App.render')
    if (this.state.user === null) {
      return (
        <div>
          <Notification notification={this.state.notification} />
          <h2>login</h2>
          <form onSubmit={this.login}>
            <div>
              username
              <input
                type="text"
                name="username"
                value={this.state.username}
                onChange={this.handleLoginChange}
              />
            </div>
            <div>
              password
              <input
                type="password"
                name="password"
                value={this.state.password}
                onChange={this.handleLoginChange}
              />
            </div>
            <button type="submit">kirjaudu</button>
          </form>
        </div>
      )
    }

    const byLikes = (b1, b2) => b2.likes - b1.likes

    console.log('App.props:',this.props);
    console.log('App.state:',this.state)
    const blogsInOrder = this.state.blogs.sort(byLikes)

    // for nav menu
    const activeStyle = {margin:'1em', backgroundColor:'steelblue', border:'1px solid black', padding:'1em', color:'white', fontWeight:'bold'}
    const defaultStyle= { color:'black', margin:'1em' }

    return (
      <Router>
        <div>
          <h3>
            Blog app
          </h3>
          <Notification notification={this.state.notification} />

          <NavigationMenu defaultStyle={defaultStyle} activeStyle={activeStyle} user={this.state.user} logout={this.logout} />

          <Route exact path='/' render={({history}) => 
            <BlogList
                handleChange={this.handleLoginChange}
                title={this.state.title}
                author={this.state.author}
                url={this.state.url}
                addBlog={this.addBlog}
                blogsInOrder={blogsInOrder}
                like={this.likeBlog}
                remove={this.removeBlog}
                username={this.state.user.username}
             />} 
          />
          <Route exact path='/blogs/:id' render={({match}) => {
            const blog = this.props.blogs.find( (a) => a.id===match.params.id );
            if ( blog )
              return (<Blog
                  blog={blog}
                  deletable={this.props.blogs.find( (a) => a.id===match.params.id && a.user.id===this.state.user.id)}
                  like={this.likeBlog}
                  remove={this.removeBlog}
                />);
              return "loading";
            }}
          />
          <Route exact path='/users/:id'  render={({match}) => {
            let foundUser=this.props.users.find( (a) => a.id===match.params.id);
            if ( foundUser )
              return (
                <User id={match.params.id} 
                  user={foundUser}
                  handleChange={this.handleLoginChange} addUser={this.addUser}/>
              );
            return "loading";
            }}
          />
          <Route exact path='/users' render={({match}) =>
            <UserList users={this.props.users} handleChange={this.handleLoginChange} addUser={this.addUser}/>
          } />
        </div>
      </Router>
    );
  }
}

//export default App;
export default connect(
  (a) => a,
  { addUsers, addBlogs  } 
)(App)

