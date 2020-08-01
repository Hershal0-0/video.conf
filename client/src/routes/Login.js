import React,{useState,useRef,useEffect} from "react";
import {GoogleLogin} from "react-google-login"
const Login=(props)=>{
    const [name,setName]=useState("")
    const [email,setEmail]=useState("")
    function responseGoogle(response){
        setName(response.profileObj.name)
        setEmail(response.profileObj.email)
        console.log(name)
        console.loh(email)
    }
    return(
        <GoogleLogin
    clientId="89716141198-ce0j9e8agn9j070ve94onk1gin5pafn1.apps.googleusercontent.com"
    buttonText="Login"
    onSuccess={responseGoogle}
    onFailure={responseGoogle}
    cookiePolicy={'single_host_origin'}
  />
    )
}






export default Login