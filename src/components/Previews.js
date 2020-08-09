import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import './Previews.css';

const thumbsContainer = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  marginTop: 16
};

const thumb = {
  display: 'inline-flex',
  borderRadius: 2,
  border: '1px solid #eaeaea',
  marginBottom: 8,
  marginRight: 8,
  width: 100,
  height: 100,
  padding: 4,
  boxSizing: 'border-box'
};

const thumbInner = {
  display: 'flex',
  minWidth: 0,
  overflow: 'hidden'
};

const img = {
  display: 'block',
  width: 'auto',
  height: '100%'
};



function Previews(props) {
  const [files, setFiles] = useState([]);
  const {getRootProps, getInputProps} = useDropzone({
    accept: ['image/png', 'image/jpeg'],
    maxSize: 5242880,
    onDrop: acceptedFiles => {
      console.log('acceptedFiles', acceptedFiles);
      props.setDisableUpload(!acceptedFiles.length);
      setFiles(acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      })));
      props.setFilename(acceptedFiles[0]);
    }
  });

  const thumbs = files.map(file => (
    <div style={thumb} key={file.name}>
      <div style={thumbInner}>
        <img
          src={file.preview}
          style={img}
          alt={file.preview}
        />
      </div>
    </div>
  ));

  useEffect(() => () => {
    // Make sure to revoke the data uris to avoid memory leaks
    files.forEach(file => URL.revokeObjectURL(file.preview));
  }, [files]);

  return (
    <section className="dropContainer">
      <div {...getRootProps({className: 'dropzone'})}>
        <input {...getInputProps()} />
        <p>{`Drag 'n' drop your image here, or click to select it`}</p>
        <p>{`png / jpeg < 5MB`}</p>
      </div>
      <aside style={thumbsContainer}>
        {thumbs}
      </aside>
    </section>
  );
}

export default Previews;
