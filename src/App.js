import check from './check.svg';
import cross from './cross.svg';
import axios from 'axios';
import io from 'socket.io-client';

import QueDisplay from './QueDisplay';

import './App.css';
import { useState, useRef, useEffect } from 'react';

const adr = 'http://localhost:3001'
const socket = io(adr); //backend port

function App() {

  document.title = "Plugin Registration Kø"

  const [que, setQue] = useState([]);

  const [isFree, setIsFree] = useState(true);

  useEffect(() => {
    // Fetch initial data from the backend
    axios.get(adr+'/data')
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

  const passIsFreeToBackend = () => {
    axios.post(adr+'/isFree', { value: isFree });
  };

  const passQueueToBackend = () => {
    axios.post(adr+'/queue', { value: que });
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

    passIsFreeToBackend()
    passQueueToBackend()

    inputRef.current.value = ""; 
  }

  function leaveQue(index){
    let arr = [...que];
    arr.splice(index, 1)
    setQue(arr)
    if (arr.length === 0){
      setIsFree(true)
    }
    passIsFreeToBackend()
    passQueueToBackend()
  }

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
        <input type='text' placeholder='Dine initialer' className='textinput' ref={inputRef}></input>
        <br></br>
        <button className='button' onClick={enterQue}>{isFree ? "Overta" : "Gå i kø"}</button>
        <br></br>
        {isFree ? "" : <div className='contextInfo'>(Når du er ferdig, trykk på ditt ikon for å fjerne deg selv fra køen)</div>}
      </div>
    </div>
  );
}

export default App;
