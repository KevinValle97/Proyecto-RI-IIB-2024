import React from 'react';
import './App.css';
import InputFileUpload from './atomos/FileUpload';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Lens</h1>
        <h1>IRS Project IIB</h1>
      </header>
      <div className="content">
        <h2>Upload your file</h2>
        <InputFileUpload />
      </div>
    </div>
  );
}

export default App;
