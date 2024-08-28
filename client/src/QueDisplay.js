import './QueDisplay.css';

function QueDisplay(props){

    function leaveQue(index){
        props.leaveQueFunction(index)
    }

    return(
        <div className = "queue">
            {props.items.map((item, i) =>
            i < 5 ? 
            <div className={i == 0 ? "userBox firstBox" : "userBox"} onClick={(() => leaveQue(i))}>{item}</div> : null
        ) }
        </div>
    )
}

export default QueDisplay;