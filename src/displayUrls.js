import React from 'react'
import { Query } from 'react-apollo'
import { listResizedUrls } from './graphql/queries';
import { onCreateResizedUrl, onUpdateResizedUrl } from './graphql/subscriptions'
import gql from 'graphql-tag';
import Url from './url'

class DisplayUrls extends React.Component {

  subscribeNewUrls = (subscribeToMore) => {
    subscribeToMore({
      document: gql(onCreateResizedUrl),
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newUrlData = subscriptionData.data.onCreateResizedUrl;
        const existentItemsWsameId = prev.listResizedUrls.items.filter(item => {
          return item.id === newUrlData.id;
        });
        if (existentItemsWsameId.length) { console.log('Avoid adding the created item more than one time'); return prev; }
        return Object.assign({}, prev, {
          listResizedUrls: {
            ...prev.listResizedUrls,
            items: [...prev.listResizedUrls.items, newUrlData]
          }
        })
      }
    })
  };

  subscribeUrlUpdated = (subscribeToMore) => {
    subscribeToMore({
      document: gql(onUpdateResizedUrl),
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const updatedUrlData = subscriptionData.data.onUpdateResizedUrl;
        const itemsUpdated = prev.listResizedUrls.items.map(item => {
          return item.id === updatedUrlData.id? updatedUrlData : item;
        });
        return Object.assign({}, prev, {
          listResizedUrls: {
            ...prev.listResizedUrls,
            items: itemsUpdated
          }
        })
      }
    })
  };


  render() {
    return (
      <div className="posts">
        <Query query={gql(listResizedUrls)}  >
          {({ loading, data, error, subscribeToMore }) => {

            if (loading) return <p>loading...</p>;
            if (error) return <p>{error.message}</p>;

            this.subscribeNewUrls(subscribeToMore);
            this.subscribeUrlUpdated(subscribeToMore);

            return <Url urls={data.listResizedUrls.items} />
          }}
        </Query>



      </div>
    )
  }
}


export default DisplayUrls;
