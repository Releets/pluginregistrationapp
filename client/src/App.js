import check from './check.svg';
import cross from './cross.svg';
import axios from 'axios';
import io from 'socket.io-client';

import QueDisplay from './QueDisplay';

import './App.css';
import { useState, useRef, useEffect } from 'react';


const adr = 'https://pluginreg-api.kallerud.no';
axios.defaults.baseURL = adr;

const socket = io(adr);

function App() {

  document.title = "Plugin Registration Kø"

  const [que, setQue] = useState([]);

  const [isFree, setIsFree] = useState(true);

  useEffect(() => {
    // Fetch initial data from the backend
    axios.get('/data')
      .then(response => {
        setIsFree(response.data.isFree);
        setQue(response.data.queue);
      });

    // Listen for updates from the backend
    socket.on('dataUpdate', (data) => {
      setIsFree(data.isFree);
      setQue(data.queue);
    });

    return () => {
      socket.off('dataUpdate');
    };
  }, []);

  const passIsFreeToBackend = (e) => {
    axios.post(adr+'/isFree', { value: e });
  };

  const passQueueToBackend = (e) => {
    axios.post(adr+'/queue', { value: e });
  };

  const inputRef = useRef()

  function enterQue (){
    if(inputRef.current.value === ""){
      return
    }
    else if(inputRef.current.value.length > 7){
      inputRef.current.value = ""
      inputRef.current.placeholder = "For mange tegn!"
      inputRef.current.className = "textinput wronginput"
      return
    }

    inputRef.current.placeholder = "Dine initialer"
    inputRef.current.className = "textinput"

    setQue( [...que, inputRef.current.value] )
    setIsFree(false)

    passIsFreeToBackend(false)
    passQueueToBackend([...que, inputRef.current.value])

    inputRef.current.value = ""; 
  }

  function leaveQue(index){
    let arr = [...que];
    arr.splice(index, 1)
    setQue(arr)
    let queIsEmpty = false
    if (arr.length === 0){
      queIsEmpty = true
    }
    setIsFree(queIsEmpty)
    
    passIsFreeToBackend(queIsEmpty)
    passQueueToBackend(arr)
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && inputRef.current.value != "") {
      enterQue();
    }
  };

  return (
    <div className="App">
      <div className='banner'>
        Er Plugin Registration ledig?
      </div>
      <div className='availabilityIcon'>
        <img className = 'icon' src={isFree ? check : cross}></img>
      </div>
      {isFree ? "" :
      <div className='queContainer'>
          <QueDisplay items={que} leaveQueFunction={leaveQue}/>
      </div>}
      <div className='queForm'>
        <input type='text' placeholder='Dine initialer' className='textinput' ref={inputRef} onKeyPress={handleKeyPress}></input>
        <br></br>
        <button className='button' onClick={enterQue}>{isFree ? "Overta" : "Gå i kø"}</button>
        <br></br>
        {isFree ? "" : <div className='contextInfo'>(Når du er ferdig, trykk på ditt ikon for å fjerne deg selv fra køen)</div>}
      </div>
    </div>
  );
}

export default App;
