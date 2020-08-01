import React,{useEffect,useState} from "react";
import { v1 as uuid } from "uuid";

const CreateRoom = (props) => {
    const email=props.match.params.input.split("||||")[0]
    const name=props.match.params.input.split('||||')[1]

    useEffect(()=>{
        
        console.log(name)
        console.log(email)
        
        
        
    },[])
    function create() {
        const id = uuid();
        props.history.push(`/room/${id}/${name}`);
    }

    return (
        <button onClick={create}>Create room</button>
    );
};

export default CreateRoom;
