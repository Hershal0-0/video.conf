import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import './Room.css'

const Video = (props) => {
    const ref = useRef();

    useEffect(() => {
        props.peer.on("stream", stream => {
            ref.current.srcObject = stream;
        })
    }, []);

    return (
        <video class="vid" playsInline autoPlay ref={ref}></video>
    );
}


const videoConstraints = {
    height: window.innerHeight / 2,
    width: window.innerWidth / 2
};

const Room = (props) => {
    const [peers, setPeers] = useState([]);
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const roomID = props.match.params.roomID;
    const name=props.match.params.name
    
    

    // Chat Box Code

    const [yourid,setYourid]=useState("");
    const [messages,setMessages]=useState([]);
    const [message,setMessage]=useState("");

    useEffect(() => {
        socketRef.current = io.connect("/");
        socketRef.current.on("sending id",id=>setYourid(id))

        // chat box code
        socketRef.current.on("new message",message=>{
            appendMsg(message)
        })

        navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then(stream => {
            userVideo.current.srcObject = stream;
            socketRef.current.emit("join room", roomID);
            socketRef.current.on("all users", users => {
                const peers = [];
                users.forEach(userID => {
                    const peer = createPeer(userID, socketRef.current.id, stream);
                    peersRef.current.push({
                        peerID: userID,
                        peer,
                    })
                    peers.push(peer);
                })
                setPeers(peers);
            })

            socketRef.current.on("user joined", payload => {
                const peer = addPeer(payload.signal, payload.callerID, stream);
                peersRef.current.push({
                    peerID: payload.callerID,
                    peer,
                })

                setPeers(users => [...users, peer]);
            });

            socketRef.current.on("receiving returned signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            });
        })
    },[]);

    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal })
        })

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", { signal, callerID })
        })

        peer.signal(incomingSignal);

        return peer;
    }
    const handleMsgChange=e=>setMessage(e.target.value)    

    
    const appendMsg=(msg)=>{
        setMessages(oldMsg=>[...oldMsg,msg])
        // const change=messages.filter(msg=>msg.roomid===roomID)
        // setMessages(change)
    }
    
    function sendMessage(e){
        e.preventDefault()
        const messageObject={
            body:message,
            name:name,
            id:yourid,
            roomid:roomID,

        }
        setMessage("")
        socketRef.current.emit("send message",messageObject)
    }


    return (
        <div>
            <div class="view">
                <div class="container">
                    <div className="user_element">
                    <video class="vid" muted ref={userVideo} autoPlay playsInline></video>
                    <h3>{name}</h3>
                    </div>
                    {peers.map((peer, index) => {
                        return (
                            <Video key={index} peer={peer} />
                        );
                    })}
                </div>
                
                <div class="chatbox">
                    <div class="msgs">
                    {

                        messages.map((message,index)=>{
                        if (message.id===yourid)
                        {
                            return(
                            <div class="myMessage" key={index}>
                            <div class="entry">
                            <p><u>{message.name}</u></p>
                            <button >
                            {message.body}
                            </button>
                            </div></div>
                            )
                        }
                        else{
                            return(
                            <div class="partnerMessage" key={index}>
                            <div class="entry">
                                <p><u>{message.name}</u></p>
                                <button >
                                {message.body}
                            </button>
                            </div></div>
                            )
                        }
                        })}
                    </div>
                
                    <div>
                    <form onSubmit={sendMessage}>
                        <textarea value={message} rows="2" placeholder="Enter Your Message" onChange={handleMsgChange} />
                        <button>Send Msg</button>
                    </form>
                    </div>
                </div>
                
            </div>


        </div>
        
    );
};

export default Room;
