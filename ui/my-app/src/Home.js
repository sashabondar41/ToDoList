import MD5 from "crypto-js/md5";
import {variables} from './Variables.js';
import React,{Component} from 'react';
import Swal from 'sweetalert2';
import {UserSaves} from './UserSaves';
import {Route, Switch, Redirect} from 'react-router-dom';



export class Home extends Component{
    constructor(props){
        super(props);
        this.state={
            users:[],
            LastName:"",
            FirstName:"",
            PasswordEncoded:"",
            Login:"",
            RepeatedPassword:"",
            login:1,
        }
    }
    
    componentDidMount(){
        this.setState({users:[]});
    }

    changeFirstName=(e)=>{
        this.setState({FirstName:e.target.value});
    }

    changeLastName=(e)=>{
        this.setState({LastName:e.target.value})
    }
    changeLogin=(e)=>{
        this.setState({Login:e.target.value})
    }

    changePassword=(e)=>{
        this.setState({PasswordEncoded:e.target.value});
    }
    changeRepeatedPassword=(e)=>{
        this.setState({RepeatedPassword:e.target.value});   
    }

    proceed(){
        fetch(variables.API_URL+'user/login',{
            method:'POST',
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                Login:this.state.Login,
                Password:MD5(this.state.PasswordEncoded).toString()
            })
        })
        .then(res=>res.json())
        .then((data)=>{
            this.setState({login:1});
            this.refs.inputLogin.value = "";
            this.refs.inputPassword.value = "";
            this.setState({users:data});
            if (this.state.users.length == 1){
                Swal.fire(
                    'Wow!',
                    'Login succesfully!',
                    'success'
                )
            }else{
                Swal.fire(
                    'Ooops...',
                    'Wrong login or password',
                    'error'
                  )
            }
        },(error)=>{
            Swal.fire(
                'Ooops...',
                'Something went wrong...',
                'error'
              )
        })
    }


    createUser(){
        if(this.state.Login.length < 6){
            Swal.fire(
                'Ooops...',
                'Login is too short',
                'error'
            );
        }else if(this.state.PasswordEncoded.length < 8){
            Swal.fire(
                'Ooops...',
                'Password is too short',
                'error'
            );
        }else if (this.state.PasswordEncoded != this.state.RepeatedPassword){
            Swal.fire(
                'Ooops...',
                'Passwords are not equal',
                'error'
            );
        }else{
            fetch(variables.API_URL+'user/login')
            .then(response=>response.json())
            .then(data=>{
                var logins = [];
                data.forEach(element => {
                logins.push(element["Login"])
                });
                if (logins.includes(this.state.Login)){
                    Swal.fire(
                        'Ooops...',
                        'Login already taken',
                        'error'
                    );
                }else{
                    fetch(variables.API_URL+'user',{
                        method:'POST',
                        headers:{
                            'Accept':'application/json',
                            'Content-Type':'application/json'
                        },
                        body:JSON.stringify({
                            Login:this.state.Login,
                            LastName:this.state.LastName,
                            FirstName:this.state.FirstName,
                            Password:this.state.PasswordEncoded,
                            Photo:"anonymous.png"
                        })
                    })
                    .then(res=>res.json())
                    .then((result)=>{
                        this.setState({login:1});
                        if (result == "Added Succesfully"){
                            Swal.fire(
                                'Success!',
                                'Your account has been created',
                                'success'
                            )
                        }else{
                            console.log(result);
                            Swal.fire(
                                'Ooops...',
                                'Something went wrong...',
                                'error'
                            )
                        }
                    },(error)=>{
                        Swal.fire(
                            'Ooops...',
                            'Something went wrong...',
                            'error'
                        )
                    })
                }    
            });
        }
        this.refs.inputLogin.value = "";
        this.refs.inputLastName.value = "";
        this.refs.inputFirstName.value = "";
        this.refs.inputPassword.value = "";
        this.refs.repeatPassword.value="";
    }

    render(){
        var {
            login,
        }=this.state;
        if (this.state.users.length == 1){
            return <Redirect to={{
                pathname:"/user",
                state: this.state.users[0]["UserId"]
            }} />
        }
        return(
<div className="App container">
<h2 className="d-flex justify-content-center m-3">
    <form>
        {login==1?
        <>
        <label>Login</label>
        <div className="form-group">
            <input type="login" className="form-control" id="lastname" placeholder="Enter login" ref="inputLogin" onChange={this.changeLogin}></input>
        </div>
        <div className="form-group">
            <input type="password" className="form-control" id="InputPassword" placeholder="Enter Password" ref="inputPassword" onChange={this.changePassword}></input>
        </div>
        <div className="form-group">
        <button type="button" 
            className="btn btn-primary m-2 float-center"
            onClick={()=>this.proceed()}>Submit</button>
        </div>
        </>
        :
        <>
        <label>Registration</label>
        <div className="form-group">
            <input type="login" className="form-control" id="lastname" placeholder="Enter login" ref="inputLogin" onChange={this.changeLogin}></input>
        </div>
        <div className="form-group">
            <input type="lastname" className="form-control" id="lastname" placeholder="Enter last name" ref="inputLastName" onChange={this.changeLastName}></input>
        </div>
        <div className="form-group">
            <input type="firstname" className="form-control" id="firstname" placeholder="Enter first name" ref="inputFirstName" onChange={this.changeFirstName}></input>
        </div>
        <div className="form-group">
            <input type="password" className="form-control" id="InputPassword" placeholder="Enter Password" ref="inputPassword" onChange={this.changePassword}></input>
        </div>
        <div className="form-group">
            <input type="password" className="form-control" id="RepeatPassword" placeholder="Repeat password" ref="repeatPassword" onChange={this.changeRepeatedPassword}></input>
        </div>
        <div className="form-group">
        <button type="button" 
            className="btn btn-primary m-2 float-center"
            onClick={()=>this.createUser()}>Submit</button>
        </div>
        </>}
        <div className="form-group">
        <button type="button"
        className="btn btn-primary m-2 float-center"
        onClick={()=>this.setState({login:1})}>
            Login
        </button>
        <button type="button"
        className="btn btn-primary m-2 float-center"
        onClick={()=>this.setState({login:0})}>
            Register
        </button>
        </div>
    </form>
</h2>
<Switch> 
    <Route path='/user' component={UserSaves}/>
</Switch>
</div>
        )
    }
}