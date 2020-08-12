import React from 'react';

type Props = {
  urls: {
    id: string,
    url: string,
  }[],
};

const Url: React.FC<Props> = ({urls}) => {

  console.log(urls);

  return <>
    {urls.map(({url, id}, i) => {
      return <div key={id}>
        {`${url}`}<br />
        <img alt={`s3 hosted ${i}`} src={url} /><br /><br />
      </div>
    })}
  </>
};

export default Url;
