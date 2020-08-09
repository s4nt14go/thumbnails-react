import React from 'react';
/*import EditPost from './editPost'
import DeletePost from './deletePost'*/

class Url extends React.Component {

  /*componentDidMount() {
    this.props.subscribeToMore();
  }*/

  render() {
    const items = this.props.data.listResizedUrls.items;

    return items.map((post) => {
      return (
        <div key={post.id}>
          <span>{post.url}</span>
          {/*<p>{post.body}</p>
          <time dateTime={post.createdAt}>{
            new Date(post.createdAt).toDateString()}</time>
          <br />
          <EditPost {...post} />
          <DeletePost {...post} />*/}
        </div>

      )
    })
  }
}

export default Url;
